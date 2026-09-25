const { generateBossBarSVG, resolveAesthetic, resolveAnimation } = require('../src/generator');

function parseBossSpec(rawSpec, defaults = {}) {
  if (!rawSpec) return null;
  const parts = String(rawSpec).split(/(?<!\\):/).map(s => s.replace(/\\:/g, ':'));
  const boss = {
    name: parts[0]?.trim() || 'BOSS'
  };
  if (parts.length >= 2 && parts[1] !== '') {
    boss.totalBars = parseInt(parts[1], 10);
  }
  if (parts.length >= 3 && parts[2] !== '') {
    boss.hits = parseInt(parts[2], 10);
  } else if (defaults.hits !== undefined) {
    boss.hits = defaults.hits;
  }
  if (parts.length >= 4 && parts[3] !== '') {
    boss.hitInterval = parseFloat(parts[3]);
  } else if (defaults.hitInterval !== undefined) {
    boss.hitInterval = defaults.hitInterval;
  }
  if (parts.length >= 5 && parts[4] !== '') {
    boss.damagePerHit = parseInt(parts[4], 10);
  } else if (defaults.damagePerHit !== undefined) {
    boss.damagePerHit = defaults.damagePerHit;
  }
  if (parts.length >= 6 && parts[5] !== '') {
    boss.barColor = parts[5].trim();
  } else if (defaults.barColor !== undefined) {
    boss.barColor = defaults.barColor;
  }
  if (parts.length >= 7 && parts[6] !== '') {
    boss.shake = parts[6].trim();
  } else if (defaults.shake !== undefined) {
    boss.shake = defaults.shake;
  }
  if (parts.length >= 8 && parts[7] !== '') {
    boss.felledText = parts[7].trim();
  } else if (defaults.felledText !== undefined) {
    boss.felledText = defaults.felledText;
  }
  if (parts.length >= 9 && parts[8] !== '') {
    boss.style = resolveAesthetic(parts[8].trim()).name;
  } else if (defaults.style !== undefined) {
    boss.style = defaults.style;
  }
  if (parts.length >= 10 && parts[9] !== '') {
    boss.animation = resolveAnimation(parts[9].trim());
  } else if (defaults.animation !== undefined) {
    boss.animation = defaults.animation;
  }
  return boss;
}

module.exports = (req, res) => {
  try {
    const query = req.query || {};
    let bosses = [];

    // Parse options from granular query params
    const options = {
      width: parseInt(query.width, 10) || 700,
      height: parseInt(query.height, 10) || 95,
      barWidth: parseInt(query.barWidth, 10) || 480
    };

    if (query.style || query.aesthetic) {
      options.style = resolveAesthetic(query.style || query.aesthetic).name;
    }
    if (query.anim || query.animation) {
      options.animation = resolveAnimation(query.anim || query.animation);
    }
    if (query.shake) options.shake = query.shake;
    if (query.theme || query.barColor || query.color) {
      options.barColor = query.theme || query.barColor || query.color;
    }
    if (query.sparks !== undefined) {
      options.sparks = query.sparks !== 'false' && query.sparks !== '0';
    }
    if (query.flash || query.hitFlash) {
      options.hitFlash = query.flash || query.hitFlash;
    }
    if (query.felled || query.felledText) {
      options.felledText = query.felled || query.felledText;
    }
    if (query.dmgPop !== undefined || query.popup !== undefined) {
      const val = query.dmgPop !== undefined ? query.dmgPop : query.popup;
      options.dmgPop = (val === 'false' || val === '0') ? false : val;
    }
    if (query.auto === 'true' || query.auto === '1') {
      options.auto = true;
    }
    if (query.id || query.prefix) {
      options.id = query.id || query.prefix;
    }

    const granularDefaults = {};
    if (query.interval || query.speed) {
      granularDefaults.hitInterval = parseFloat(query.interval || query.speed);
      options.hitInterval = granularDefaults.hitInterval;
    }
    if (query.dmg || query.damage || query.damagePerHit) {
      granularDefaults.damagePerHit = parseInt(query.dmg || query.damage || query.damagePerHit, 10);
      options.damagePerHit = granularDefaults.damagePerHit;
    }
    if (query.hits !== undefined) {
      granularDefaults.hits = parseInt(query.hits, 10);
    }
    if (options.barColor) granularDefaults.barColor = options.barColor;
    if (options.shake) granularDefaults.shake = options.shake;
    if (options.felledText) granularDefaults.felledText = options.felledText;
    if (options.style) granularDefaults.style = options.style;
    if (options.animation) granularDefaults.animation = options.animation;

    // Parse repeated ?boss=... or comma-separated ?bosses=...
    const rawBosses = query.boss || query.bosses;
    if (rawBosses) {
      const items = Array.isArray(rawBosses) ? rawBosses : rawBosses.split(',');
      items.forEach(item => {
        const boss = parseBossSpec(item, granularDefaults);
        if (boss) bosses.push(boss);
      });
    }

    // Also support ?b1=Name:Total:Hits...&b2=... with natural numerical sorting
    const bKeys = Object.keys(query).filter(k => /^b\d+$/i.test(k)).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      return numA - numB;
    });
    for (let k of bKeys) {
      const boss = parseBossSpec(query[k], granularDefaults);
      if (boss) bosses.push(boss);
    }

    // Support single boss query params: ?name=RADAHN&bars=10&hits=2...
    if (bosses.length === 0 && (query.name || query.bossName)) {
      bosses.push({
        name: (query.name || query.bossName).trim(),
        totalBars: parseInt(query.bars || query.totalBars, 10) || 5,
        hits: query.hits !== undefined ? parseInt(query.hits, 10) : undefined,
        hitInterval: granularDefaults.hitInterval,
        damagePerHit: granularDefaults.damagePerHit,
        barColor: options.barColor,
        shake: options.shake,
        felledText: options.felledText,
        hitFlash: options.hitFlash,
        sparks: options.sparks,
        dmgPop: options.dmgPop,
        style: options.style,
        animation: options.animation
      });
    }

    const svg = generateBossBarSVG(bosses, options);

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(svg);
  } catch (err) {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const errSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="40"><text x="10" y="25" fill="red" font-family="monospace">Error: ${err.message}</text></svg>`;
    return res.status(500).send(errSvg);
  }
};
