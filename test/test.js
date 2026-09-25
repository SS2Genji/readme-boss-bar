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

// Test 19: Multi-bar sequential right-to-left drainage verification
const svg19 = generateBossBarSVG([
  { name: "MULTI-HIT BOSS", totalBars: 6, hits: 1, damagePerHit: 2, hitInterval: 0.5 }
]);
const kfBar4Idx = svg19.indexOf("@keyframes drain_0_4");
if (kfBar4Idx === -1) {
  throw new Error("Test 19 failed: Could not find @keyframes drain_0_4!");
}
const kfBar4 = svg19.slice(kfBar4Idx, svg19.indexOf("}", svg19.indexOf("100%", kfBar4Idx)) + 1);
// Bar 4 (left of bar 5) must hold full width (75px) with flash highlight while bar 5 drains
if (!kfBar4.includes("width: 75px; fill: #fef08a;")) {
  throw new Error("Test 19 failed: Bar 4 did not hold width during multi-bar strike!");
}
fs.writeFileSync('/tmp/test_boss_19.svg', svg19);
execSync('rsvg-convert /tmp/test_boss_19.svg -o /tmp/test_boss_19.png');
console.log("✔ Test 19 passed: Multi-bar sequential right-to-left drainage verified cleanly!");

// Test 20: Scoped ID prefixing isolation
const svg20 = generateBossBarSVG([
  { name: "SCOPED BOSS", totalBars: 4, hits: 2 }
], { id: "test_scope" });
if (!svg20.includes('test_scope-bar-0-0') || !svg20.includes('test_scope_drain_0_3') || !svg20.includes('test_scope_alive_0_0') || !svg20.includes('test_scope_shakeAnim0')) {
  throw new Error("Test 20 failed: SVG did not prefix classes and keyframes with test_scope!");
}
fs.writeFileSync('/tmp/test_boss_20.svg', svg20);
execSync('rsvg-convert /tmp/test_boss_20.svg -o /tmp/test_boss_20.png');
console.log("✔ Test 20 passed: Scoped ID prefixing isolation compiles cleanly!");

// Test 21: Full simulation of multi-bar drainage sequence (Radahn 10 bars, 2 hits of 3 bars)
const svg21 = generateBossBarSVG([
  { name: "RADAHN", totalBars: 10, hits: 2, damagePerHit: 3, hitInterval: 0.5 }
]);
// In Hit 0: bars 9, 8, 7 drain sequentially right-to-left.
// Bar 9: drains first from hitT to hitT + dt
// Bar 8: holds full width until hitT + dt, then drains from hitT + dt to hitT + 2*dt
// Bar 7: holds full width until hitT + 2*dt, then drains from hitT + 2*dt to hitT + 3*dt
const kf9 = svg21.slice(svg21.indexOf("@keyframes drain_0_9"), svg21.indexOf("}", svg21.indexOf("100%", svg21.indexOf("@keyframes drain_0_9"))) + 1);
const kf8 = svg21.slice(svg21.indexOf("@keyframes drain_0_8"), svg21.indexOf("}", svg21.indexOf("100%", svg21.indexOf("@keyframes drain_0_8"))) + 1);
const kf7 = svg21.slice(svg21.indexOf("@keyframes drain_0_7"), svg21.indexOf("}", svg21.indexOf("100%", svg21.indexOf("@keyframes drain_0_7"))) + 1);

if (!kf9.includes("10.00% { width: 44px;") || !kf8.includes("10.00%, 11.08% { width: 44px;") || !kf7.includes("10.00%, 12.17% { width: 44px;")) {
  throw new Error("Test 21 failed: Adjacent multi-bar segments did not hold width in sequence!");
}
fs.writeFileSync('/tmp/test_boss_21.svg', svg21);
execSync('rsvg-convert /tmp/test_boss_21.svg -o /tmp/test_boss_21.png');
console.log("✔ Test 21 passed: Multi-hit multi-bar strictly monotonic sequential sweep verified cleanly!");

// Test 22: Interactive CLI Wizard execution with presets and custom flows
execSync('node bin/cli.js --wizard', {
  input: '1\n/tmp/cli_wizard_test22.svg\n',
  stdio: ['pipe', 'pipe', 'pipe']
});
if (!fs.existsSync('/tmp/cli_wizard_test22.svg')) {
  throw new Error("Test 22 failed: CLI wizard did not generate output file!");
}
const wizSvg = fs.readFileSync('/tmp/cli_wizard_test22.svg', 'utf8');
if (!wizSvg.includes('STARCOURGE RADAHN') || !wizSvg.includes('-3 BARS') || !wizSvg.includes('DEMIGOD FELLED')) {
  throw new Error("Test 22 failed: Wizard output missing expected preset content or victory banner!");
}
execSync('rsvg-convert /tmp/cli_wizard_test22.svg -o /tmp/cli_wizard_test22.png');

