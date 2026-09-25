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

// Test 4: 4 bosses with 10 bars each (Stress & high-bar test)
const svg4 = generateBossBarSVG([
  { name: "PHASE 1: MARGIT", totalBars: 10, hits: 10 },
  { name: "PHASE 2: GODRICK", totalBars: 10, hits: 10 },
  { name: "PHASE 3: RADAHN", totalBars: 10, hits: 10 },
  { name: "PHASE 4: MALENIA", totalBars: 10, hits: 4 }
]);
fs.writeFileSync('/tmp/test_boss_4.svg', svg4);
execSync('rsvg-convert /tmp/test_boss_4.svg -o /tmp/test_boss_4.png');
console.log("✔ Test 4 passed: 4 bosses x 10 bars compiles cleanly!");

// Test 5: Clamping and extreme bars (20 bars, 0 hits, overkill hits)
const svg5 = generateBossBarSVG([
  { name: "ELDEN BEAST", totalBars: 20, hits: 20 },
  { name: "UNTOUCHED", totalBars: 10, hits: 0 },
  { name: "OVERKILL", totalBars: 4, hits: 99 }
]);
fs.writeFileSync('/tmp/test_boss_5.svg', svg5);
execSync('rsvg-convert /tmp/test_boss_5.svg -o /tmp/test_boss_5.png');
console.log("✔ Test 5 passed: 20-bar scale and safety clamping compile cleanly!");

// Test 6: Multi-bar hits with manual interval (3 bars per hit every 0.5s)
const svg6 = generateBossBarSVG([
  {
    name: "STARCOURGE RADAHN",
    totalBars: 10,
    hits: 2,
    damagePerHit: 3,
    hitInterval: 0.5,
    barColor: "purple",
    shake: "heavy",
    dmgPop: "-{N} BARS"
  }
]);
fs.writeFileSync('/tmp/test_boss_6.svg', svg6);
execSync('rsvg-convert /tmp/test_boss_6.svg -o /tmp/test_boss_6.png');
console.log("✔ Test 6 passed: Multi-bar hits (3 bars / 0.5s) with purple theme compile cleanly!");

// Test 7: Defeated boss with custom felled text and rapid interval
const svg7 = generateBossBarSVG([
  {
    name: "MALENIA, BLADE OF MIQUELLA",
    totalBars: 8,
    hits: 4,
    damagePerHit: 2,
    hitInterval: 0.35,
    barColor: "gold",
    felledText: "DEMIGOD FELLED",
    shake: "heavy"
  }
]);
fs.writeFileSync('/tmp/test_boss_7.svg', svg7);
execSync('rsvg-convert /tmp/test_boss_7.svg -o /tmp/test_boss_7.png');
console.log("✔ Test 7 passed: Defeated boss with custom 'DEMIGOD FELLED' compiles cleanly!");

// Test 8: Animation customization (sparks: false, custom hit flash, subtle shake, custom dmgPop)
const svg8 = generateBossBarSVG([
  {
    name: "GLINTSTONE DRAGON",
    totalBars: 7,
    hits: 3,
    damagePerHit: 2,
    hitInterval: 0.4,
    barColor: "cyan",
    sparks: false,
    hitFlash: "#ffffff",
    shake: "subtle",
    dmgPop: "CRIT -{N} HP"
  }
]);
fs.writeFileSync('/tmp/test_boss_8.svg', svg8);
execSync('rsvg-convert /tmp/test_boss_8.svg -o /tmp/test_boss_8.png');
console.log("✔ Test 8 passed: Sparks disabled, custom flash, and custom popup compile cleanly!");

// Test 9: All themes preset verification + custom hex color
const themesToTest = ['crimson', 'purple', 'cyan', 'gold', 'green', 'orange', '#ec4899'];
themesToTest.forEach((th, idx) => {
  const svg = generateBossBarSVG([
    { name: `THEME ${th.toUpperCase()}`, totalBars: 6, hits: 2, damagePerHit: 2, barColor: th }
  ]);
  const outPath = `/tmp/test_boss_theme_${idx}.svg`;
  fs.writeFileSync(outPath, svg);
  execSync(`rsvg-convert ${outPath} -o /tmp/test_boss_theme_${idx}.png`);
});
console.log("✔ Test 9 passed: All 7 theme presets and custom hex color compile cleanly!");

// Test 10: Screen shake modes ('none', 'subtle', 'medium', 'heavy', false)
const shakeModes = ['none', 'subtle', 'medium', 'heavy', false];
shakeModes.forEach((sh, idx) => {
  const svg = generateBossBarSVG([
    { name: `SHAKE ${sh}`, totalBars: 5, hits: 2, shake: sh }
  ]);
  const outPath = `/tmp/test_boss_shake_${idx}.svg`;
  fs.writeFileSync(outPath, svg);
  execSync(`rsvg-convert ${outPath} -o /tmp/test_boss_shake_${idx}.png`);
});
console.log("✔ Test 10 passed: All screen shake options compile cleanly!");

// Test 11: Auto mode with partial boss input (only names & totalBars provided)
const svg11 = generateBossBarSVG([
  { name: "MARGIT", totalBars: 6 },
  { name: "GODRICK", totalBars: 8 },
  { name: "RADAHN", totalBars: 10 }
], { auto: true });
fs.writeFileSync('/tmp/test_boss_11.svg', svg11);
execSync('rsvg-convert /tmp/test_boss_11.svg -o /tmp/test_boss_11.png');
console.log("✔ Test 11 passed: Auto mode with partial boss configs derives sane defaults cleanly!");

