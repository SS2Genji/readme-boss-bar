/**
 * Dynamic Retro Pixel Art Boss Health Bar Generator
 * Author: Ahmet Emir Şimşek (SS2Genji)
 */

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateBossBarSVG(bossesConfig = [], options = {}) {
  // Default fallback if no config given
  const bosses = bossesConfig.length > 0 ? bossesConfig : [
    { name: "MILESTONE 1", totalBars: 3, hits: 3 },
    { name: "MILESTONE 2", totalBars: 5, hits: 1 }
  ];

  const svgWidth = options.width || 700;
  const svgHeight = options.height || 95;
  const containerWidth = options.barWidth || 480;
  const containerX = Math.round((svgWidth - containerWidth) / 2);
  const containerY = 36;
  const barHeight = 16;

  // 1. Calculate Timelines for each Boss
  // We need to know when each boss appears, gets hit, and transitions.
  let timeline = [];
  let currentTime = 0;

  bosses.forEach((boss, bIndex) => {
    const isDefeated = boss.hits >= boss.totalBars;
    const startTime = currentTime;
    const hitTimes = [];

    const leadIn = isDefeated ? 0.6 : 1.2; // fill time or aim time
    let hitT = startTime + leadIn;

    for (let h = 0; h < boss.hits; h++) {
      hitTimes.push(hitT);
      hitT += 1.0; // 1s between hits
    }

    const duration = isDefeated 
      ? (leadIn + boss.hits * 1.0 + 2.2) 
      : (leadIn + boss.hits * 1.0 + 4.5); // hold time for active boss

    const endTime = startTime + duration;
    currentTime = endTime + 0.3; // brief gap between bosses

    timeline.push({
      ...boss,
      bIndex,
      isDefeated,
      startTime,
      endTime,
      duration,
      hitTimes
    });
  });

  const totalTime = Math.max(currentTime, 10.0); // At least 10s total loop

  // Helper to convert seconds to percentage string
  const pct = (t) => Math.min(100, Math.max(0, (t / totalTime) * 100)).toFixed(2) + '%';

  // 2. Generate Dynamic CSS Keyframes
  let cssRules = [];

  // General pixel text & base animations
  cssRules.push(`
    .pixel-txt {
      font-family: 'Courier New', 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    .pulse-red {
      animation: pulseRed 2s infinite alternate;
    }
    @keyframes pulseRed {
      0% { fill: #dc2626; }
      100% { fill: #ef4444; }
    }
  `);

  // Build keyframes for each boss layer
  timeline.forEach((tb) => {
    const b = tb.bIndex;
    const startP = pct(tb.startTime);
    const inP = pct(tb.startTime + 0.3);
    const outStartP = pct(tb.endTime - 0.3);
    const endP = pct(tb.endTime);

    // Layer lifecycle (fade in & fade out)
    cssRules.push(`
      .boss-layer-${b} {
        opacity: 0;
        animation: bossLife${b} ${totalTime.toFixed(1)}s infinite;
      }
      @keyframes bossLife${b} {
        0%, ${startP} { opacity: 0; transform: translateY(3px); }
        ${inP}, ${outStartP} { opacity: 1; transform: translateY(0); }
        ${endP}, 100% { opacity: 0; transform: translateY(-3px); }
      }
    `);

    // Screen Shake Animation for this boss
    let shakeKeyframes = [`0%, ${pct(tb.startTime)} { transform: translate(0, 0); }`];
    tb.hitTimes.forEach((ht) => {
      const h0 = pct(ht);
      const h1 = pct(ht + 0.08);
      const h2 = pct(ht + 0.16);
      const h3 = pct(ht + 0.24);
      shakeKeyframes.push(`
        ${h0} { transform: translate(-2px, 2px); }
        ${h1} { transform: translate(2px, -2px); }
        ${h2} { transform: translate(-2px, 1px); }
        ${h3} { transform: translate(0, 0); }
      `);
    });
    shakeKeyframes.push(`${endP}, 100% { transform: translate(0, 0); }`);

    cssRules.push(`
      .shake-${b} {
        animation: shakeAnim${b} ${totalTime.toFixed(1)}s infinite;
      }
      @keyframes shakeAnim${b} {
        ${shakeKeyframes.join('\n')}
      }
    `);

    // Segment widths and drainage
    const totalBars = tb.totalBars;
    const gap = totalBars > 4 ? 6 : 8;
    const segWidth = Math.floor((containerWidth - (totalBars - 1) * gap) / totalBars);

    // Calculate which bars get hit (RIGHT TO LEFT)
    // Hit 0 hits (totalBars - 1)
    // Hit 1 hits (totalBars - 2)...
    for (let i = 0; i < totalBars; i++) {
      const hitIndex = (totalBars - 1) - i; // if hitIndex < tb.hits, this bar gets hit at tb.hitTimes[hitIndex]
      const getsHit = hitIndex < tb.hits;

      if (getsHit) {
        const hitT = tb.hitTimes[hitIndex];
        const hitP0 = pct(hitT - 0.05);
        const hitPFlash = pct(hitT);
        const hitPDrain = pct(hitT + 0.18);

        cssRules.push(`
          .bar-${b}-${i} {
            animation: drain_${b}_${i} ${totalTime.toFixed(1)}s infinite;
          }
          @keyframes drain_${b}_${i} {
            0%, ${startP} { width: 0px; }
            ${pct(tb.startTime + 0.4)}, ${hitP0} { width: ${segWidth}px; fill: #dc2626; }
            ${hitPFlash} { fill: #fef08a; }
            ${hitPDrain}, ${endP} { width: 0px; fill: #dc2626; }
            100% { width: 0px; }
          }

          .sparks-${b}-${i} {
            opacity: 0;
            animation: sparkAnim_${b}_${i} ${totalTime.toFixed(1)}s infinite;
          }
          @keyframes sparkAnim_${b}_${i} {
            0%, ${hitP0} { opacity: 0; transform: scale(0.6); }
            ${hitPFlash} { opacity: 1; transform: scale(1.2); }
            ${pct(hitT + 0.15)} { opacity: 0; transform: scale(1.6); }
            100% { opacity: 0; }
          }
        `);
      } else {
        // Stays alive / full
        cssRules.push(`
          .bar-${b}-${i} {
            animation: alive_${b}_${i} ${totalTime.toFixed(1)}s infinite;
          }
          @keyframes alive_${b}_${i} {
            0%, ${startP} { width: 0px; }
            ${pct(tb.startTime + 0.4)}, ${endP} { width: ${segWidth}px; }
            100% { width: 0px; }
          }
        `);
      }
    }

    // Tags & Defeat Text
    if (tb.isDefeated) {
      const finalHitT = tb.hitTimes[tb.hitTimes.length - 1] || tb.startTime;
      const deathP = pct(finalHitT + 0.2);

      cssRules.push(`
        .tag-live-${b} {
          animation: tagLiveAnim${b} ${totalTime.toFixed(1)}s infinite;
        }
        @keyframes tagLiveAnim${b} {
          0%, ${deathP} { opacity: 1; }
          ${pct(finalHitT + 0.25)}, 100% { opacity: 0; }
        }

        .tag-felled-${b} {
          opacity: 0;
          animation: tagFelledAnim${b} ${totalTime.toFixed(1)}s infinite;
        }
        @keyframes tagFelledAnim${b} {
          0%, ${deathP} { opacity: 0; }
          ${pct(finalHitT + 0.3)}, ${outStartP} { opacity: 1; }
          ${endP}, 100% { opacity: 0; }
        }

        .felled-text-${b} {
          opacity: 0;
          animation: felledBannerAnim${b} ${totalTime.toFixed(1)}s infinite;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          font-weight: 900;
          fill: #f59e0b;
          letter-spacing: 4px;
        }
        @keyframes felledBannerAnim${b} {
          0%, ${deathP} { opacity: 0; }
          ${pct(finalHitT + 0.3)}, ${outStartP} { opacity: 1; }
          ${endP}, 100% { opacity: 0; }
        }
      `);
    } else {
      // Active boss pop-up
      const firstHitT = tb.hitTimes[0];
      if (firstHitT) {
        cssRules.push(`
          .dmg-pop-${b} {
            opacity: 0;
            animation: dmgPopAnim${b} ${totalTime.toFixed(1)}s infinite;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            font-weight: 900;
            fill: #facc15;
          }
          @keyframes dmgPopAnim${b} {
            0%, ${pct(firstHitT)} { opacity: 0; transform: translateY(0); }
            ${pct(firstHitT + 0.08)} { opacity: 1; transform: translateY(-3px); }
            ${pct(firstHitT + 0.8)} { opacity: 1; transform: translateY(-13px); }
            ${pct(firstHitT + 1.4)}, 100% { opacity: 0; transform: translateY(-18px); }
          }
        `);
      }
    }
  });

  // 3. Render SVG Content
  let svgBodies = [];

  timeline.forEach((tb) => {
    const b = tb.bIndex;
    const totalBars = tb.totalBars;
    const gap = totalBars > 4 ? 6 : 8;
    const segWidth = Math.floor((containerWidth - (totalBars - 1) * gap) / totalBars);

    let segmentsMarkup = [];

    for (let i = 0; i < totalBars; i++) {
      const segX = i * (segWidth + gap);
      const hitIndex = (totalBars - 1) - i;
      const getsHit = hitIndex < tb.hits;

      segmentsMarkup.push(`
        <g transform="translate(${segX}, 0)">
          <!-- Frame Background -->
          <rect x="-2" y="-2" width="${segWidth + 4}" height="${barHeight + 4}" fill="#78350f" />
          <rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" fill="#d97706" />
          <rect x="0" y="0" width="${segWidth}" height="${barHeight}" fill="#200606" />
          <!-- Animated Fill Bar -->
          <rect x="0" y="0" height="${barHeight}" class="bar-${b}-${i} ${!getsHit ? 'pulse-red' : ''}" />
          ${getsHit ? `
          <!-- Golden Pixel Sparks -->
          <g class="sparks-${b}-${i}" transform="translate(${Math.round(segWidth / 2)}, ${Math.round(barHeight / 2)})">
            <rect x="-6" y="-6" width="3" height="3" fill="#fef08a" />
            <rect x="6" y="-4" width="3" height="3" fill="#f59e0b" />
            <rect x="-4" y="5" width="3" height="3" fill="#f59e0b" />
            <rect x="5" y="6" width="3" height="3" fill="#fef08a" />
          </g>` : ''}
        </g>
      `);
    }

    // Top Header info
    const emblemColor = tb.isDefeated ? '#991b1b' : '#38bdf8';
    const tagLive = tb.isDefeated ? '[BOSS]' : '[CURRENT FOE]';
    const tagLiveColor = tb.isDefeated ? '#ef4444' : '#38bdf8';
    const firstHitX = containerX + (totalBars - 1) * (segWidth + gap) + Math.round(segWidth / 2);

    svgBodies.push(`
      <g class="boss-layer-${b}">
        <g class="shake-${b}">
          <!-- Header (Name & Emblem) -->
          <g transform="translate(${containerX}, 22)">
            <!-- Pixel Emblem -->
            <rect x="0" y="2" width="12" height="10" fill="${emblemColor}" />
            <rect x="2" y="0" width="8" height="14" fill="${emblemColor}" />
            <rect x="3" y="4" width="2" height="3" fill="#0d1117" />
            <rect x="7" y="4" width="2" height="3" fill="#0d1117" />
            <rect x="5" y="9" width="2" height="2" fill="#0d1117" />

            <!-- Boss Name -->
            <text x="22" y="11" fill="#f8fafc" class="pixel-txt">${escapeXml(tb.name)}</text>
            
            ${tb.isDefeated ? `
            <!-- Live & Felled Tags -->
            <text x="${containerWidth - 70}" y="11" fill="${tagLiveColor}" class="pixel-txt tag-live-${b}">${tagLive}</text>
            <text x="${containerWidth - 75}" y="11" fill="#f59e0b" class="pixel-txt tag-felled-${b}">[FELLED]</text>
            ` : `
            <text x="${containerWidth - 110}" y="11" fill="${tagLiveColor}" class="pixel-txt">${tagLive}</text>
            `}
          </g>

          <!-- Segments -->
          <g transform="translate(${containerX}, ${containerY})">
            ${segmentsMarkup.join('')}
          </g>

          ${tb.isDefeated ? `
          <!-- Felled Banner Overlay -->
          <text x="${Math.round(svgWidth / 2) - 100}" y="49" class="felled-text-${b}">GREAT ENEMY FELLED</text>
          ` : `
          <!-- Hit Damage Pop-up -->
          <text x="${firstHitX}" y="30" class="dmg-pop-${b}">-1 BAR</text>
          `}
        </g>
      </g>
    `);
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="${svgHeight}" shape-rendering="crispEdges">
  <defs>
    <style><![CDATA[
      ${cssRules.join('\n')}
    ]]></style>
  </defs>
  ${svgBodies.join('\n')}
</svg>
`.trim();
}

module.exports = {
  generateBossBarSVG,
  escapeXml
};