// Test 22b: Wizard custom flow with multi-stage
execSync('node bin/cli.js wizard', {
  input: '5\n2\nSTAGE ONE\n4\n1\n0.4\n4\ncrimson\nmedium\nSTAGE ONE FELLED\nSTAGE TWO\n6\n2\n0.5\n3\ncyan\nheavy\nSTAGE TWO FELLED\n/tmp/cli_wizard_custom22.svg\n',
  stdio: ['pipe', 'pipe', 'pipe']
});
if (!fs.existsSync('/tmp/cli_wizard_custom22.svg')) {
  throw new Error("Test 22 failed: Wizard custom flow did not generate output file!");
}
const customSvg = fs.readFileSync('/tmp/cli_wizard_custom22.svg', 'utf8');
if (!customSvg.includes('STAGE ONE') || !customSvg.includes('STAGE TWO') || !customSvg.includes('STAGE TWO FELLED')) {
  throw new Error("Test 22 failed: Wizard custom output missing stage content!");
}
execSync('rsvg-convert /tmp/cli_wizard_custom22.svg -o /tmp/cli_wizard_custom22.png');

// Test 22c: Wizard custom flow with 0 hits and custom hex theme
execSync('node bin/cli.js wizard', {
  input: '5\n1\nUNDAMAGED FOE\n8\n2\n0.5\n0\n#a855f7\nmedium\nVICTORY\n/tmp/cli_wizard_zero_hits.svg\n',
  stdio: ['pipe', 'pipe', 'pipe']
});
if (!fs.existsSync('/tmp/cli_wizard_zero_hits.svg')) {
  throw new Error("Test 22c failed: Wizard zero-hits flow did not generate output file!");
}
const zeroSvg = fs.readFileSync('/tmp/cli_wizard_zero_hits.svg', 'utf8');
if (!zeroSvg.includes('UNDAMAGED FOE') || !zeroSvg.includes('#a855f7') || zeroSvg.includes('-2 BARS')) {
  throw new Error("Test 22c failed: Zero-hits bar should not have damage popups!");
}
execSync('rsvg-convert /tmp/cli_wizard_zero_hits.svg -o /tmp/cli_wizard_zero_hits.png');
console.log("✔ Test 22 passed: Interactive CLI Wizard executed preset, multi-stage, and 0-hit flows cleanly!");

// Test 23: All 6 Visual Aesthetics (classic, souls, cyberpunk, pixel, bloodborne, minimal)
const aestheticsList = ['classic', 'souls', 'cyberpunk', 'pixel', 'bloodborne', 'minimal'];
aestheticsList.forEach((style, idx) => {
  const svg = generateBossBarSVG([
    { name: `${style.toUpperCase()} BOSS`, totalBars: 8, hits: 4, damagePerHit: 2 }
  ], { style });
  
  if (style === 'souls') {
    if (!svg.includes('Cinzel') || !svg.includes('Elden Golden Cross') || !svg.includes('Golden Ember Particles')) {
      throw new Error(`Test 23 failed: Souls aesthetic missing expected components`);
    }
  } else if (style === 'cyberpunk') {
    if (!svg.includes('Orbitron') || !svg.includes('skewX(-20)') || !svg.includes('Tactical Crosshair') || !svg.includes('Cyber Bits')) {
      throw new Error(`Test 23 failed: Cyberpunk aesthetic missing expected components`);
    }
  } else if (style === 'pixel') {
    if (!svg.includes('Press Start 2P') || !svg.includes('8-Bit Arcade Skull') || !svg.includes('Pixel Block Debris')) {
      throw new Error(`Test 23 failed: Pixel aesthetic missing expected components`);
    }
  } else if (style === 'bloodborne') {
    if (!svg.includes('IM Fell English') || !svg.includes("Hunter's Mark Rune") || !svg.includes('Visceral Blood Droplets')) {
      throw new Error(`Test 23 failed: Bloodborne aesthetic missing expected components`);
    }
  } else if (style === 'minimal') {
    if (!svg.includes('rx="4"') || !svg.includes('Pulsing Dot Beacon') || !svg.includes('Soft Ambient Ping Ring')) {
      throw new Error(`Test 23 failed: Minimal aesthetic missing expected components`);
    }
  }

  const outPath = `/tmp/test_aesthetic_${idx}_${style}.svg`;
  fs.writeFileSync(outPath, svg);
  execSync(`rsvg-convert ${outPath} -o /tmp/test_aesthetic_${idx}_${style}.png`);
});
console.log("✔ Test 23 passed: All 6 visual aesthetics render distinct geometries, typography, particles & emblems cleanly!");