// Test 12: Zero-config auto preset
const svg12 = generateBossBarSVG([], { auto: true });
fs.writeFileSync('/tmp/test_boss_12.svg', svg12);
execSync('rsvg-convert /tmp/test_boss_12.svg -o /tmp/test_boss_12.png');
console.log("✔ Test 12 passed: Zero-config auto mode compiles cleanly!");

// Test 13: XML escaping safety (special characters in names and banner text)
const svg13 = generateBossBarSVG([
  {
    name: "ORNSTEIN & SMOUGH <PHASE 1>",
    totalBars: 6,
    hits: 6,
    felledText: 'FOE "SLAIN" & BANISHED',
    dmgPop: '<CRIT> & -{N}'
  }
]);
fs.writeFileSync('/tmp/test_boss_13.svg', svg13);
execSync('rsvg-convert /tmp/test_boss_13.svg -o /tmp/test_boss_13.png');
console.log("✔ Test 13 passed: Strict XML entity escaping compiles cleanly!");

// Test 14: Manual mode with damagePerHit without specifying hits (default drains totalBars)
const svg14 = generateBossBarSVG([
  { name: "MALENIA", totalBars: 10, damagePerHit: 3, hitInterval: 0.5 }
]);
if (!svg14.includes('drain_') || !svg14.includes('dmg-pop-0-0')) {
  throw new Error("Test 14 failed: Manual mode did not execute damage animations when hits was omitted!");
}
fs.writeFileSync('/tmp/test_boss_14.svg', svg14);
execSync('rsvg-convert /tmp/test_boss_14.svg -o /tmp/test_boss_14.png');
console.log("✔ Test 14 passed: Manual mode without explicit hits correctly drains health and animates!");

// Test 15: Fill attribute verification (alive bars have fill and dual animation)
const svg15 = generateBossBarSVG([
  { name: "RADAHN", totalBars: 5, hits: 2, barColor: "purple" }
]);
if (!svg15.includes('fill="#9333ea"') || !svg15.includes('pulse_purple 2s infinite alternate')) {
  throw new Error("Test 15 failed: Alive bars must have explicit fill attribute and pulse animation!");
}
fs.writeFileSync('/tmp/test_boss_15.svg', svg15);
execSync('rsvg-convert /tmp/test_boss_15.svg -o /tmp/test_boss_15.png');
console.log("✔ Test 15 passed: Fill attribute and dual CSS animation verified!");

// Test 16: Hex color without leading hash (e.g. 'ec4899')
const svg16 = generateBossBarSVG([
  { name: "PINK VOID", totalBars: 4, hits: 2, barColor: "ec4899" }
]);
if (!svg16.includes('#ec4899')) {
  throw new Error("Test 16 failed: Hex without leading # must be resolved to #ec4899!");
}
fs.writeFileSync('/tmp/test_boss_16.svg', svg16);
execSync('rsvg-convert /tmp/test_boss_16.svg -o /tmp/test_boss_16.png');
console.log("✔ Test 16 passed: Hex theme without leading # resolved and compiled cleanly!");

// Test 17: Extreme bar count safety (40 bars with high damage)
const svg17 = generateBossBarSVG([
  { name: "COLOSSUS", totalBars: 40, damagePerHit: 5, hitInterval: 0.2 }
]);
fs.writeFileSync('/tmp/test_boss_17.svg', svg17);
execSync('rsvg-convert /tmp/test_boss_17.svg -o /tmp/test_boss_17.png');
console.log("✔ Test 17 passed: Extreme 40-bar stress test compiles cleanly with 0 overflow!");

// Test 18: CLI end-to-end execution with flags (--dmg, --interval, --theme=purple, --sparks)
execSync('node bin/cli.js -b "RADAHN:10" --dmg 3 --interval 0.5 --theme=purple --shake=heavy -o /tmp/cli_test_advanced.svg');
const cliSvg = fs.readFileSync('/tmp/cli_test_advanced.svg', 'utf8');
if (!cliSvg.includes('drain_') || !cliSvg.includes('#9333ea') || !cliSvg.includes('-3 BARS')) {
  throw new Error("Test 18 failed: CLI did not apply --dmg, --interval, or --theme=purple correctly!");
}
execSync('rsvg-convert /tmp/cli_test_advanced.svg -o /tmp/cli_test_advanced.png');

// Test CLI sparks boolean safety (does not consume next option)
execSync('node bin/cli.js -b "TEST:5:2" --sparks -o /tmp/cli_sparks_safe.svg');
if (!fs.existsSync('/tmp/cli_sparks_safe.svg')) {
  throw new Error("Test 18 failed: CLI --sparks consumed -o argument!");
}
execSync('rsvg-convert /tmp/cli_sparks_safe.svg -o /tmp/cli_sparks_safe.png');
console.log("✔ Test 18 passed: CLI flags (--dmg, --interval, --flag=value, boolean safety) work cleanly!");

console.log("\nALL 18 TESTS PASSED WITH 0 XML / RSVG ERRORS!");


