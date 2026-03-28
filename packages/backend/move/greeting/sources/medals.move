module medals::medals;

use std::bcs;
use std::string::{utf8, String};
use sui::display;
use sui::dynamic_field as field;
use sui::ed25519;
use sui::event::emit;
use sui::package;

const BLOODLUST_BUTCHER: u8 = 1;
const VOID_PIONEER: u8 = 2;
const GALACTIC_COURIER: u8 = 3;
const TURRET_SENTRY: u8 = 4;
const ASSEMBLY_PIONEER: u8 = 5;
const TURRET_ANCHOR: u8 = 6;
const SSU_TRADER: u8 = 7;
const FUEL_FEEDER: u8 = 8;

const DOMAIN_SEPARATOR: vector<u8> = b"frontier-chronicle-claim-v1";
const PROOF_DIGEST_LENGTH: u64 = 32;
const ED25519_PUBLIC_KEY_LENGTH: u64 = 32;
const ED25519_SIGNATURE_LENGTH: u64 = 64;

const EUnsupportedMedal: u64 = 0;
const EMedalAlreadyClaimed: u64 = 1;
const EEmptyProofDigest: u64 = 2;
const EInvalidSigner: u64 = 3;
const EInvalidSignature: u64 = 4;
const EClaimExpired: u64 = 5;
const ENonceAlreadyUsed: u64 = 6;
const ETemplateInactive: u64 = 7;
const ETemplateAlreadyActive: u64 = 8;
const ESignerAlreadyRegistered: u64 = 9;
const ESignerNotRegistered: u64 = 10;
const EInvalidDigestLength: u64 = 11;
const EEmptyNonce: u64 = 12;
const EEmptyEvidenceUri: u64 = 13;
const EInvalidTemplateVersion: u64 = 14;
const EInvalidSignerLength: u64 = 15;
const EInvalidSignatureLength: u64 = 16;

public struct Medal has key {
    id: object::UID,
    medal_kind: u8,
    template_version: u64,
    template_id: object::ID,
    slug: String,
    name: String,
    description: String,
    rarity: String,
    image_url: String,
    proof_digest: vector<u8>,
    evidence_uri: String,
    awarded_at_ms: u64,
}

public struct MedalRegistry has key {
    id: object::UID,
}

public struct AdminCap has key {
    id: object::UID,
}

public struct MedalTemplate has key, store {
    id: object::UID,
    medal_kind: u8,
    template_version: u64,
    slug: String,
    name: String,
    description: String,
    rarity: String,
    image_url: String,
    active: bool,
}

public struct ClaimPayload has drop, store {
    registry_id: address,
    template_id: address,
    claimer: address,
    medal_kind: u8,
    template_version: u64,
    proof_digest: vector<u8>,
    evidence_uri: String,
    issued_at_ms: u64,
    deadline_ms: u64,
    nonce: vector<u8>,
}

public struct ClaimKey has copy, drop, store {
    owner: address,
    medal_kind: u8,
}

public struct NonceKey has copy, drop, store {
    owner: address,
    nonce: vector<u8>,
}

public struct SignerKey has copy, drop, store {
    public_key: vector<u8>,
}

public struct TemplateKey has copy, drop, store {
    medal_kind: u8,
}

public struct EventRegistryCreated has copy, drop {
    registry_id: object::ID,
}

public struct EventMedalTemplateAdded has copy, drop {
    template_id: object::ID,
    medal_kind: u8,
    template_version: u64,
    slug: String,
}

public struct EventMedalTemplateDeactivated has copy, drop {
    template_id: object::ID,
    medal_kind: u8,
    template_version: u64,
}

public struct EventSignerRotated has copy, drop {
    public_key: vector<u8>,
    enabled: bool,
}

public struct EventMedalClaimed has copy, drop {
    medal_id: object::ID,
    owner: address,
    template_id: object::ID,
    medal_kind: u8,
    template_version: u64,
    proof_digest: vector<u8>,
}

public struct MEDALS has drop {}

