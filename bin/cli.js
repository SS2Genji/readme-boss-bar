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
  readme-boss-bar wizard

Wizard Mode:
  -W, --wizard, wizard          Launch the interactive step-by-step setup wizard

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
  --id, --prefix <scope>        CSS class and @keyframes namespace prefix
  -h, --help                    Show this help message

Examples:
  readme-boss-bar wizard
  readme-boss-bar --auto -o boss_bar.svg
  readme-boss-bar -b "RADAHN:10" --dmg 3 --interval 0.5 --theme purple --shake heavy -o radahn.svg
  readme-boss-bar -b "MALENIA:12:4:0.35:3:gold:heavy:DEMIGOD FELLED" -o malenia.svg
  readme-boss-bar -b "MILESTONE 1:3:3" -b "MILESTONE 2:5:1" -o assets/boss_bar.svg
  readme-boss-bar --config config.example.json -o boss_bar.svg
  `);
}

function createLineReader() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  const queue = [];
  let waitingResolve = null;

  rl.on('line', (line) => {
    if (waitingResolve) {
      const resolve = waitingResolve;
      waitingResolve = null;
      resolve(line);
    } else {
      queue.push(line);
    }
  });

  rl.on('close', () => {
    if (waitingResolve) {
      const resolve = waitingResolve;
      waitingResolve = null;
      resolve(null);
    }
  });

  return {
    async ask(question, defaultVal = '') {
      const prompt = defaultVal !== '' ? `${question} [${defaultVal}]: ` : `${question}: `;
      process.stdout.write(prompt);
      if (queue.length > 0) {
        const line = queue.shift();
        const trimmed = line.trim();
        return trimmed === '' ? defaultVal : trimmed;
      }
      return new Promise((resolve) => {
        waitingResolve = (ans) => {
          if (ans === null) {
            resolve(defaultVal);
          } else {
            const trimmed = ans.trim();
            resolve(trimmed === '' ? defaultVal : trimmed);
          }
        };
      });
    },
    close() {
      rl.close();
    }
  };
}

async function runWizard() {
  const reader = createLineReader();
  const askVal = (q, def) => reader.ask(q, def);

  console.log('\n============================================================');
  console.log('⚔️   README BOSS BAR - INTERACTIVE WIZARD   ⚔️');
  console.log('Design an epic retro souls boss health bar in seconds!');
  console.log('============================================================\n');

  console.log('Choose a configuration preset or custom setup:');
  console.log('  1) Quick Single Boss (STARCOURGE RADAHN - 10 bars, heavy impact)');
  console.log('  2) 42 School Milestone Run (Libft -> ft_printf -> push_swap)');
  console.log('  3) Elden Ring Boss Run (Margit -> Radahn -> Malenia)');
  console.log('  4) Epic 3-Phase Demigod (Ludwig -> Holy Blade -> Orphan)');
  console.log('  5) Custom Boss Setup (Step-by-step interactive questions)\n');

  const mode = await askVal('Select option (1-5)', '1');
  let stages = [];

  if (mode === '1') {
    stages = [
      {
        name: 'STARCOURGE RADAHN',
        totalBars: 10,
        hits: 4,
        damagePerHit: 3,
        hitInterval: 0.5,
        barColor: 'purple',
        shake: 'heavy',
        felledText: 'DEMIGOD FELLED'
      }
    ];
    console.log('\n✔ Selected: Quick Single Boss (Radahn)');
  } else if (mode === '2') {
    stages = [
      { name: 'CIRCLE 00 (LIBFT)', totalBars: 4, hits: 4, damagePerHit: 1, hitInterval: 0.4, barColor: 'crimson', shake: 'medium', felledText: 'LIBFT COMPLETED' },
      { name: 'CIRCLE 01 (FT_PRINTF)', totalBars: 4, hits: 4, damagePerHit: 1, hitInterval: 0.4, barColor: 'cyan', shake: 'medium', felledText: 'PRINTF COMPLETED' },
      { name: 'CIRCLE 02 (PUSH_SWAP)', totalBars: 6, hits: 3, damagePerHit: 2, hitInterval: 0.5, barColor: 'gold', shake: 'heavy', felledText: 'PUSH_SWAP FELLED' }
    ];
    console.log('\n✔ Selected: 42 School Milestone Run (3 stages)');
  } else if (mode === '3') {
    stages = [
      { name: 'MARGIT, THE FELL OMEN', totalBars: 6, hits: 3, damagePerHit: 2, hitInterval: 0.5, barColor: 'crimson', shake: 'heavy', felledText: 'GREAT ENEMY FELLED' },
      { name: 'STARCOURGE RADAHN', totalBars: 10, hits: 4, damagePerHit: 3, hitInterval: 0.5, barColor: 'purple', shake: 'heavy', felledText: 'DEMIGOD FELLED' },
      { name: 'MALENIA, BLADE OF MIQUELLA', totalBars: 8, hits: 4, damagePerHit: 2, hitInterval: 0.35, barColor: 'gold', shake: 'heavy', felledText: 'DEMIGOD FELLED' }
    ];
    console.log('\n✔ Selected: Elden Ring Boss Run (3 bosses)');
  } else if (mode === '4') {
    stages = [
      { name: 'LUDWIG THE ACCURSED', totalBars: 6, hits: 3, damagePerHit: 2, hitInterval: 0.45, barColor: 'green', shake: 'subtle', felledText: 'PHASE 1 COMPLETE' },
      { name: 'LUDWIG, HOLY BLADE', totalBars: 8, hits: 4, damagePerHit: 2, hitInterval: 0.35, barColor: 'cyan', shake: 'heavy', felledText: 'PHASE 2 COMPLETE' },
      { name: 'ORPHAN OF KOS', totalBars: 10, hits: 5, damagePerHit: 2, hitInterval: 0.25, barColor: 'crimson', shake: 'heavy', felledText: 'NIGHTMARE SLAIN' }
    ];
    console.log('\n✔ Selected: Epic 3-Phase Demigod');
  } else {
    const countAns = await askVal('How many boss stages / phases?', '1');
    const stageCount = Math.max(1, parseInt(countAns, 10) || 1);

    for (let i = 1; i <= stageCount; i++) {
      console.log(`\n--- Stage ${i} of ${stageCount} ---`);
      const name = await askVal(`Boss / Stage name`, `BOSS ${i}`);
      const barsStr = await askVal(`Total health bars (1-20)`, '8');
      const totalBars = Math.max(1, Math.min(40, parseInt(barsStr, 10) || 8));
      const dmgStr = await askVal(`Damage per hit (bars)`, '2');
      const damagePerHit = Math.max(1, parseInt(dmgStr, 10) || 2);
      const intervalStr = await askVal(`Hit speed / interval (seconds)`, '0.5');
      const hitInterval = Math.max(0.1, parseFloat(intervalStr) || 0.5);
      const totalHitsToDefeat = Math.ceil(totalBars / damagePerHit);
      const hitsStr = await askVal(`Hits executed (Enter for full defeat: ${totalHitsToDefeat} hits)`, `${totalHitsToDefeat}`);
      const parsedHits = parseInt(hitsStr, 10);
      const hits = isNaN(parsedHits) ? totalHitsToDefeat : Math.max(0, parsedHits);
      const theme = await askVal(`Theme (crimson, purple, cyan, gold, green, orange, or #hex)`, 'crimson');
      const shake = await askVal(`Screen shake (none, subtle, medium, heavy)`, 'medium');
      const felled = await askVal(`Victory banner text`, 'GREAT ENEMY FELLED');

      stages.push({
        name,
        totalBars,
        hits,
        damagePerHit,
        hitInterval,
        barColor: theme,
        shake,
        felledText: felled
      });
    }
  }

  console.log('\n--- Output Settings ---');
  const outFile = await askVal('Output SVG file path', 'boss_bar.svg');
  reader.close();

  const svg = generateBossBarSVG(stages);
  const outDir = path.dirname(path.resolve(outFile));
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outFile, svg, 'utf8');

  let mdUrl;
  let cliCmd;
  if (stages.length === 1) {
    const st = stages[0];
    const encodedName = encodeURIComponent(st.name);
    const safeTheme = st.barColor.startsWith('#') ? st.barColor.replace(/^#/, '') : encodeURIComponent(st.barColor);
    mdUrl = `https://readme-boss-bar.vercel.app/api?name=${encodedName}&bars=${st.totalBars}&dmg=${st.damagePerHit}&interval=${st.hitInterval}&theme=${safeTheme}&shake=${st.shake}`;
    const totalHitsToDefeat = Math.ceil(st.totalBars / st.damagePerHit);
    if (st.hits !== undefined && st.hits !== totalHitsToDefeat) {
      mdUrl += `&hits=${st.hits}`;
    }
    if (st.felledText && st.felledText !== 'GREAT ENEMY FELLED') {
      mdUrl += `&felled=${encodeURIComponent(st.felledText)}`;
    }
    const safeNameCli = st.name.replace(/"/g, '\\"');
    const safeFelledCli = (st.felledText || 'GREAT ENEMY FELLED').replace(/"/g, '\\"');
    cliCmd = `npx readme-boss-bar -b "${safeNameCli}:${st.totalBars}:${st.hits}:${st.hitInterval}:${st.damagePerHit}:${st.barColor}:${st.shake}:${safeFelledCli}" -o ${outFile}`;
  } else {
    const queryParts = stages.map((st, idx) => {
      const safeTheme = st.barColor.startsWith('#') ? st.barColor.replace(/^#/, '') : encodeURIComponent(st.barColor);
      return `b${idx + 1}=${encodeURIComponent(st.name)}:${st.totalBars}:${st.hits}:${st.hitInterval}:${st.damagePerHit}:${safeTheme}:${st.shake}:${encodeURIComponent(st.felledText || 'GREAT ENEMY FELLED')}`;
    }).join('&');
    mdUrl = `https://readme-boss-bar.vercel.app/api?${queryParts}`;
    const bArgs = stages.map(st => {
      const safeNameCli = st.name.replace(/"/g, '\\"');
      const safeFelledCli = (st.felledText || 'GREAT ENEMY FELLED').replace(/"/g, '\\"');
      return `-b "${safeNameCli}:${st.totalBars}:${st.hits}:${st.hitInterval}:${st.damagePerHit}:${st.barColor}:${st.shake}:${safeFelledCli}"`;
    }).join(' ');
    cliCmd = `npx readme-boss-bar ${bArgs} -o ${outFile}`;
  }

  console.log('\n============================================================');
  console.log(`✔ Successfully generated: ${outFile}`);
  console.log('============================================================\n');
  console.log('📋 Markdown embed for your GitHub README:');
  console.log(`![Boss Bar](${mdUrl})\n`);
  console.log('💻 Re-run CLI Command:');
  console.log(`${cliCmd}\n`);
  console.log('🎮 Or customize visually in your browser:');
  console.log('https://readme-boss-bar.vercel.app\n');
  process.exit(0);
}

if (args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

if (args.includes('--wizard') || args.includes('wizard') || args.includes('-W')) {
  runWizard();
  return;
}

function parseBossSpec(val) {
  if (!val) return null;
  const parts = String(val).split(/(?<!\\):/).map(s => s.replace(/\\:/g, ':'));
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

