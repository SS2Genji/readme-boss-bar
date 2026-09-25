const handler = require('../api/index');
const assert = require('assert');

function runApiTest(query, validator, desc) {
  let statusCode = 200;
  let headers = {};
  let bodyContent = '';

  const req = { query };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { headers[k] = v; this.headers[k] = v; },
    status(c) { this.statusCode = c; statusCode = c; return this; },
    send(body) {
      bodyContent = body;
    }
  };

  handler(req, res);

  assert.strictEqual(statusCode, 200, `Expected 200 for ${desc}`);
  assert(headers['Content-Type'].includes('image/svg+xml'), `Expected SVG Content-Type for ${desc}`);
  assert.strictEqual(headers['Access-Control-Allow-Origin'], '*', `Expected CORS header for ${desc}`);
  assert(bodyContent.includes('<svg'), `Body must contain <svg for ${desc}`);
  validator(bodyContent);
  console.log(`✔ API test passed: ${desc}`);
}

console.log("=== Testing Serverless API Endpoint ===");

// 1. Classic array boss query
runApiTest(
  { boss: ["MILESTONE 1:3:3", "MILESTONE 2:5:1"] },
  (svg) => {
    assert(svg.includes("MILESTONE 1"));
    assert(svg.includes("MILESTONE 2"));
  },
  "Classic repeated boss query"
);

// 2. 5-part shorthand with multi-bar hit (3 bars per hit every 0.5s)
runApiTest(
  { boss: "RADAHN:10:2:0.5:3" },
  (svg) => {
    assert(svg.includes("RADAHN"));
    assert(svg.includes("-3 BARS"));
  },
  "5-part shorthand (RADAHN:10:2:0.5:3)"
);

// 3. Granular params override
runApiTest(
  {
    boss: "MALENIA:8:4",
    shake: "heavy",
    theme: "purple",
    interval: "0.4",
    dmg: "2",
    felled: "DEMIGOD SLAIN"
  },
  (svg) => {
    assert(svg.includes("MALENIA"));
    assert(svg.includes("DEMIGOD SLAIN"));
    assert(svg.includes("#9333ea") || svg.includes("pulse-purple"));
  },
  "Granular parameters (shake, theme, interval, dmg, felledText)"
);

// 4. Auto mode via query
runApiTest(
  { auto: "true" },
  (svg) => {
    assert(svg.includes("MARGIT"));
    assert(svg.includes("GODRICK"));
  },
  "Auto mode via ?auto=true"
);

// 5. Numbered bosses (?b1=...&b2=...)
runApiTest(
  {
    b1: "PHASE 1:4:4:0.5:1",
    b2: "PHASE 2:6:2:0.5:3",
    theme: "cyan"
  },
  (svg) => {
    assert(svg.includes("PHASE 1"));
    assert(svg.includes("PHASE 2"));
  },
  "Numbered bosses (?b1 & ?b2)"
);

// 6. Boss shorthand without hits (?boss=RADAHN:10&dmg=3&interval=0.5) drains all bars
runApiTest(
  {
    boss: "RADAHN:10",
    dmg: "3",
    interval: "0.5"
  },
  (svg) => {
    assert(svg.includes("RADAHN"));
    assert(svg.includes("drain_0_0"));
    assert(svg.includes("-3 BARS"));
    assert(svg.includes("-1 BAR"));
    assert(svg.includes("GREAT ENEMY FELLED"));
  },
  "Shorthand without hits (?boss=RADAHN:10&dmg=3&interval=0.5) drains to completion"
);

// 7. Extended 8-part shorthand (?boss=RADAHN:6:2:0.5:3:purple:heavy:CONQUEROR FELLED)
runApiTest(
  {
    boss: "RADAHN:6:2:0.5:3:purple:heavy:CONQUEROR FELLED"
  },
  (svg) => {
    assert(svg.includes("RADAHN"));
    assert(svg.includes("#9333ea"));
    assert(svg.includes("-4px, 3px")); // heavy shake
    assert(svg.includes("CONQUEROR FELLED"));
  },
  "Extended 8-part shorthand with theme, shake, and felled text"
);

// 8. Single boss query params (?name=GODFREY&bars=8&dmg=2&interval=0.4&theme=gold)
runApiTest(
  {
    name: "GODFREY",
    bars: "8",
    dmg: "2",
    interval: "0.4",
    theme: "gold"
  },
  (svg) => {
    assert(svg.includes("GODFREY"));
    assert(svg.includes("#d97706"));
    assert(svg.includes("drain_0_0"));
    assert(svg.includes("-2 BARS"));
  },
  "Single boss query parameters (?name=GODFREY&bars=8&dmg=2...)"
);