fun init(otw: MEDALS, ctx: &mut tx_context::TxContext) {
    let keys = vector[
        utf8(b"name"),
        utf8(b"description"),
        utf8(b"image_url"),
        utf8(b"project_url"),
        utf8(b"creator"),
        utf8(b"rarity"),
        utf8(b"achievement_key"),
        utf8(b"evidence_uri"),
    ];

    let values = vector[
        utf8(b"{name}"),
        utf8(b"{description}"),
        utf8(b"{image_url}"),
        utf8(b"https://frontier-chronicle.vercel.app"),
        utf8(b"Frontier Chronicle"),
        utf8(b"{rarity}"),
        utf8(b"{slug}"),
        utf8(b"{evidence_uri}"),
    ];

    let publisher = package::claim(otw, ctx);
    let mut medal_display = display::new_with_fields<Medal>(&publisher, keys, values, ctx);
    display::update_version(&mut medal_display);

    let mut registry = MedalRegistry {
        id: object::new(ctx),
    };
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    add_default_templates(&mut registry, ctx);

    emit(EventRegistryCreated {
        registry_id: registry.id.to_inner(),
    });

    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(medal_display, ctx.sender());
    transfer::transfer(admin_cap, ctx.sender());
    transfer::share_object(registry);
}

public fun add_signer(
    _admin_cap: &AdminCap,
    registry: &mut MedalRegistry,
    public_key: vector<u8>,
) {
    assert!(public_key.length() == ED25519_PUBLIC_KEY_LENGTH, EInvalidSignerLength);

    let signer_key = SignerKey {
        public_key: copy public_key,
    };
    assert!(!field::exists_(&registry.id, signer_key), ESignerAlreadyRegistered);
    field::add(&mut registry.id, signer_key, true);

    emit(EventSignerRotated {
        public_key,
        enabled: true,
    });
}

public fun remove_signer(
    _admin_cap: &AdminCap,
    registry: &mut MedalRegistry,
    public_key: vector<u8>,
) {
    let signer_key = SignerKey {
        public_key: copy public_key,
    };
    assert!(field::exists_(&registry.id, signer_key), ESignerNotRegistered);
    let _enabled = field::remove<SignerKey, bool>(&mut registry.id, signer_key);

    emit(EventSignerRotated {
        public_key,
        enabled: false,
    });
}

public fun add_medal_template(
    _admin_cap: &AdminCap,
    registry: &mut MedalRegistry,
    medal_kind: u8,
    template_version: u64,
    slug: String,
    name: String,
    description: String,
    rarity: String,
    image_url: String,
    ctx: &mut tx_context::TxContext,
) {
    assert_supported_medal(medal_kind);
    assert!(template_version > 0, EInvalidTemplateVersion);

    let template_key = TemplateKey { medal_kind };
    assert!(!field::exists_(&registry.id, template_key), ETemplateAlreadyActive);

    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind,
            template_version,
            slug,
            name,
            description,
            rarity,
            image_url,
            active: true,
        },
    );
}

public fun deactivate_medal_template(
    _admin_cap: &AdminCap,
    registry: &mut MedalRegistry,
    template: &mut MedalTemplate,
) {
    assert!(template.active, ETemplateInactive);

    let template_key = TemplateKey {
        medal_kind: template.medal_kind,
    };
    let active_template_id = field::remove<TemplateKey, object::ID>(&mut registry.id, template_key);

    assert!(active_template_id == template.id.to_inner(), ETemplateInactive);

    template.active = false;

    emit(EventMedalTemplateDeactivated {
        template_id: template.id.to_inner(),
        medal_kind: template.medal_kind,
        template_version: template.template_version,
    });
}

