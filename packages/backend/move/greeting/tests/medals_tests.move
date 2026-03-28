#[test_only]
module medals::medals_tests;

use medals::medals;
use std::string::{utf8, String};
use sui::test_scenario as ts;

const TEST_PROOF_DIGEST: vector<u8> =
    x"000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
const TEST_SIGNER_PUBLIC_KEY: vector<u8> =
    x"79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664";
const TEST_SIGNATURE: vector<u8> =
    x"9a0e1ef40d4f97d5ac16645b1785f3c23127fa67ac0344b38fd5122c817c45f2a9d9dad3243104eacc7fed1b91dee5a329d63ab654e71418ba78142bc4556e00";

fun test_nonce(): vector<u8> {
    x"09080706"
}

fun test_evidence_uri(): String {
    utf8(b"https://frontier.example/evidence/1")
}

#[test]
fun test_verify_claim_signature_payload() {
    let payload = medals::sample_claim_payload_for_testing();

    assert!(
        medals::verify_claim_signature_for_testing(
            &payload,
            TEST_SIGNER_PUBLIC_KEY,
            TEST_SIGNATURE,
        ),
        0,
    );
}

#[test]
fun test_verify_claim_signature_rejects_tampered_signature() {
    let payload = medals::sample_claim_payload_for_testing();

    assert!(
        !medals::verify_claim_signature_for_testing(
            &payload,
            TEST_SIGNER_PUBLIC_KEY,
            x"9b0e1ef40d4f97d5ac16645b1785f3c23127fa67ac0344b38fd5122c817c45f2a9d9dad3243104eacc7fed1b91dee5a329d63ab654e71418ba78142bc4556e00",
        ),
        0,
    );
}

#[test]
fun test_claim_medal_with_test_ticket() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let mut registry: medals::MedalRegistry = ts.take_shared();
    let template_id = medals::active_template_id(&registry, medals::bloodlust_butcher());
    let template: medals::MedalTemplate = ts.take_shared_by_id(template_id);
    medals::claim_medal_with_test_ticket(
        &mut registry,
        &template,
        TEST_PROOF_DIGEST,
        test_evidence_uri(),
        1000,
        test_nonce(),
        ts.ctx(),
    );
    ts::return_shared(registry);
    ts::return_shared(template);

    ts.next_tx(owner);
    let medal = ts.take_from_sender<medals::Medal>();
    assert!(medals::medal_kind(&medal) == medals::bloodlust_butcher(), 0);
    assert!(medals::template_version(&medal) == 1, 1);
    assert!(medals::name(&medal) == b"Bloodlust Butcher".to_string(), 2);
    assert!(medals::rarity(&medal) == b"Legendary".to_string(), 3);
    assert!(medals::proof_digest(&medal) == TEST_PROOF_DIGEST, 4);
    assert!(medals::evidence_uri(&medal) == test_evidence_uri(), 5);

    medals::destroy_for_testing(medal);
    ts.end();
}

#[test]
fun test_add_and_remove_signer() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let admin_cap = ts.take_from_sender<medals::AdminCap>();
    let mut registry: medals::MedalRegistry = ts.take_shared();
    medals::add_signer(&admin_cap, &mut registry, TEST_SIGNER_PUBLIC_KEY);
    medals::remove_signer(&admin_cap, &mut registry, TEST_SIGNER_PUBLIC_KEY);
    ts::return_shared(registry);
    medals::destroy_admin_cap_for_testing(admin_cap);

    ts.end();
}

#[test]
fun test_deactivate_template() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let admin_cap = ts.take_from_sender<medals::AdminCap>();
    let mut registry: medals::MedalRegistry = ts.take_shared();
    let template_id = medals::active_template_id(&registry, medals::turret_sentry());
    let mut template: medals::MedalTemplate = ts.take_shared_by_id(template_id);
    medals::deactivate_medal_template(&admin_cap, &mut registry, &mut template);
    ts::return_shared(registry);
    ts::return_shared(template);
    medals::destroy_admin_cap_for_testing(admin_cap);

    ts.end();
}

