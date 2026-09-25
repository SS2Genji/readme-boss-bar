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
                                "NAME:TOTAL_BARS:HITS:INTERVAL:DMG_PER_HIT:THEME:SHAKE:FELLED_TEXT"
                                (e.g. "RADAHN:10:2:0.5:3" or "MILESTONE 1:3:3")
  -c, --config <file.json>      Path to JSON configuration file
  --auto                        Enable automatic cinematic mode (auto speeds, combos, themes)
  --no-auto                     Disable automatic mode

Animation & Style Options:
  --dmg, --damage <bars>        Damage per hit in segments (e.g. 3)
  --interval, --speed <sec>     Seconds between hits (e.g. 0.5)
  --hits <count>                Total hit actions to execute
  --shake <level>               Screen shake: none, subtle, medium, heavy (default: medium)
  --theme, --color <name|hex>   Color theme: crimson, purple, cyan, gold, green, orange, or #hex
  --sparks [bool]               Toggle pixel sparks (default: true)
  --no-sparks                   Disable pixel sparks
  --flash, --hit-flash <color>  Flash highlight color upon hit (default: #fef08a)
  --felled-text, --felled <txt> Defeated banner text (default: "GREAT ENEMY FELLED")
  --dmg-pop [template]          Damage pop-up template (e.g. "-{N} BARS", "-{N} HP", or false)
  --no-dmg-pop                  Disable damage pop-ups

Canvas Options:
  -o, --output <file.svg>       Output SVG file path (default: boss_bar.svg)
  -w, --width <pixels>          Total SVG width (default: 700)
  --height <pixels>             Total SVG height (default: 95)
  --bar-width <pixels>          Health bar width (default: 480)
  -h, --help                    Show this help message

Examples:
  readme-boss-bar --auto -o boss_bar.svg
  readme-boss-bar -b "RADAHN:10" --dmg 3 --interval 0.5 --theme purple --shake heavy -o radahn.svg
  readme-boss-bar -b "MALENIA:12:4:0.35:3:gold:heavy:DEMIGOD FELLED" -o malenia.svg
  readme-boss-bar -b "MILESTONE 1:3:3" -b "MILESTONE 2:5:1" -o assets/boss_bar.svg
  readme-boss-bar --config config.example.json -o boss_bar.svg
  `);
}

if (args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

function parseBossSpec(val) {
  if (!val) return null;
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
  if (parts.length >= 6 && parts[5] !== '') {
    boss.barColor = parts[5].trim();
  }
  if (parts.length >= 7 && parts[6] !== '') {
    boss.shake = parts[6].trim();
  }
  if (parts.length >= 8 && parts[7] !== '') {
    boss.felledText = parts[7].trim();
  }
  return boss;
}

let bosses = [];
let outputFile = 'boss_bar.svg';
let options = {
  width: 700,
  height: 95,
  barWidth: 480
};

// Normalize arguments to support --flag=value as well as --flag value
const normalizedArgs = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--') && arg.includes('=')) {
    const eqIdx = arg.indexOf('=');
    normalizedArgs.push(arg.slice(0, eqIdx));
    normalizedArgs.push(arg.slice(eqIdx + 1));
  } else if (arg.startsWith('-b=') || arg.startsWith('-o=') || arg.startsWith('-c=') || arg.startsWith('-w=')) {
    const eqIdx = arg.indexOf('=');
    normalizedArgs.push(arg.slice(0, eqIdx));
    normalizedArgs.push(arg.slice(eqIdx + 1));
  } else {
    normalizedArgs.push(arg);
  }
}

for (let i = 0; i < normalizedArgs.length; i++) {
  const arg = normalizedArgs[i];

  if (arg === '-b' || arg === '--boss') {
    const val = normalizedArgs[++i];
    if (val) {
      const boss = parseBossSpec(val);
      if (boss) bosses.push(boss);
    }
  } else if (arg === '-c' || arg === '--config') {
    const configFile = normalizedArgs[++i];
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
          if (parsed.interval || parsed.speed || parsed.hitInterval) {
            options.hitInterval = parseFloat(parsed.interval || parsed.speed || parsed.hitInterval);
          }
          if (parsed.dmg || parsed.damagePerHit || parsed.damage) {
            options.damagePerHit = parseInt(parsed.dmg || parsed.damagePerHit || parsed.damage, 10);
          }
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
    outputFile = normalizedArgs[++i] || outputFile;
  } else if (arg === '-w' || arg === '--width') {
    options.width = parseInt(normalizedArgs[++i], 10) || options.width;
  } else if (arg === '--height') {
    options.height = parseInt(normalizedArgs[++i], 10) || options.height;
  } else if (arg === '--bar-width') {
    options.barWidth = parseInt(normalizedArgs[++i], 10) || options.barWidth;
  } else if (arg === '--shake') {
    options.shake = normalizedArgs[++i];
  } else if (arg === '--theme' || arg === '--color' || arg === '--bar-color') {
    options.barColor = normalizedArgs[++i];
  } else if (arg === '--sparks') {
    const next = normalizedArgs[i + 1];
    if (next !== undefined && !next.startsWith('-')) {
      options.sparks = next !== 'false' && next !== '0';
      i++;
    } else {
      options.sparks = true;
    }
  } else if (arg === '--no-sparks') {
    options.sparks = false;
  } else if (arg === '--flash' || arg === '--hit-flash') {
    options.hitFlash = normalizedArgs[++i];
  } else if (arg === '--felled-text' || arg === '--felled') {
    options.felledText = normalizedArgs[++i];
  } else if (arg === '--dmg-pop' || arg === '--popup') {
    const next = normalizedArgs[i + 1];
    if (next !== undefined && !next.startsWith('-')) {
      options.dmgPop = (next === 'false' || next === '0') ? false : next;
      i++;
    } else {
      options.dmgPop = true;
    }
  } else if (arg === '--no-dmg-pop') {
    options.dmgPop = false;
  } else if (arg === '--interval' || arg === '--speed') {
    options.hitInterval = parseFloat(normalizedArgs[++i]);
  } else if (arg === '--dmg' || arg === '--damage' || arg === '--damage-per-hit') {
    options.damagePerHit = parseInt(normalizedArgs[++i], 10);
  } else if (arg === '--hits') {
    options.hits = parseInt(normalizedArgs[++i], 10);
  } else if (arg === '--auto') {
    const next = normalizedArgs[i + 1];
    if (next === 'false' || next === '0') {
      options.auto = false;
      i++;
    } else if (next === 'true' || next === '1') {
      options.auto = true;
      i++;
    } else {
      options.auto = true;
    }
  } else if (arg === '--no-auto') {
    options.auto = false;
  } else if (arg === '--id' || arg === '--prefix') {
    options.id = normalizedArgs[++i];
  }
}

const svg = generateBossBarSVG(bosses, options);
const outDir = path.dirname(path.resolve(outputFile));
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outputFile, svg, 'utf8');
console.log(`✔ Successfully generated Boss Bar SVG at: ${outputFile}`);

