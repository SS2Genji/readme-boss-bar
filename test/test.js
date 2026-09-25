const { generateBossBarSVG } = require('../src/generator');
const fs = require('fs');
const { execSync } = require('child_process');

console.log("=== Testing Dynamic Boss Bar Generator ===");

// Test 1: Ahmet's setup (Milestone 1 & Milestone 2)
const svg1 = generateBossBarSVG([
  { name: "MILESTONE 1", totalBars: 3, hits: 3 },
  { name: "MILESTONE 2", totalBars: 5, hits: 1 }
]);
fs.writeFileSync('/tmp/test_boss_1.svg', svg1);
execSync('rsvg-convert /tmp/test_boss_1.svg -o /tmp/test_boss_1.png');
console.log("✔ Test 1 passed: 2-boss setup compiles cleanly!");

// Test 2: Single boss (4 bars, 4 hits)
const svg2 = generateBossBarSVG([
  { name: "CIRCLE 00 (LIBFT)", totalBars: 4, hits: 4 }
]);
fs.writeFileSync('/tmp/test_boss_2.svg', svg2);
execSync('rsvg-convert /tmp/test_boss_2.svg -o /tmp/test_boss_2.png');
console.log("✔ Test 2 passed: Single boss setup compiles cleanly!");

// Test 3: 3 bosses chain
const svg3 = generateBossBarSVG([
  { name: "PISCINE", totalBars: 2, hits: 2 },
  { name: "COMMON CORE", totalBars: 4, hits: 4 },
  { name: "INTERNSHIP", totalBars: 3, hits: 1 }
]);
fs.writeFileSync('/tmp/test_boss_3.svg', svg3);
execSync('rsvg-convert /tmp/test_boss_3.svg -o /tmp/test_boss_3.png');
console.log("✔ Test 3 passed: 3-boss chain compiles cleanly!");

console.log("\nALL TESTS PASSED WITH 0 XML / RSVG ERRORS!");