public fun claim_medal(
    registry: &mut MedalRegistry,
    template: &MedalTemplate,
    proof_digest: vector<u8>,
    evidence_uri: String,
    issued_at_ms: u64,
    deadline_ms: u64,
    nonce: vector<u8>,
    signer_public_key: vector<u8>,
    signature: vector<u8>,
    ctx: &mut tx_context::TxContext,
) {
    assert!(template.active, ETemplateInactive);
    assert!(proof_digest.length() > 0, EEmptyProofDigest);
    assert!(proof_digest.length() == PROOF_DIGEST_LENGTH, EInvalidDigestLength);
    assert!(!evidence_uri.is_empty(), EEmptyEvidenceUri);
    assert!(!nonce.is_empty(), EEmptyNonce);
    assert!(signer_public_key.length() == ED25519_PUBLIC_KEY_LENGTH, EInvalidSignerLength);
    assert!(signature.length() == ED25519_SIGNATURE_LENGTH, EInvalidSignatureLength);

    let owner = tx_context::sender(ctx);
    let claim_key = ClaimKey {
        owner,
        medal_kind: template.medal_kind,
    };
    assert!(!field::exists_(&registry.id, claim_key), EMedalAlreadyClaimed);

    let nonce_key = NonceKey {
        owner,
        nonce: copy nonce,
    };
    assert!(!field::exists_(&registry.id, nonce_key), ENonceAlreadyUsed);

    let signer_key = SignerKey {
        public_key: copy signer_public_key,
    };
    assert!(field::exists_(&registry.id, signer_key), EInvalidSigner);

    let now_ms = tx_context::epoch_timestamp_ms(ctx);
    assert!(deadline_ms >= now_ms, EClaimExpired);

    let payload = ClaimPayload {
        registry_id: registry.id.to_address(),
        template_id: template.id.to_address(),
        claimer: owner,
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        proof_digest: copy proof_digest,
        evidence_uri: copy evidence_uri,
        issued_at_ms,
        deadline_ms,
        nonce: copy nonce,
    };
    let message = claim_message_bytes(&payload);
    assert!(
        ed25519::ed25519_verify(&signature, &signer_public_key, &message),
        EInvalidSignature,
    );

    mint_medal(
        registry,
        template,
        owner,
        proof_digest,
        evidence_uri,
        now_ms,
        nonce,
        ctx,
    );
}

public fun admin_mint(
    _admin_cap: &AdminCap,
    template: &MedalTemplate,
    recipient: address,
    ctx: &mut tx_context::TxContext,
) {
    assert!(template.active, ETemplateInactive);

    let now_ms = tx_context::epoch_timestamp_ms(ctx);
    let medal = Medal {
        id: object::new(ctx),
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        template_id: template.id.to_inner(),
        slug: template.slug,
        name: template.name,
        description: template.description,
        rarity: template.rarity,
        image_url: template.image_url,
        proof_digest: vector[],
        evidence_uri: utf8(b"admin-mint"),
        awarded_at_ms: now_ms,
    };

    emit(EventMedalClaimed {
        medal_id: medal.id.to_inner(),
        owner: recipient,
        template_id: template.id.to_inner(),
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        proof_digest: vector[],
    });

    transfer::transfer(medal, recipient);
}

public fun mint_medal_nft(
    registry: &mut MedalRegistry,
    template: &MedalTemplate,
    ctx: &mut tx_context::TxContext,
) {
    assert!(template.active, ETemplateInactive);
    let owner = tx_context::sender(ctx);
    let claim_key = ClaimKey {
        owner,
        medal_kind: template.medal_kind,
    };
    assert!(!field::exists_(&registry.id, claim_key), EMedalAlreadyClaimed);
    field::add(&mut registry.id, claim_key, true);

    let now_ms = tx_context::epoch_timestamp_ms(ctx);
    let medal = Medal {
        id: object::new(ctx),
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        template_id: template.id.to_inner(),
        slug: template.slug,
        name: template.name,
        description: template.description,
        rarity: template.rarity,
        image_url: template.image_url,
        proof_digest: vector[],
        evidence_uri: utf8(b"public-mint"),
        awarded_at_ms: now_ms,
    };
    let medal_id = medal.id.to_inner();

    emit(EventMedalClaimed {
        medal_id,
        owner,
        template_id: template.id.to_inner(),
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        proof_digest: vector[],
    });

    transfer::transfer(medal, owner);
}

