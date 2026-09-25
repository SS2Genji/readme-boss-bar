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

Options:
  -b, --boss <name:totalBars:hits>   Add a boss (can be repeated)
  -c, --config <file.json>           Path to JSON configuration file
  -o, --output <file.svg>            Output SVG file path (default: boss_bar.svg)
  -w, --width <pixels>               SVG width (default: 700)
  -h, --help                         Show this help message

Examples:
  readme-boss-bar -b "MILESTONE 1:3:3" -b "MILESTONE 2:5:1" -o assets/boss_bar.svg
  readme-boss-bar --config my-bosses.json -o boss_bar.svg
  `);
}

if (args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

let bosses = [];
let outputFile = 'boss_bar.svg';
let width = 700;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '-b' || arg === '--boss') {
    const val = args[++i];
    if (val) {
      const parts = val.split(':');
      if (parts.length >= 3) {
        bosses.push({
          name: parts[0].trim(),
          totalBars: parseInt(parts[1], 10) || 3,
          hits: parseInt(parts[2], 10) || 0
        });
      }
    }
  } else if (arg === '-c' || arg === '--config') {
    const configFile = args[++i];
    if (configFile && fs.existsSync(configFile)) {
      try {
        const raw = fs.readFileSync(configFile, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          bosses = parsed;
        } else if (parsed.bosses && Array.isArray(parsed.bosses)) {
          bosses = parsed.bosses;
        }
      } catch (err) {
        console.error("Error reading config file:", err.message);
        process.exit(1);
      }
    }
  } else if (arg === '-o' || arg === '--output') {
    outputFile = args[++i] || outputFile;
  } else if (arg === '-w' || arg === '--width') {
    width = parseInt(args[++i], 10) || width;
  }
}

if (bosses.length === 0) {
  // Default sample
  bosses = [
    { name: "MILESTONE 1", totalBars: 3, hits: 3 },
    { name: "MILESTONE 2", totalBars: 5, hits: 1 }
  ];
}

const svg = generateBossBarSVG(bosses, { width });
const outDir = path.dirname(path.resolve(outputFile));
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outputFile, svg, 'utf8');
console.log(`✔ Successfully generated Boss Bar SVG at: ${outputFile}`);
