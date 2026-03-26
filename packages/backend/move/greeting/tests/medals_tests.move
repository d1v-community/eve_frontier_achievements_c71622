// Copyright (c) Konstantin Komelin and other contributors
// SPDX-License-Identifier: MIT

#[test_only]
module medals::medals_tests;

use medals::medals;
use sui::test_scenario as ts;

#[test]
fun test_claim_medal() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let mut registry: medals::MedalRegistry = ts.take_shared();
    medals::claim_medal(
        &mut registry,
        medals::bloodlust_butcher(),
        b"Indexed five confirmed killmail attacks.".to_string(),
        ts.ctx(),
    );
    ts::return_shared(registry);

    ts.next_tx(owner);
    let medal = ts.take_from_sender<medals::Medal>();
    assert!(medals::medal_kind(&medal) == medals::bloodlust_butcher(), 0);
    assert!(medals::name(&medal) == b"Bloodlust Butcher".to_string(), 1);
    assert!(medals::rarity(&medal) == b"Legendary".to_string(), 2);
    assert!(
        medals::proof(&medal) == b"Indexed five confirmed killmail attacks.".to_string(),
        3,
    );
    assert!(medals::awarded_at_ms(&medal) == 0, 4);

    medals::destroy_for_testing(medal);
    ts.end();
}

#[test]
fun test_claim_turret_sentry() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let mut registry: medals::MedalRegistry = ts.take_shared();
    medals::claim_medal(
        &mut registry,
        medals::turret_sentry(),
        b"Eve Eyes indexed 3 turret operation(s).".to_string(),
        ts.ctx(),
    );
    ts::return_shared(registry);

    ts.next_tx(owner);
    let medal = ts.take_from_sender<medals::Medal>();
    assert!(medals::medal_kind(&medal) == medals::turret_sentry(), 0);
    assert!(medals::name(&medal) == b"Turret Sentry".to_string(), 1);
    assert!(medals::rarity(&medal) == b"Uncommon".to_string(), 2);

    medals::destroy_for_testing(medal);
    ts.end();
}

#[test]
fun test_claim_assembly_pioneer() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let mut registry: medals::MedalRegistry = ts.take_shared();
    medals::claim_medal(
        &mut registry,
        medals::assembly_pioneer(),
        b"Eve Eyes indexed 3 Smart Assembly interaction(s).".to_string(),
        ts.ctx(),
    );
    ts::return_shared(registry);

    ts.next_tx(owner);
    let medal = ts.take_from_sender<medals::Medal>();
    assert!(medals::medal_kind(&medal) == medals::assembly_pioneer(), 0);
    assert!(medals::name(&medal) == b"Assembly Pioneer".to_string(), 1);
    assert!(medals::rarity(&medal) == b"Uncommon".to_string(), 2);

    medals::destroy_for_testing(medal);
    ts.end();
}

#[test]
#[expected_failure(abort_code = medals::EMedalAlreadyClaimed)]
fun test_duplicate_claim_fails() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let mut registry: medals::MedalRegistry = ts.take_shared();
    medals::claim_medal(
        &mut registry,
        medals::void_pioneer(),
        b"Anchored a network node.".to_string(),
        ts.ctx(),
    );
    medals::claim_medal(
        &mut registry,
        medals::void_pioneer(),
        b"Anchored a network node twice.".to_string(),
        ts.ctx(),
    );

    ts::return_shared(registry);
    ts.end();
}

#[test]
#[expected_failure(abort_code = medals::EUnsupportedMedal)]
fun test_unknown_medal_fails() {
    let owner = @0xA;
    let mut ts = ts::begin(owner);

    {
        medals::init_for_testing(ts.ctx());
    };

    ts.next_tx(owner);
    let mut registry: medals::MedalRegistry = ts.take_shared();
    medals::claim_medal(
        &mut registry,
        99,
        b"This should never mint.".to_string(),
        ts.ctx(),
    );

    ts::return_shared(registry);
    ts.end();
}