#[test]
fun test_admin_mint_all_eight_medals() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let admin_cap = ts.take_from_sender<medals::AdminCap>();

    let medal_kinds = vector[
        medals::bloodlust_butcher(),
        medals::void_pioneer(),
        medals::galactic_courier(),
        medals::turret_sentry(),
        medals::assembly_pioneer(),
        medals::turret_anchor(),
        medals::ssu_trader(),
        medals::fuel_feeder(),
    ];

    let expected_names = vector[
        b"Bloodlust Butcher".to_string(),
        b"Void Pioneer".to_string(),
        b"Galactic Courier".to_string(),
        b"Turret Sentry".to_string(),
        b"Assembly Pioneer".to_string(),
        b"Turret Anchor".to_string(),
        b"SSU Trader".to_string(),
        b"Fuel Feeder".to_string(),
    ];

    let expected_rarities = vector[
        b"Legendary".to_string(),
        b"Epic".to_string(),
        b"Rare".to_string(),
        b"Uncommon".to_string(),
        b"Uncommon".to_string(),
        b"Rare".to_string(),
        b"Uncommon".to_string(),
        b"Uncommon".to_string(),
    ];

    let mut i = 0;
    while (i < medal_kinds.length()) {
        let registry: medals::MedalRegistry = ts.take_shared();
        let template_id = medals::active_template_id(&registry, medal_kinds[i]);
        let template: medals::MedalTemplate = ts.take_shared_by_id(template_id);

        medals::admin_mint(&admin_cap, &template, owner, ts.ctx());

        ts::return_shared(registry);
        ts::return_shared(template);
        ts.next_tx(owner);

        let medal = ts.take_from_sender<medals::Medal>();
        assert!(medals::medal_kind(&medal) == medal_kinds[i], i);
        assert!(medals::name(&medal) == expected_names[i], i + 100);
        assert!(medals::rarity(&medal) == expected_rarities[i], i + 200);
        assert!(medals::evidence_uri(&medal) == b"admin-mint".to_string(), i + 300);

        medals::destroy_for_testing(medal);
        i = i + 1;
    };

    medals::destroy_admin_cap_for_testing(admin_cap);
    ts.end();
}

#[test]
fun test_public_mint_all_eight_medals() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let medal_kinds = vector[
        medals::bloodlust_butcher(),
        medals::void_pioneer(),
        medals::galactic_courier(),
        medals::turret_sentry(),
        medals::assembly_pioneer(),
        medals::turret_anchor(),
        medals::ssu_trader(),
        medals::fuel_feeder(),
    ];

    let expected_names = vector[
        b"Bloodlust Butcher".to_string(),
        b"Void Pioneer".to_string(),
        b"Galactic Courier".to_string(),
        b"Turret Sentry".to_string(),
        b"Assembly Pioneer".to_string(),
        b"Turret Anchor".to_string(),
        b"SSU Trader".to_string(),
        b"Fuel Feeder".to_string(),
    ];

    let mut i = 0;
    while (i < medal_kinds.length()) {
        let mut registry: medals::MedalRegistry = ts.take_shared();
        let template_id = medals::active_template_id(&registry, medal_kinds[i]);
        let template: medals::MedalTemplate = ts.take_shared_by_id(template_id);

        medals::mint_medal_nft(&mut registry, &template, ts.ctx());

        ts::return_shared(registry);
        ts::return_shared(template);
        ts.next_tx(owner);

        let medal = ts.take_from_sender<medals::Medal>();
        assert!(medals::medal_kind(&medal) == medal_kinds[i], i);
        assert!(medals::name(&medal) == expected_names[i], i + 100);
        assert!(medals::evidence_uri(&medal) == b"public-mint".to_string(), i + 200);

        medals::destroy_for_testing(medal);
        i = i + 1;
    };

    ts.end();
}

#[test, expected_failure(abort_code = 1)]
fun test_cannot_public_mint_same_medal_twice() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let mut registry: medals::MedalRegistry = ts.take_shared();
    let template_id = medals::active_template_id(&registry, medals::bloodlust_butcher());
    let template: medals::MedalTemplate = ts.take_shared_by_id(template_id);
    medals::mint_medal_nft(&mut registry, &template, ts.ctx());
    medals::mint_medal_nft(&mut registry, &template, ts.ctx());

    ts::return_shared(registry);
    ts::return_shared(template);
    ts.end();
}
