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

console.log("\nALL 10 API TESTS PASSED SUCCESSFULLY!");


