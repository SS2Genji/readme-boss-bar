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

console.log("\nALL API TESTS PASSED SUCCESSFULLY!");