// 9. Natural numerical sorting of numbered stages (?b1, ?b2, ?b10)
runApiTest(
  {
    b10: "STAGE 10:4:4",
    b1: "STAGE 1:4:4",
    b2: "STAGE 2:4:4"
  },
  (svg) => {
    const idx1 = svg.indexOf("STAGE 1");
    const idx2 = svg.indexOf("STAGE 2");
    const idx10 = svg.indexOf("STAGE 10");
    assert(idx1 < idx2 && idx2 < idx10, "Stages must be sorted naturally (b1 < b2 < b10)");
  },
  "Natural numerical sorting for ?b1, ?b2, ?b10"
);

// 10. Hex theme without leading hash (?boss=M1:3:3&theme=a855f7)
runApiTest(
  {
    boss: "M1:3:3",
    theme: "a855f7"
  },
  (svg) => {
    assert(svg.includes("#a855f7"));
  },
  "Hex theme without leading hash (?theme=a855f7)"
);

// 11. Scoped ID parameter (?boss=M1:3:3&id=api_scope)
runApiTest(
  {
    boss: "M1:3:3",
    id: "api_scope"
  },
  (svg) => {
    assert(svg.includes("api_scope-bar-0-0"));
    assert(svg.includes("api_scope_drain_0_2"));
  },
  "Scoped ID parameter (?id=api_scope)"
);

// 12. Escaped colon in boss spec (?boss=RADAHN\: GENERAL:8:4:0.5:2)
runApiTest(
  {
    boss: "RADAHN\\: GENERAL:8:4:0.5:2"
  },
  (svg) => {
    assert(svg.includes("RADAHN: GENERAL"), "Must preserve escaped colon in boss title");
  },
  "Escaped colon in shorthand (?boss=RADAHN\\: GENERAL:8:4:0.5:2)"
);

// 13. Single boss query with explicit hits parameter (?name=RADAHN&bars=10&dmg=3&hits=2)
runApiTest(
  {
    name: "RADAHN",
    bars: "10",
    dmg: "3",
    hits: "2"
  },
  (svg) => {
    const hitsCount = (svg.match(/-3 BARS/g) || []).length;
    assert.strictEqual(hitsCount, 2, "Must execute exactly 2 hits as requested");
  },
  "Single boss with explicit hits count (?name=RADAHN&bars=10&dmg=3&hits=2)"
);

// 14. Souls aesthetic query (?style=souls)
runApiTest(
  {
    boss: "RADAHN:10:2:0.5:3",
    style: "souls"
  },
  (svg) => {
    assert(svg.includes("Cinzel"));
    assert(svg.includes("Elden Golden Cross"));
    assert(svg.includes("Golden Ember Particles"));
    assert(svg.includes("[CURRENT FOE]"));
  },
  "Souls aesthetic (?style=souls)"
);

// 15. Cyberpunk aesthetic query (?style=cyberpunk)
runApiTest(
  {
    boss: "CYBER MECH:8:2:0.4:4",
    style: "cyberpunk"
  },
  (svg) => {
    assert(svg.includes("Orbitron"));
    assert(svg.includes("skewX(-20)"));
    assert(svg.includes("polygon points="));
    assert(svg.includes("Tactical Crosshair"));
    assert(svg.includes("Cyber Bits"));
    assert(svg.includes("// HOSTILE //"));
  },
  "Cyberpunk aesthetic (?style=cyberpunk)"
);

// 16. Pixel aesthetic query (?style=pixel)
runApiTest(
  {
    boss: "DRACULA:8:2:0.4:4",
    style: "pixel"
  },
  (svg) => {
    assert(svg.includes("Press Start 2P"));
    assert(svg.includes("8-Bit Arcade Skull"));
    assert(svg.includes("arcadeBlink0"));
    assert(svg.includes("emblem-pixel-0"));
    assert(svg.includes("Pixel Block Debris"));
    assert(svg.includes("[1P BOSS]"));
  },
  "Pixel aesthetic (?style=pixel)"
);

// 17. Bloodborne aesthetic query (?style=bloodborne)
runApiTest(
  {
    boss: "CLERIC BEAST:8:2:0.4:4",
    style: "bloodborne"
  },
  (svg) => {
    assert(svg.includes("IM Fell English"));
    assert(svg.includes("Hunter's Mark Rune"));
    assert(svg.includes("Visceral Blood Droplets"));
    assert(svg.includes("[NIGHTMARE]"));
  },
  "Bloodborne aesthetic (?style=bloodborne)"
);