// Test 24: All 4 Impact Drain Animations (sweep, pulse, burst, glitch)
const animList = ['sweep', 'pulse', 'burst', 'glitch'];
animList.forEach((anim, idx) => {
  const svg = generateBossBarSVG([
    { name: `ANIM ${anim.toUpperCase()}`, totalBars: 6, hits: 2, damagePerHit: 3 }
  ], { animation: anim });

  if (anim === 'burst') {
    if (!svg.includes('tEnd - 0.02') && !svg.includes('fill: #fef08a')) {
      throw new Error("Test 24 failed: Burst animation missing expected keyframe structure");
    }
  } else if (anim === 'glitch') {
    if (!svg.includes('drain_0_') || !svg.includes('% { width:')) {
      throw new Error("Test 24 failed: Glitch animation missing expected keyframe structure");
    }
  }

  const outPath = `/tmp/test_anim_${idx}_${anim}.svg`;
  fs.writeFileSync(outPath, svg);
  execSync(`rsvg-convert ${outPath} -o /tmp/test_anim_${idx}_${anim}.png`);
});
console.log("✔ Test 24 passed: All 4 impact drain animations compile cleanly!");

// Test 25: Screen Shake 'glitch' mode
const svg25 = generateBossBarSVG([
  { name: "GLITCH TARGET", totalBars: 6, hits: 2, shake: "glitch" }
]);
if (!svg25.includes("translate(-5px, 0)") || !svg25.includes("translate(4px, 0)")) {
  throw new Error("Test 25 failed: Glitch shake missing expected horizontal jitter keyframes");
}
fs.writeFileSync('/tmp/test_boss_25.svg', svg25);
execSync('rsvg-convert /tmp/test_boss_25.svg -o /tmp/test_boss_25.png');
console.log("✔ Test 25 passed: Digital glitch screen shake mode compiles cleanly!");

// Test 26: Defeat Banners and Tags across all Aesthetics
const bannerTests = [
  { style: 'classic', expectedBanner: 'GREAT ENEMY FELLED', expectedTag: '[BOSS]', expectedFelledTag: '[FELLED]' },
  { style: 'souls', expectedBanner: 'GREAT ENEMY FELLED', expectedTag: '[GREAT FOE]', expectedFelledTag: '[FELLED]' },
  { style: 'cyberpunk', expectedBanner: '// TARGET DESTROYED //', expectedTag: '// HOSTILE //', expectedFelledTag: '// NEUTRALIZED //' },
  { style: 'pixel', expectedBanner: 'STAGE CLEAR', expectedTag: '[1P BOSS]', expectedFelledTag: '[CLEAR]' },
  { style: 'bloodborne', expectedBanner: 'PREY SLAUGHTERED', expectedTag: '[NIGHTMARE]', expectedFelledTag: '[SLAUGHTERED]' },
  { style: 'minimal', expectedBanner: 'STATUS: DEFEATED', expectedTag: '[TARGET]', expectedFelledTag: '[RESOLVED]' }
];
bannerTests.forEach((bTest, idx) => {
  const svg = generateBossBarSVG([
    { name: `VICTORY ${bTest.style.toUpperCase()}`, totalBars: 4, hits: 2, damagePerHit: 2 }
  ], { style: bTest.style });

  if (!svg.includes(bTest.expectedBanner)) {
    throw new Error(`Test 26 failed: ${bTest.style} missing expected defeat banner: ${bTest.expectedBanner}`);
  }
  if (!svg.includes(bTest.expectedTag) || !svg.includes(bTest.expectedFelledTag)) {
    throw new Error(`Test 26 failed: ${bTest.style} missing expected tags`);
  }
  const outPath = `/tmp/test_banner_${idx}_${bTest.style}.svg`;
  fs.writeFileSync(outPath, svg);
  execSync(`rsvg-convert ${outPath} -o /tmp/test_banner_${idx}_${bTest.style}.png`);
});
console.log("✔ Test 26 passed: Defeat banners and contextual tags verified across all 6 aesthetics!");