fun mint_medal(
    registry: &mut MedalRegistry,
    template: &MedalTemplate,
    owner: address,
    proof_digest: vector<u8>,
    evidence_uri: String,
    awarded_at_ms: u64,
    nonce: vector<u8>,
    ctx: &mut tx_context::TxContext,
) {
    let claim_key = ClaimKey {
        owner,
        medal_kind: template.medal_kind,
    };
    let nonce_key = NonceKey {
        owner,
        nonce,
    };

    field::add(&mut registry.id, claim_key, true);
    field::add(&mut registry.id, nonce_key, true);

    let medal = Medal {
        id: object::new(ctx),
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        template_id: template.id.to_inner(),
        slug: template.slug,
        name: template.name,
        description: template.description,
        rarity: template.rarity,
        image_url: template.image_url,
        proof_digest: copy proof_digest,
        evidence_uri,
        awarded_at_ms,
    };
    let medal_id = medal.id.to_inner();

    emit(EventMedalClaimed {
        medal_id,
        owner,
        template_id: template.id.to_inner(),
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        proof_digest,
    });

    transfer::transfer(medal, owner);
}

public fun active_template_id(registry: &MedalRegistry, medal_kind: u8): object::ID {
    *field::borrow<TemplateKey, object::ID>(&registry.id, TemplateKey { medal_kind })
}

public fun medal_kind(medal: &Medal): u8 {
    medal.medal_kind
}

public fun template_version(medal: &Medal): u64 {
    medal.template_version
}

public fun slug(medal: &Medal): String {
    medal.slug
}

public fun name(medal: &Medal): String {
    medal.name
}

public fun description(medal: &Medal): String {
    medal.description
}

public fun rarity(medal: &Medal): String {
    medal.rarity
}

public fun proof_digest(medal: &Medal): vector<u8> {
    medal.proof_digest
}

public fun evidence_uri(medal: &Medal): String {
    medal.evidence_uri
}

public fun awarded_at_ms(medal: &Medal): u64 {
    medal.awarded_at_ms
}

fun claim_message_bytes(payload: &ClaimPayload): vector<u8> {
    let mut bytes = copy DOMAIN_SEPARATOR;
    bytes.append(bcs::to_bytes(payload));
    bytes
}

fun add_default_templates(registry: &mut MedalRegistry, ctx: &mut tx_context::TxContext) {
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: BLOODLUST_BUTCHER,
            template_version: 1,
            slug: utf8(b"bloodlust-butcher"),
            name: utf8(b"Bloodlust Butcher"),
            description: utf8(b"Recorded five confirmed killmail attacks in the frontier."),
            rarity: utf8(b"Legendary"),
            image_url: image_for(BLOODLUST_BUTCHER),
            active: true,
        },
    );
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: VOID_PIONEER,
            template_version: 1,
            slug: utf8(b"void-pioneer"),
            name: utf8(b"Void Pioneer"),
            description: utf8(b"Anchored the first piece of sovereign infrastructure in deep space."),
            rarity: utf8(b"Epic"),
            image_url: image_for(VOID_PIONEER),
            active: true,
        },
    );
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: GALACTIC_COURIER,
            template_version: 1,
            slug: utf8(b"galactic-courier"),
            name: utf8(b"Galactic Courier"),
            description: utf8(b"Completed ten verified gate jumps and kept the frontier supplied."),
            rarity: utf8(b"Rare"),
            image_url: image_for(GALACTIC_COURIER),
            active: true,
        },
    );
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: TURRET_SENTRY,
            template_version: 1,
            slug: utf8(b"turret-sentry"),
            name: utf8(b"Turret Sentry"),
            description: utf8(b"Deployed or operated turrets three times, defending the frontier."),
            rarity: utf8(b"Uncommon"),
            image_url: image_for(TURRET_SENTRY),
            active: true,
        },
    );
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: ASSEMBLY_PIONEER,
            template_version: 1,
            slug: utf8(b"assembly-pioneer"),
            name: utf8(b"Assembly Pioneer"),
            description: utf8(b"Interacted with Smart Assembly three times, building the frontier infrastructure."),
            rarity: utf8(b"Uncommon"),
            image_url: image_for(ASSEMBLY_PIONEER),
            active: true,
        },
    );
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: TURRET_ANCHOR,
            template_version: 1,
            slug: utf8(b"turret-anchor"),
            name: utf8(b"Turret Anchor"),
            description: utf8(b"Permanently anchored three turrets, staking sovereign claim over contested space."),
            rarity: utf8(b"Rare"),
            image_url: image_for(TURRET_ANCHOR),
            active: true,
        },
    );
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: SSU_TRADER,
            template_version: 1,
            slug: utf8(b"ssu-trader"),
            name: utf8(b"SSU Trader"),
            description: utf8(b"Completed five deposit or withdrawal operations through a Smart Storage Unit."),
            rarity: utf8(b"Uncommon"),
            image_url: image_for(SSU_TRADER),
            active: true,
        },
    );
    share_template(
        registry,
        MedalTemplate {
            id: object::new(ctx),
            medal_kind: FUEL_FEEDER,
            template_version: 1,
            slug: utf8(b"fuel-feeder"),
            name: utf8(b"Fuel Feeder"),
            description: utf8(b"Fed fuel to a network node five times, keeping the frontier powered."),
            rarity: utf8(b"Uncommon"),
            image_url: image_for(FUEL_FEEDER),
            active: true,
        },
    );
}

