// Copyright (c) Konstantin Komelin and other contributors
// SPDX-License-Identifier: MIT

module medals::medals;

use std::string::{utf8, String};
use sui::display;
use sui::dynamic_field as field;
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

const EUnsupportedMedal: u64 = 0;
const EMedalAlreadyClaimed: u64 = 1;
const EEmptyProof: u64 = 2;

public struct Medal has key {
    id: UID,
    medal_kind: u8,
    slug: String,
    name: String,
    description: String,
    rarity: String,
    image_url: String,
    proof: String,
    awarded_at_ms: u64,
}

public struct MedalRegistry has key {
    id: UID,
}

public struct ClaimKey has copy, drop, store {
    owner: address,
    medal_kind: u8,
}

public struct EventRegistryCreated has copy, drop {
    registry_id: ID,
}

public struct EventMedalClaimed has copy, drop {
    medal_id: ID,
    owner: address,
    medal_kind: u8,
}

public struct MEDALS has drop {}

fun init(otw: MEDALS, ctx: &mut TxContext) {
    let keys = vector[
        utf8(b"name"),
        utf8(b"description"),
        utf8(b"image_url"),
        utf8(b"project_url"),
        utf8(b"creator"),
        utf8(b"rarity"),
        utf8(b"achievement_key"),
        utf8(b"proof"),
    ];

    let values = vector[
        utf8(b"{name}"),
        utf8(b"{description}"),
        utf8(b"{image_url}"),
        utf8(b"https://frontier-chronicle.vercel.app"),
        utf8(b"Frontier Chronicle"),
        utf8(b"{rarity}"),
        utf8(b"{slug}"),
        utf8(b"{proof}"),
    ];

    let publisher = package::claim(otw, ctx);
    let mut medal_display = display::new_with_fields<Medal>(
        &publisher,
        keys,
        values,
        ctx,
    );
    display::update_version(&mut medal_display);

    let registry = MedalRegistry {
        id: object::new(ctx),
    };

    emit(EventRegistryCreated {
        registry_id: registry.id.to_inner(),
    });

    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(medal_display, ctx.sender());
    transfer::share_object(registry);
}

public fun claim_medal(
    registry: &mut MedalRegistry,
    medal_kind: u8,
    proof: String,
    ctx: &mut TxContext,
) {
    assert_supported_medal(medal_kind);
    assert!(proof != utf8(b""), EEmptyProof);

    let owner = tx_context::sender(ctx);
    let claim_key = ClaimKey { owner, medal_kind };
    assert!(!field::exists_(&registry.id, claim_key), EMedalAlreadyClaimed);
    field::add(&mut registry.id, claim_key, true);

    let medal = new_medal(medal_kind, proof, ctx);
    let medal_id = medal.id.to_inner();

    emit(EventMedalClaimed {
        medal_id,
        owner,
        medal_kind,
    });

    transfer::transfer(medal, owner);
}