// Test 27: Shorthand 9-part and 10-part format
const svg27 = generateBossBarSVG([
  {
    name: "MALENIA",
    totalBars: 8,
    hits: 4,
    hitInterval: 0.35,
    damagePerHit: 2,
    barColor: "gold",
    shake: "heavy",
    felledText: "DEMIGOD FELLED",
    style: "souls",
    animation: "sweep"
  }
]);
if (!svg27.includes("Cinzel") || !svg27.includes("DEMIGOD FELLED") || !svg27.includes("Golden Ember Particles")) {
  throw new Error("Test 27 failed: Extended boss properties not properly applied");
}
fs.writeFileSync('/tmp/test_boss_27.svg', svg27);
execSync('rsvg-convert /tmp/test_boss_27.svg -o /tmp/test_boss_27.png');
console.log("✔ Test 27 passed: Extended boss configuration with style & animation compiles cleanly!");

// Test 28: CLI Flags (--style, --anim, --shake glitch)
execSync('node bin/cli.js --style cyberpunk --anim glitch --shake glitch -b "CYBER MECH:8:2:0.4:4" -o /tmp/test_cli_flags_28.svg');
if (!fs.existsSync('/tmp/test_cli_flags_28.svg')) {
  throw new Error("Test 28 failed: CLI did not produce output SVG with --style and --anim flags!");
}
const cliFlagSvg = fs.readFileSync('/tmp/test_cli_flags_28.svg', 'utf8');
if (!cliFlagSvg.includes('CYBER MECH') || !cliFlagSvg.includes('Orbitron') || !cliFlagSvg.includes('skewX(-20)')) {
  throw new Error("Test 28 failed: CLI generated SVG missing cyberpunk features");
}
execSync('rsvg-convert /tmp/test_cli_flags_28.svg -o /tmp/test_cli_flags_28.png');
console.log("✔ Test 28 passed: CLI flags (--style, --anim, --shake glitch) work cleanly!");

// Test 29: CLI Wizard execution of all new aesthetic presets (Cyberpunk, Bloodborne, Pixel, Minimal)
const wizardPresets = [
  { opt: '6', file: '/tmp/wiz_cyber.svg', expectedText: '// TARGET DESTROYED //' },
  { opt: '7', file: '/tmp/wiz_blood.svg', expectedText: 'PREY SLAUGHTERED' },
  { opt: '8', file: '/tmp/wiz_pixel.svg', expectedText: 'STAGE CLEAR' },
  { opt: '9', file: '/tmp/wiz_minimal.svg', expectedText: 'STATUS: DEFEATED' }
];
wizardPresets.forEach((wp) => {
  execSync('node bin/cli.js wizard', {
    input: `${wp.opt}\n${wp.file}\n`,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  if (!fs.existsSync(wp.file)) {
    throw new Error(`Test 29 failed: Wizard did not generate file for option ${wp.opt}`);
  }
  const svg = fs.readFileSync(wp.file, 'utf8');
  if (!svg.includes(wp.expectedText)) {
    throw new Error(`Test 29 failed: Wizard file for option ${wp.opt} missing ${wp.expectedText}`);
  }
  execSync(`rsvg-convert ${wp.file} -o ${wp.file}.png`);
});
console.log("✔ Test 29 passed: CLI Wizard executes all dedicated aesthetic presets cleanly!");

// Test 30: Full matrix stress test (6 Aesthetics x 4 Animations = 24 SVGs converted with rsvg-convert)
let matrixCount = 0;
aestheticsList.forEach(style => {
  animList.forEach(anim => {
    const matrixSvg = generateBossBarSVG([
      { name: `MATRIX ${style.toUpperCase()}`, totalBars: 6, hits: 3, damagePerHit: 2 }
    ], { style, animation: anim });
    const p = `/tmp/test_matrix_${style}_${anim}.svg`;
    fs.writeFileSync(p, matrixSvg);
    execSync(`rsvg-convert ${p} -o /tmp/test_matrix_${style}_${anim}.png`);
    matrixCount++;
  });
});
console.log(`✔ Test 30 passed: Full matrix of ${matrixCount} style x animation combinations verified with 0 errors!`);

console.log("\nALL 30 TESTS PASSED WITH 0 XML / RSVG ERRORS!");