fun share_template(registry: &mut MedalRegistry, template: MedalTemplate) {
    let template_key = TemplateKey {
        medal_kind: template.medal_kind,
    };
    let template_id = template.id.to_inner();

    field::add(&mut registry.id, template_key, template_id);

    emit(EventMedalTemplateAdded {
        template_id,
        medal_kind: template.medal_kind,
        template_version: template.template_version,
        slug: template.slug,
    });

    transfer::share_object(template);
}

fun assert_supported_medal(medal_kind: u8) {
    assert!(
        medal_kind == BLOODLUST_BUTCHER ||
        medal_kind == VOID_PIONEER ||
        medal_kind == GALACTIC_COURIER ||
        medal_kind == TURRET_SENTRY ||
        medal_kind == ASSEMBLY_PIONEER ||
        medal_kind == TURRET_ANCHOR ||
        medal_kind == SSU_TRADER ||
        medal_kind == FUEL_FEEDER,
        EUnsupportedMedal,
    );
}

fun image_for(medal_kind: u8): String {
    if (medal_kind == BLOODLUST_BUTCHER) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMmEwYjBiIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjYzUzMDMwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE1MiIgcj0iODIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZDZkNiIgc3Ryb2tlLXdpZHRoPSIxMCIgb3BhY2l0eT0iLjc1Ii8+PHBhdGggZD0iTTE2NCA4OCAyMTQgMTk4IDE2NCAyMjggMTE0IDE5OFoiIGZpbGw9IiNmZmY1ZjUiIG9wYWNpdHk9Ii45MiIvPjxwYXRoIGQ9Ik0xNjQgODggMTgwIDE5NiAxNjQgMjI4IDE0OCAxOTZaIiBmaWxsPSIjZmVjYWNhIi8+PHRleHQgeD0iMTYwIiB5PSIyODAiIGZpbGw9IiNmZmY1ZjUiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLHNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CTE9PRExVU1Q8L3RleHQ+PC9zdmc+")
    } else if (medal_kind == VOID_PIONEER) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMDYxMjFmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMWQ0ZWQ4Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iOTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2JhZTZmZCIgc3Ryb2tlLXdpZHRoPSI4IiBvcGFjaXR5PSIuNjUiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSIxNjAiIHI9IjQ4IiBmaWxsPSIjZGJlYWZlIiBvcGFjaXR5PSIuMTYiLz48cGF0aCBkPSJNMTYwIDcwIDIwOCAxNjAgMTYwIDI1MCAxMTIgMTYwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBmMmZlIiBzdHJva2Utd2lkdGg9IjEwIi8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iMTYwIiByPSIxNiIgZmlsbD0iI2ZlZjNjNyIvPjx0ZXh0IHg9IjE2MCIgeT0iMjgwIiBmaWxsPSIjZTBmMmZlIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UElPTkVFUjwvdGV4dD48L3N2Zz4=")
    } else if (medal_kind == GALACTIC_COURIER) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMWYyOTM3Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMGY3NjZlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik03MiAxNzJoMTc2IiBzdHJva2U9IiM5OWY2ZTQiIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWRhc2hhcnJheT0iMTggMTYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNzIiIHI9IjE4IiBmaWxsPSIjY2NmYmYxIi8+PGNpcmNsZSBjeD0iMjIwIiBjeT0iMTcyIiByPSIxOCIgZmlsbD0iI2NjZmJmMSIvPjxwYXRoIGQ9Ik0xMzYgMTE4aDQ4bDM2IDU0LTM2IDU0aC00OGwzNi01NHoiIGZpbGw9IiNmMGZkZmEiIG9wYWNpdHk9Ii45Ii8+PHRleHQgeD0iMTYwIiB5PSIyODAiIGZpbGw9IiNjY2ZiZjEiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLHNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DT1VSSUVSPC90ZXh0Pjwvc3ZnPg==")
    } else if (medal_kind == TURRET_SENTRY) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMWExMjAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjYjQ1MzA5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE1MiIgcj0iNzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZjZDM0ZCIgc3Ryb2tlLXdpZHRoPSI4IiBvcGFjaXR5PSIuNjUiLz48cmVjdCB4PSIxNDgiIHk9IjgwIiB3aWR0aD0iMjQiIGhlaWdodD0iOTAiIHJ4PSI0IiBmaWxsPSIjZmVmM2M3IiBvcGFjaXR5PSIuOTIiLz48cmVjdCB4PSIxMjAiIHk9IjE0OCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iI2ZlZjNjNyIgb3BhY2l0eT0iLjkyIi8+PHJlY3QgeD0iMTA4IiB5PSIxNjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIzNiIgcng9IjMiIGZpbGw9IiNmY2QzNGQiIG9wYWNpdHk9Ii44Ii8+PHJlY3QgeD0iMTg4IiB5PSIxNjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIzNiIgcng9IjMiIGZpbGw9IiNmY2QzNGQiIG9wYWNpdHk9Ii44Ii8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iMTYwIiByPSIxNCIgZmlsbD0iI2ZlZjljMyIvPjx0ZXh0IHg9IjE2MCIgeT0iMjgwIiBmaWxsPSIjZmVmM2M3IiBmb250LXNpemU9IjIyIiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0VOVFJZPC90ZXh0Pjwvc3ZnPg==")
    } else if (medal_kind == ASSEMBLY_PIONEER) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMGYxNzJhIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzM0MTU1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjExMCIgeT0iMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSI4IiBvcGFjaXR5PSIuNyIvPjxyZWN0IHg9IjEyNiIgeT0iMTE2IiB3aWR0aD0iNjgiIGhlaWdodD0iNjgiIHJ4PSI0IiBmaWxsPSIjZjFmNWY5IiBvcGFjaXR5PSIuMTIiLz48bGluZSB4MT0iMTYwIiB5MT0iMTAwIiB4Mj0iMTYwIiB5Mj0iODAiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48bGluZSB4MT0iMjEwIiB5MT0iMTUwIiB4Mj0iMjMwIiB5Mj0iMTUwIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGxpbmUgeDE9IjE2MCIgeTE9IjIwMCIgeDI9IjE2MCIgeTI9IjIyMCIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxsaW5lIHgxPSIxMTAiIHkxPSIxNTAiIHgyPSI5MCIgeTI9IjE1MCIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjgwIiByPSIxMCIgZmlsbD0iI2UyZThmMCIvPjxjaXJjbGUgY3g9IjIzMCIgY3k9IjE1MCIgcj0iMTAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSIyMjAiIHI9IjEwIiBmaWxsPSIjZTJlOGYwIi8+PGNpcmNsZSBjeD0iOTAiIGN5PSIxNTAiIHI9IjEwIiBmaWxsPSIjZTJlOGYwIi8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iMTUwIiByPSIxOCIgZmlsbD0iI2NiZDVlMSIvPjx0ZXh0IHg9IjE2MCIgeT0iMjgwIiBmaWxsPSIjZTJlOGYwIiBmb250LXNpemU9IjIyIiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QVNTRU1CTFk8L3RleHQ+PC9zdmc+")
    } else if (medal_kind == TURRET_ANCHOR) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMWEwZjAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOTIzNzAwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjE1MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI4MCIgcng9IjQiIGZpbGw9IiNmY2QzNGQiIG9wYWNpdHk9Ii45Ii8+PHJlY3QgeD0iMTEwIiB5PSIxMjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiIHJ4PSI0IiBmaWxsPSIjZmVmM2M3IiBvcGFjaXR5PSIuOSIvPjxwYXRoIGQ9Ik0xMDAgMTQwIEwyMjAgMTQwIEwyMzAgMjAwIEw5MCAyMDBaIiBmaWxsPSIjZmNkMzRkIiBvcGFjaXR5PSIuNzUiLz48cmVjdCB4PSI5MCIgeT0iMjAwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI2ZlZjNjNyIgb3BhY2l0eT0iLjkiLz48dGV4dCB4PSIxNjAiIHk9IjI4MCIgZmlsbD0iI2ZlZjNjNyIgZm9udC1zaXplPSIyMiIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsc2VyaWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFOQ0hPUjwvdGV4dD48L3N2Zz4=")
    } else if (medal_kind == SSU_TRADER) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMDIxNjE0Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMGY3NjZlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjgwIiB5PSI5MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMjAiIHJ4PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OWY2ZTQiIHN0cm9rZS13aWR0aD0iOCIgb3BhY2l0eT0iLjciLz48bGluZSB4MT0iMTIwIiB5MT0iOTAiIHgyPSIxMjAiIHkyPSIyMTAiIHN0cm9rZT0iIzk5ZjZlNCIgc3Ryb2tlLXdpZHRoPSI1IiBvcGFjaXR5PSIuNCIvPjxsaW5lIHgxPSIxNjAiIHkxPSI5MCIgeDI9IjE2MCIgeTI9IjIxMCIgc3Ryb2tlPSIjOTlmNmU0IiBzdHJva2Utd2lkdGg9IjUiIG9wYWNpdHk9Ii40Ii8+PGxpbmUgeDE9IjIwMCIgeTE9IjkwIiB4Mj0iMjAwIiB5Mj0iMjEwIiBzdHJva2U9IiM5OWY2ZTQiIHN0cm9rZS13aWR0aD0iNSIgb3BhY2l0eT0iLjQiLz48cGF0aCBkPSJNMTYwIDIxMCBMMTYwIDI0MCBNMTQ0IDIyNiBMMTYwIDI0MCBMMTM2IDI0MCIgc3Ryb2tlPSIjY2NmYmYxIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsbD0ibm9uZSIvPjx0ZXh0IHg9IjE2MCIgeT0iMjgwIiBmaWxsPSIjY2NmYmYxIiBmb250LXNpemU9IjIyIiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VFJBREVSNC90ZXh0Pjwvc3ZnPg==")
    } else if (medal_kind == FUEL_FEEDER) {
        utf8(b"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMGYxNzJhIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzM0MTU1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIHJ4PSIzNiIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjExMCIgeT0iNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTUwIiByeD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSI4IiBvcGFjaXR5PSIuNzUiLz48cmVjdCB4PSIxNDAiIHk9IjUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjYiIHJ4PSI2IiBmaWxsPSIjOTRhM2I4IiBvcGFjaXR5PSIuOCIvPjxsaW5lIHgxPSIxMTAiIHkxPSIxMjAiIHgyPSIyMTAiIHkyPSIxMjAiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSI2IiBvcGFjaXR5PSIuNSIvPjxsaW5lIHgxPSIxMTAiIHkxPSIxNjAiIHgyPSIyMTAiIHkyPSIxNjAiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSI2IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGQ9Ik0xNjAgMjIwIEwxNjAgMjUwIE0xNDAgMjMwIEwxODAgMjMwIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWxsPSJub25lIi8+PHRleHQgeD0iMTYwIiB5PSIyODAiIGZpbGw9IiNlMmU4ZjAiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLHNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GVUVMPC90ZXh0Pjwvc3ZnPg==")
    } else {
        abort EUnsupportedMedal
    }
}

