const { generateBossBarSVG } = require('../src/generator');

module.exports = (req, res) => {
  try {
    const query = req.query || {};
    let bosses = [];

    // Parse repeated ?boss=Name:Total:Hits or comma-separated ?bosses=...
    const rawBosses = query.boss || query.bosses;
    
    if (rawBosses) {
      const items = Array.isArray(rawBosses) 
        ? rawBosses 
        : rawBosses.split(',');

      items.forEach(item => {
        const parts = item.split(':');
        if (parts.length >= 3) {
          bosses.push({
            name: parts[0].trim(),
            totalBars: parseInt(parts[1], 10) || 3,
            hits: parseInt(parts[2], 10) || 0
          });
        }
      });
    }

    // Also support ?b1=Name:Total:Hits&b2=...
    for (let k of Object.keys(query)) {
      if (/^b\d+$/i.test(k)) {
        const parts = query[k].split(':');
        if (parts.length >= 3) {
          bosses.push({
            name: parts[0].trim(),
            totalBars: parseInt(parts[1], 10) || 3,
            hits: parseInt(parts[2], 10) || 0
          });
        }
      }
    }

    // Fallback if no params given
    if (bosses.length === 0) {
      bosses = [
        { name: "MILESTONE 1", totalBars: 3, hits: 3 },
        { name: "MILESTONE 2", totalBars: 5, hits: 1 }
      ];
    }

    const width = parseInt(query.width, 10) || 700;
    const svg = generateBossBarSVG(bosses, { width });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(svg);
  } catch (err) {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    const errSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="40"><text x="10" y="25" fill="red" font-family="monospace">Error: ${err.message}</text></svg>`;
    return res.status(500).send(errSvg);
  }
};
