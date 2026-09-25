#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateBossBarSVG } = require('../src/generator');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
Readme Boss Bar Generator - CLI
Usage:
  readme-boss-bar [options]

Boss Options:
  -b, --boss <spec>             Boss definition in shorthand format (repeatable):
                                "NAME:TOTAL_BARS:HITS:INTERVAL:DMG_PER_HIT"
                                (e.g. "RADAHN:10:2:0.5:3" or "MILESTONE 1:3:3")
  -c, --config <file.json>      Path to JSON configuration file
  --auto                        Enable automatic cinematic mode (auto speeds, combos, themes)

Animation & Style Options:
  --shake <level>               Screen shake: none, subtle, medium, heavy (default: medium)
  --theme, --color <name|hex>   Color theme: crimson, purple, cyan, gold, green, orange, or #hex
  --sparks <bool>               Toggle pixel sparks: true or false (default: true)
  --flash, --hit-flash <color>  Flash highlight color upon hit (default: #fef08a)
  --felled-text <string>        Defeated banner text (default: "GREAT ENEMY FELLED")
  --dmg-pop <template|bool>     Damage pop-up template (e.g. "-{N} BARS", "-{N} HP", or false)

Canvas Options:
  -o, --output <file.svg>       Output SVG file path (default: boss_bar.svg)
  -w, --width <pixels>          Total SVG width (default: 700)
  --height <pixels>             Total SVG height (default: 95)
  --bar-width <pixels>          Health bar width (default: 480)
  -h, --help                    Show this help message

Examples:
  readme-boss-bar --auto -o boss_bar.svg
  readme-boss-bar -b "RADAHN:10:2:0.5:3" --theme purple --shake heavy -o radahn.svg
  readme-boss-bar -b "MALENIA:12:4:0.35:3" --felled-text "DEMIGOD FELLED" -o malenia.svg
  readme-boss-bar -b "MILESTONE 1:3:3" -b "MILESTONE 2:5:1" -o assets/boss_bar.svg
  readme-boss-bar --config config.example.json -o boss_bar.svg
  `);
}

if (args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

let bosses = [];
let outputFile = 'boss_bar.svg';
let options = {
  width: 700,
  height: 95,
  barWidth: 480
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '-b' || arg === '--boss') {
    const val = args[++i];
    if (val) {
      const parts = val.split(':');
      const boss = {
        name: parts[0]?.trim() || 'BOSS'
      };
      if (parts.length >= 2 && parts[1] !== '') {
        boss.totalBars = parseInt(parts[1], 10);
      }
      if (parts.length >= 3 && parts[2] !== '') {
        boss.hits = parseInt(parts[2], 10);
      }
      if (parts.length >= 4 && parts[3] !== '') {
        boss.hitInterval = parseFloat(parts[3]);
      }
      if (parts.length >= 5 && parts[4] !== '') {
        boss.damagePerHit = parseInt(parts[4], 10);
      }
      bosses.push(boss);
    }
  } else if (arg === '-c' || arg === '--config') {
    const configFile = args[++i];
    if (configFile && fs.existsSync(configFile)) {
      try {
        const raw = fs.readFileSync(configFile, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          bosses = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.bosses)) {
            bosses = parsed.bosses;
          }
          if (parsed.shake !== undefined) options.shake = parsed.shake;
          if (parsed.theme || parsed.barColor || parsed.color) {
            options.barColor = parsed.theme || parsed.barColor || parsed.color;
          }
          if (parsed.sparks !== undefined) options.sparks = parsed.sparks;
          if (parsed.hitFlash || parsed.flash) options.hitFlash = parsed.hitFlash || parsed.flash;
          if (parsed.felledText) options.felledText = parsed.felledText;
          if (parsed.dmgPop !== undefined) options.dmgPop = parsed.dmgPop;
          if (parsed.auto !== undefined) options.auto = parsed.auto;
          if (parsed.width) options.width = parseInt(parsed.width, 10);
          if (parsed.height) options.height = parseInt(parsed.height, 10);
          if (parsed.barWidth) options.barWidth = parseInt(parsed.barWidth, 10);
        }
      } catch (err) {
        console.error("Error reading config file:", err.message);
        process.exit(1);
      }
    } else {
      console.error(`Config file not found: ${configFile}`);
      process.exit(1);
    }
  } else if (arg === '-o' || arg === '--output') {
    outputFile = args[++i] || outputFile;
  } else if (arg === '-w' || arg === '--width') {
    options.width = parseInt(args[++i], 10) || options.width;
  } else if (arg === '--height') {
    options.height = parseInt(args[++i], 10) || options.height;
  } else if (arg === '--bar-width') {
    options.barWidth = parseInt(args[++i], 10) || options.barWidth;
  } else if (arg === '--shake') {
    options.shake = args[++i];
  } else if (arg === '--theme' || arg === '--color' || arg === '--bar-color') {
    options.barColor = args[++i];
  } else if (arg === '--sparks') {
    const val = args[++i];
    options.sparks = val === 'true' || val === '1';
  } else if (arg === '--flash' || arg === '--hit-flash') {
    options.hitFlash = args[++i];
  } else if (arg === '--felled-text') {
    options.felledText = args[++i];
  } else if (arg === '--dmg-pop' || arg === '--popup') {
    const val = args[++i];
    options.dmgPop = (val === 'false' || val === '0') ? false : val;
  } else if (arg === '--auto') {
    options.auto = true;
  }
}

const svg = generateBossBarSVG(bosses, options);
const outDir = path.dirname(path.resolve(outputFile));
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outputFile, svg, 'utf8');
console.log(`✔ Successfully generated Boss Bar SVG at: ${outputFile}`);