#[test_only]
public fun claim_message_bytes_for_testing(payload: &ClaimPayload): vector<u8> {
    claim_message_bytes(payload)
}

#[test_only]
public fun verify_claim_signature_for_testing(
    payload: &ClaimPayload,
    public_key: vector<u8>,
    signature: vector<u8>,
): bool {
    let message = claim_message_bytes(payload);
    ed25519::ed25519_verify(&signature, &public_key, &message)
}

#[test_only]
public fun sample_claim_payload_for_testing(): ClaimPayload {
    ClaimPayload {
        registry_id: @0x1111111111111111111111111111111111111111111111111111111111111111,
        template_id: @0x2222222222222222222222222222222222222222222222222222222222222222,
        claimer: @0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,
        medal_kind: BLOODLUST_BUTCHER,
        template_version: 1,
        proof_digest: x"000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        evidence_uri: utf8(b"https://frontier.example/evidence/1"),
        issued_at_ms: 1000,
        deadline_ms: 2000,
        nonce: x"09080706",
    }
}

#[test_only]
public fun claim_medal_with_test_ticket(
    registry: &mut MedalRegistry,
    template: &MedalTemplate,
    proof_digest: vector<u8>,
    evidence_uri: String,
    deadline_ms: u64,
    nonce: vector<u8>,
    ctx: &mut tx_context::TxContext,
) {
    assert!(template.active, ETemplateInactive);
    assert!(proof_digest.length() > 0, EEmptyProofDigest);
    assert!(proof_digest.length() == PROOF_DIGEST_LENGTH, EInvalidDigestLength);
    assert!(!evidence_uri.is_empty(), EEmptyEvidenceUri);
    assert!(!nonce.is_empty(), EEmptyNonce);

    let owner = tx_context::sender(ctx);
    let claim_key = ClaimKey {
        owner,
        medal_kind: template.medal_kind,
    };
    assert!(!field::exists_(&registry.id, claim_key), EMedalAlreadyClaimed);

    let nonce_key = NonceKey {
        owner,
        nonce: copy nonce,
    };
    assert!(!field::exists_(&registry.id, nonce_key), ENonceAlreadyUsed);

    let now_ms = tx_context::epoch_timestamp_ms(ctx);
    assert!(deadline_ms >= now_ms, EClaimExpired);

    mint_medal(
        registry,
        template,
        owner,
        proof_digest,
        evidence_uri,
        now_ms,
        nonce,
        ctx,
    );
}