public fun medal_kind(medal: &Medal): u8 {
    medal.medal_kind
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

public fun proof(medal: &Medal): String {
    medal.proof
}

public fun awarded_at_ms(medal: &Medal): u64 {
    medal.awarded_at_ms
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

fun new_medal(medal_kind: u8, proof: String, ctx: &mut TxContext): Medal {
    Medal {
        id: object::new(ctx),
        medal_kind,
        slug: slug_for(medal_kind),
        name: name_for(medal_kind),
        description: description_for(medal_kind),
        rarity: rarity_for(medal_kind),
        image_url: image_for(medal_kind),
        proof,
        awarded_at_ms: tx_context::epoch_timestamp_ms(ctx),
    }
}

fun slug_for(medal_kind: u8): String {
    if (medal_kind == BLOODLUST_BUTCHER) {
        utf8(b"bloodlust-butcher")
    } else if (medal_kind == VOID_PIONEER) {
        utf8(b"void-pioneer")
    } else if (medal_kind == GALACTIC_COURIER) {
        utf8(b"galactic-courier")
    } else if (medal_kind == TURRET_SENTRY) {
        utf8(b"turret-sentry")
    } else if (medal_kind == ASSEMBLY_PIONEER) {
        utf8(b"assembly-pioneer")
    } else if (medal_kind == TURRET_ANCHOR) {
        utf8(b"turret-anchor")
    } else if (medal_kind == SSU_TRADER) {
        utf8(b"ssu-trader")
    } else if (medal_kind == FUEL_FEEDER) {
        utf8(b"fuel-feeder")
    } else {
        abort EUnsupportedMedal
    }
}

fun name_for(medal_kind: u8): String {
    if (medal_kind == BLOODLUST_BUTCHER) {
        utf8(b"Bloodlust Butcher")
    } else if (medal_kind == VOID_PIONEER) {
        utf8(b"Void Pioneer")
    } else if (medal_kind == GALACTIC_COURIER) {
        utf8(b"Galactic Courier")
    } else if (medal_kind == TURRET_SENTRY) {
        utf8(b"Turret Sentry")
    } else if (medal_kind == ASSEMBLY_PIONEER) {
        utf8(b"Assembly Pioneer")
    } else if (medal_kind == TURRET_ANCHOR) {
        utf8(b"Turret Anchor")
    } else if (medal_kind == SSU_TRADER) {
        utf8(b"SSU Trader")
    } else if (medal_kind == FUEL_FEEDER) {
        utf8(b"Fuel Feeder")
    } else {
        abort EUnsupportedMedal
    }
}

fun description_for(medal_kind: u8): String {
    if (medal_kind == BLOODLUST_BUTCHER) {
        utf8(b"Recorded five confirmed killmail attacks in the frontier.")
    } else if (medal_kind == VOID_PIONEER) {
        utf8(b"Anchored the first piece of sovereign infrastructure in deep space.")
    } else if (medal_kind == GALACTIC_COURIER) {
        utf8(b"Completed ten verified gate jumps and kept the frontier supplied.")
    } else if (medal_kind == TURRET_SENTRY) {
        utf8(b"Deployed or operated turrets three times, defending the frontier.")
    } else if (medal_kind == ASSEMBLY_PIONEER) {
        utf8(b"Interacted with Smart Assembly three times, building the frontier infrastructure.")
    } else if (medal_kind == TURRET_ANCHOR) {
        utf8(b"Permanently anchored three turrets, staking sovereign claim over contested space.")
    } else if (medal_kind == SSU_TRADER) {
        utf8(b"Completed five deposit or withdrawal operations through a Smart Storage Unit.")
    } else if (medal_kind == FUEL_FEEDER) {
        utf8(b"Fed fuel to a network node five times, keeping the frontier powered.")
    } else {
        abort EUnsupportedMedal
    }
}

fun rarity_for(medal_kind: u8): String {
    if (medal_kind == BLOODLUST_BUTCHER) {
        utf8(b"Legendary")
    } else if (medal_kind == VOID_PIONEER) {
        utf8(b"Epic")
    } else if (medal_kind == GALACTIC_COURIER) {
        utf8(b"Rare")
    } else if (medal_kind == TURRET_SENTRY) {
        utf8(b"Uncommon")
    } else if (medal_kind == ASSEMBLY_PIONEER) {
        utf8(b"Uncommon")
    } else if (medal_kind == TURRET_ANCHOR) {
        utf8(b"Rare")
    } else if (medal_kind == SSU_TRADER) {
        utf8(b"Uncommon")
    } else if (medal_kind == FUEL_FEEDER) {
        utf8(b"Uncommon")
    } else {
        abort EUnsupportedMedal
    }
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
public fun init_for_testing(ctx: &mut TxContext) {
    init(MEDALS {}, ctx);
}

#[test_only]
public fun destroy_for_testing(medal: Medal) {
    let Medal {
        id,
        medal_kind: _,
        slug: _,
        name: _,
        description: _,
        rarity: _,
        image_url: _,
        proof: _,
        awarded_at_ms: _,
    } = medal;

    object::delete(id);
}

#[test_only]
public fun bloodlust_butcher(): u8 {
    BLOODLUST_BUTCHER
}

#[test_only]
public fun void_pioneer(): u8 {
    VOID_PIONEER
}

#[test_only]
public fun galactic_courier(): u8 {
    GALACTIC_COURIER
}

#[test_only]
public fun turret_sentry(): u8 {
    TURRET_SENTRY
}

#[test_only]
public fun assembly_pioneer(): u8 {
    ASSEMBLY_PIONEER
}

#[test_only]
public fun turret_anchor(): u8 {
    TURRET_ANCHOR
}

#[test_only]
public fun ssu_trader(): u8 {
    SSU_TRADER
}

#[test_only]
public fun fuel_feeder(): u8 {
    FUEL_FEEDER
}