// 18. Minimal aesthetic query (?style=minimal)
runApiTest(
  {
    boss: "SYSTEM CPU:6:2:0.5:3",
    style: "minimal"
  },
  (svg) => {
    assert(svg.includes('rx="4"'));
    assert(svg.includes("Pulsing Dot Beacon"));
    assert(svg.includes("beaconPulse0"));
    assert(svg.includes("beacon-ping-0"));
    assert(svg.includes("Soft Ambient Ping Ring"));
    assert(svg.includes("[TARGET]"));
  },
  "Minimal aesthetic (?style=minimal)"
);

// 19. Aesthetic aliases (gothic, scifi, retro, clean, eldritch)
const aliasChecks = [
  { alias: 'gothic', expectedClass: 'Cinzel', desc: 'gothic -> souls' },
  { alias: 'scifi', expectedClass: 'Orbitron', desc: 'scifi -> cyberpunk' },
  { alias: 'retro', expectedClass: 'Press Start 2P', desc: 'retro -> pixel' },
  { alias: 'clean', expectedClass: 'system-ui', desc: 'clean -> minimal' },
  { alias: 'eldritch', expectedClass: 'IM Fell English', desc: 'eldritch -> bloodborne' }
];
aliasChecks.forEach(ac => {
  runApiTest(
    { boss: "TEST:4:2", aesthetic: ac.alias },
    (svg) => {
      assert(svg.includes(ac.expectedClass), `Alias ${ac.alias} must resolve correctly`);
    },
    `Aesthetic alias (${ac.desc})`
  );
});

// 20. Defeated banner color query parameters (?felledColor=10b981 and ?bannerColor=10b981)
runApiTest(
  {
    boss: "TEST:6:2:0.5:3",
    felledColor: "10b981"
  },
  (svg) => {
    assert(svg.includes("fill: #10b981"), "felledColor must apply to defeated banner fill");
    assert(svg.includes("drop-shadow(0 0 6px #10b981)"), "felledColor must apply to banner glow drop-shadow");
  },
  "Defeated banner color parameter (?felledColor=10b981)"
);

runApiTest(
  {
    boss: "TEST:6:2:0.5:3",
    bannerColor: "#ec4899"
  },
  (svg) => {
    assert(svg.includes("fill: #ec4899"), "bannerColor alias must apply to defeated banner fill");
  },
  "Defeated banner color alias (?bannerColor=#ec4899)"
);

// 21. Damage pop-up color query parameters (?dmgPopColor=38bdf8 and ?popupColor=38bdf8)
runApiTest(
  {
    boss: "TEST:6:2:0.5:3",
    dmgPopColor: "38bdf8"
  },
  (svg) => {
    assert(svg.includes("fill: #38bdf8"), "dmgPopColor must apply to damage popup fill");
  },
  "Damage pop-up color parameter (?dmgPopColor=38bdf8)"
);

runApiTest(
  {
    boss: "TEST:6:2:0.5:3",
    popupColor: "#f43f5e"
  },
  (svg) => {
    assert(svg.includes("fill: #f43f5e"), "popupColor alias must apply to damage popup fill");
  },
  "Damage pop-up color alias (?popupColor=#f43f5e)"
);

// 22. 9-part shorthand query
runApiTest(
  {
    boss: "TITAN MECH:10:4:0.4:3:cyan:heavy:// TARGET DESTROYED //:cyberpunk"
  },
  (svg) => {
    assert(svg.includes("TITAN MECH"));
    assert(svg.includes("Orbitron"));
    assert(svg.includes("// TARGET DESTROYED //"));
    assert(svg.includes("-4px, 3px")); // heavy shake
  },
  "9-part shorthand (TITAN MECH:10:4:0.4:3:cyan:heavy:// TARGET DESTROYED //:cyberpunk)"
);

// 23. Single boss query with style, felledColor, and dmgPopColor
runApiTest(
  {
    name: "LUDWIG",
    bars: "8",
    dmg: "2",
    style: "bloodborne",
    felledColor: "dc2626",
    dmgPopColor: "facc15"
  },
  (svg) => {
    assert(svg.includes("LUDWIG"));
    assert(svg.includes("IM Fell English"));
    assert(svg.includes("Hunter's Mark Rune"));
    assert(svg.includes("PREY SLAUGHTERED"));
    assert(svg.includes("fill: #dc2626"));
    assert(svg.includes("fill: #facc15"));
  },
  "Single boss query with style & colors (?name=LUDWIG&bars=8&style=bloodborne&felledColor=dc2626&dmgPopColor=facc15)"
);

console.log("\nALL 24 API TESTS PASSED SUCCESSFULLY!");