#[test_only]
public fun init_for_testing(ctx: &mut tx_context::TxContext) {
    init(MEDALS {}, ctx);
}

#[test_only]
public fun destroy_for_testing(medal: Medal) {
    let Medal {
        id,
        medal_kind: _,
        template_version: _,
        template_id: _,
        slug: _,
        name: _,
        description: _,
        rarity: _,
        image_url: _,
        proof_digest: _,
        evidence_uri: _,
        awarded_at_ms: _,
    } = medal;

    object::delete(id);
}

#[test_only]
public fun destroy_admin_cap_for_testing(admin_cap: AdminCap) {
    let AdminCap { id } = admin_cap;
    object::delete(id);
}

#[test_only]
public fun bloodlust_butcher(): u8 { BLOODLUST_BUTCHER }

#[test_only]
public fun void_pioneer(): u8 { VOID_PIONEER }

#[test_only]
public fun galactic_courier(): u8 { GALACTIC_COURIER }

#[test_only]
public fun turret_sentry(): u8 { TURRET_SENTRY }

#[test_only]
public fun assembly_pioneer(): u8 { ASSEMBLY_PIONEER }

#[test_only]
public fun turret_anchor(): u8 { TURRET_ANCHOR }

#[test_only]
public fun ssu_trader(): u8 { SSU_TRADER }

#[test_only]
public fun fuel_feeder(): u8 { FUEL_FEEDER }
