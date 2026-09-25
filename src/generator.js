/**
 * Dynamic Retro Pixel Art Boss Health Bar Generator
 * Author: Ahmet Emir Şimşek (SS2Genji)
 */

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
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

const THEMES = {
  crimson: {
    name: 'crimson',
    bar: '#dc2626',
    pulse: '#ef4444',
    frameOuter: '#78350f',
    frameInner: '#d97706',
    frameBg: '#200606',
    emblem: '#ef4444',
    flash: '#fef08a',
    sparks: ['#fef08a', '#f59e0b']
  },
  red: {
    name: 'red',
    bar: '#dc2626',
    pulse: '#ef4444',
    frameOuter: '#78350f',
    frameInner: '#d97706',
    frameBg: '#200606',
    emblem: '#ef4444',
    flash: '#fef08a',
    sparks: ['#fef08a', '#f59e0b']
  },
  purple: {
    name: 'purple',
    bar: '#9333ea',
    pulse: '#a855f7',
    frameOuter: '#3b0764',
    frameInner: '#7e22ce',
    frameBg: '#1b0826',
    emblem: '#a855f7',
    flash: '#f3e8ff',
    sparks: ['#e9d5ff', '#c084fc']
  },
  cyan: {
    name: 'cyan',
    bar: '#0891b2',
    pulse: '#06b6d4',
    frameOuter: '#164e63',
    frameInner: '#0e7490',
    frameBg: '#08202a',
    emblem: '#38bdf8',
    flash: '#cffafe',
    sparks: ['#a5f3fc', '#38bdf8']
  },
  gold: {
    name: 'gold',
    bar: '#d97706',
    pulse: '#f59e0b',
    frameOuter: '#713f12',
    frameInner: '#b45309',
    frameBg: '#261805',
    emblem: '#facc15',
    flash: '#fef9c3',
    sparks: ['#fef08a', '#eab308']
  },
  green: {
    name: 'green',
    bar: '#16a34a',
    pulse: '#22c55e',
    frameOuter: '#14532d',
    frameInner: '#15803d',
    frameBg: '#05230e',
    emblem: '#4ade80',
    flash: '#dcfce7',
    sparks: ['#bbf7d0', '#22c55e']
  },
  orange: {
    name: 'orange',
    bar: '#ea580c',
    pulse: '#f97316',
    frameOuter: '#7c2d12',
    frameInner: '#c2410c',
    frameBg: '#270e05',
    emblem: '#fb923c',
    flash: '#ffedd5',
    sparks: ['#fed7aa', '#f97316']
  }
};

const AUTO_THEME_KEYS = ['crimson', 'cyan', 'purple', 'gold', 'orange', 'green'];

function resolveTheme(colorNameOrHex, index = 0) {
  if (!colorNameOrHex) {
    return THEMES.crimson;
  }
  const key = String(colorNameOrHex).trim().toLowerCase();
  if (THEMES[key]) {
    return THEMES[key];
  }
  const hexMatch = key.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hexColor = '#' + hexMatch[1];
    return {
      name: `custom_${index}`,
      bar: hexColor,
      pulse: hexColor,
      frameOuter: '#78350f',
      frameInner: '#d97706',
      frameBg: '#1f1515',
      emblem: hexColor,
      flash: '#fef08a',
      sparks: ['#fef08a', '#f59e0b']
    };
  }
  return THEMES.crimson;
}

function resolveShake(shake, defaultValue = 'medium') {
  if (shake === false || shake === 'false' || shake === 'none' || shake === '0') return 'none';
  if (shake === 'subtle') return 'subtle';
  if (shake === 'heavy') return 'heavy';
  if (shake === 'medium' || shake === true || shake === 'true' || shake === '1') return 'medium';
  return defaultValue;
}

function resolveSparks(sparks) {
  if (sparks === false || sparks === 'false' || sparks === 'none' || sparks === '0') return false;
  return true;
}

function generateBossBarSVG(bossesConfig = [], options = {}) {
  const isGlobalAuto = options.auto === true || options.auto === 'true' || options.auto === '1';

  // Fallback defaults if no bosses provided
  let rawBosses;
  if (bossesConfig && bossesConfig.length > 0) {
    rawBosses = bossesConfig;
  } else if (isGlobalAuto) {
    rawBosses = [
      { name: "MARGIT, THE FELL OMEN", totalBars: 6, hits: 3, damagePerHit: 2, hitInterval: 0.5, shake: 'heavy', barColor: 'crimson', felledText: 'GREAT ENEMY FELLED' },
      { name: "GODRICK THE GRAFTED", totalBars: 8, hits: 2, damagePerHit: 2, hitInterval: 0.6, shake: 'medium', barColor: 'gold' }
    ];
  } else {
    rawBosses = [
      { name: "MILESTONE 1", totalBars: 3, hits: 3 },
      { name: "MILESTONE 2", totalBars: 5, hits: 1 }
    ];
  }

  const svgWidth = parseInt(options.width, 10) || 700;
  const svgHeight = parseInt(options.height, 10) || 95;
  const containerWidth = parseInt(options.barWidth, 10) || 480;
  const containerY = 36;
  const barHeight = 16;

  // Helper to calculate segment layout for a given totalBars
  function getBarLayout(totalBars) {
    let gap = 8;
    if (totalBars >= 25) gap = 2;
    else if (totalBars >= 16) gap = 3;
    else if (totalBars >= 10) gap = 4;
    else if (totalBars >= 6) gap = 5;
    let segWidth = Math.max(3, Math.floor((containerWidth - (totalBars - 1) * gap) / totalBars));
    let actualWidth = totalBars * segWidth + (totalBars - 1) * gap;
    if (actualWidth > containerWidth) {
      gap = Math.max(1, Math.floor(gap / 2));
      segWidth = Math.max(2, Math.floor((containerWidth - (totalBars - 1) * gap) / totalBars));
      actualWidth = totalBars * segWidth + (totalBars - 1) * gap;
    }
    return { gap, segWidth, actualWidth };
  }

  // 1. Calculate Timelines for each Boss
  let timeline = [];
  let currentTime = 0;
  const uniqueThemes = new Map();

  rawBosses.forEach((boss, bIndex) => {
    const isBossAuto = isGlobalAuto || boss.auto === true || boss.auto === 'true' || boss.auto === '1';
    const totalBars = Math.max(1, parseInt(boss.totalBars, 10) || (isBossAuto ? 6 : 5));

    // Resolve damage per hit (bars drained per hit action)
    let damagePerHit = parseInt(
      boss.damagePerHit || boss.dmgPerHit ||
      options.damagePerHit || options.dmgPerHit ||
      boss.dmg || options.dmg,
      10
    );
    if (!damagePerHit || damagePerHit < 1) {
      if (isBossAuto && totalBars >= 8) damagePerHit = 2;
      else damagePerHit = 1;
    }

    // Resolve total damage and hit count
    let totalDamage;
    if (boss.hits !== undefined && boss.hits !== null && boss.hits !== '') {
      const requestedHits = Math.max(0, parseInt(boss.hits, 10) || 0);
      totalDamage = Math.min(totalBars, requestedHits * damagePerHit);
    } else if (boss.damage !== undefined && boss.damage !== null && boss.damage !== '') {
      totalDamage = Math.min(totalBars, Math.max(0, parseInt(boss.damage, 10) || 0));
    } else if (isBossAuto) {
      if (bIndex < rawBosses.length - 1) {
        totalDamage = totalBars; // Earlier bosses in sequence defeated
      } else {
        totalDamage = Math.max(1, Math.floor(totalBars * 0.5)); // Active foe partially damaged
      }
    } else {
      // In manual mode without explicit hits or damage specified,
      // default to draining the entire bar (full boss battle sequence)
      totalDamage = totalBars;
    }

    const hitsCount = totalDamage > 0 ? Math.ceil(totalDamage / damagePerHit) : 0;
    const isDefeated = totalDamage >= totalBars;
    const name = String(boss.name || `BOSS ${bIndex + 1}`).trim();

    // Resolve hit interval (speed)
    let hitInterval;
    const rawInterval = boss.hitInterval ?? boss.interval ?? boss.speed ??
      options.hitInterval ?? options.interval ?? options.speed;
    if (rawInterval !== undefined && rawInterval !== null && rawInterval !== '') {
      hitInterval = Math.max(0.08, parseFloat(rawInterval) || 0.5);
    } else if (isBossAuto) {
      hitInterval = hitsCount > 4 ? 0.38 : (hitsCount > 2 ? 0.5 : 0.7);
    } else if (hitsCount > 6) {
      hitInterval = 0.32;
    } else if (hitsCount > 3) {
      hitInterval = 0.55;
    } else {
      hitInterval = 0.85;
    }

    // Resolve Theme & Colors
    let themeChoice = boss.barColor || boss.theme || boss.color || options.barColor || options.theme || options.color;
    if (!themeChoice && isBossAuto) {
      themeChoice = AUTO_THEME_KEYS[bIndex % AUTO_THEME_KEYS.length];
    }
    const theme = resolveTheme(themeChoice, bIndex);
    uniqueThemes.set(theme.name, theme);

    const hitFlash = String(boss.hitFlash || options.hitFlash || theme.flash).trim();
    const sparks = resolveSparks(boss.sparks ?? options.sparks);

    // Resolve Shake
    let defaultShake = 'medium';
    if (isBossAuto) {
      defaultShake = (isDefeated || damagePerHit >= 3) ? 'heavy' : 'medium';
    }
    const shake = resolveShake(boss.shake ?? options.shake, defaultShake);

    // Defeated banner text
    const felledText = String(boss.felledText || options.felledText || 'GREAT ENEMY FELLED').trim();

    // Damage popup template
    const dmgPopOption = boss.dmgPop !== undefined ? boss.dmgPop : options.dmgPop;
    const showDmgPop = dmgPopOption !== false && dmgPopOption !== 'false' && dmgPopOption !== 'none';

    const startTime = currentTime;
    const leadIn = isDefeated ? 0.5 : 0.8;
    const hitTimes = [];
    let hitT = startTime + leadIn;

    for (let h = 0; h < hitsCount; h++) {
      hitTimes.push(hitT);
      hitT += hitInterval;
    }

    const holdTime = isDefeated ? 2.0 : 3.2;
    const duration = leadIn + (hitsCount * hitInterval) + holdTime;
    const endTime = startTime + duration;
    currentTime = endTime + 0.3; // brief gap between bosses

    const layout = getBarLayout(totalBars);

    timeline.push({
      bIndex,
      name,
      totalBars,
      damagePerHit,
      totalDamage,
      hitsCount,
      isDefeated,
      hitInterval,
      startTime,
      endTime,
      duration,
      hitTimes,
      layout,
      theme,
      hitFlash,
      sparks,
      shake,
      felledText,
      dmgPopOption,
      showDmgPop
    });
  });

  const totalTime = Math.max(currentTime, 8.0);
  const pct = (t) => Math.min(100, Math.max(0, (t / totalTime) * 100)).toFixed(2) + '%';

  // 2. Generate Dynamic CSS Keyframes
  let cssRules = [];

  cssRules.push(`
    .pixel-txt {
      font-family: 'Courier New', 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
  `);

  // Pulse animation rules for each unique theme
  uniqueThemes.forEach((th) => {
    cssRules.push(`
      .pulse-${th.name} {
        animation: pulse_${th.name} 2s infinite alternate;
      }
      @keyframes pulse_${th.name} {
        0% { fill: ${th.bar}; }
        100% { fill: ${th.pulse}; }
      }
    `);
  });

  // Build keyframes for each boss layer
  timeline.forEach((tb) => {
    const b = tb.bIndex;
    const startP = pct(tb.startTime);
    const inP = pct(tb.startTime + 0.25);
    const outStartP = pct(tb.endTime - 0.25);
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

    // Screen Shake Animation
    let shakeKeyframes = [`0%, ${pct(tb.startTime)} { transform: translate(0, 0); }`];
    if (tb.shake !== 'none' && tb.hitTimes.length > 0) {
      tb.hitTimes.forEach((ht) => {
        const shakeDur = Math.min(0.08, tb.hitInterval / 3);
        if (tb.shake === 'heavy') {
          shakeKeyframes.push(`
            ${pct(ht)} { transform: translate(-4px, 3px); }
            ${pct(ht + shakeDur * 0.6)} { transform: translate(4px, -3px); }
            ${pct(ht + shakeDur * 1.3)} { transform: translate(-2px, 2px); }
            ${pct(ht + shakeDur * 2)} { transform: translate(0, 0); }
          `);
        } else if (tb.shake === 'subtle') {
          shakeKeyframes.push(`
            ${pct(ht)} { transform: translate(-1px, 1px); }
            ${pct(ht + shakeDur)} { transform: translate(1px, -1px); }
            ${pct(ht + shakeDur * 2)} { transform: translate(0, 0); }
          `);
        } else {
          // medium / default
          shakeKeyframes.push(`
            ${pct(ht)} { transform: translate(-2px, 2px); }
            ${pct(ht + shakeDur)} { transform: translate(2px, -2px); }
            ${pct(ht + shakeDur * 2)} { transform: translate(0, 0); }
          `);
        }
      });
    }
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
    const { segWidth } = tb.layout;

    for (let i = 0; i < totalBars; i++) {
      const drainIndex = (totalBars - 1) - i;
      const getsHit = drainIndex < tb.totalDamage;

      if (getsHit) {
        const hitActionIndex = Math.floor(drainIndex / tb.damagePerHit);
        const hitT = tb.hitTimes[hitActionIndex];
        const hitP0 = pct(hitT - 0.04);
        const hitPFlash = pct(hitT);
        const drainTime = Math.min(0.18, tb.hitInterval * 0.6);
        const hitPDrain = pct(hitT + drainTime);

        cssRules.push(`
          .bar-${b}-${i} {
            animation: drain_${b}_${i} ${totalTime.toFixed(1)}s infinite;
          }
          @keyframes drain_${b}_${i} {
            0%, ${startP} { width: 0px; fill: ${tb.theme.bar}; }
            ${pct(tb.startTime + 0.3)}, ${hitP0} { width: ${segWidth}px; fill: ${tb.theme.bar}; }
            ${hitPFlash} { fill: ${tb.hitFlash}; }
            ${hitPDrain}, ${endP} { width: 0px; fill: ${tb.theme.bar}; }
            100% { width: 0px; }
          }
        `);

        if (tb.sparks) {
          cssRules.push(`
            .sparks-${b}-${i} {
              opacity: 0;
              animation: sparkAnim_${b}_${i} ${totalTime.toFixed(1)}s infinite;
            }
            @keyframes sparkAnim_${b}_${i} {
              0%, ${hitP0} { opacity: 0; transform: scale(0.6); }
              ${hitPFlash} { opacity: 1; transform: scale(1.2); }
              ${pct(hitT + drainTime * 0.9)} { opacity: 0; transform: scale(1.5); }
              100% { opacity: 0; }
            }
          `);
        }
      } else {
        // Stays full / alive
        cssRules.push(`
          .bar-${b}-${i} {
            animation: alive_${b}_${i} ${totalTime.toFixed(1)}s infinite, pulse_${tb.theme.name} 2s infinite alternate;
          }
          @keyframes alive_${b}_${i} {
            0%, ${startP} { width: 0px; }
            ${pct(tb.startTime + 0.3)}, ${endP} { width: ${segWidth}px; }
            100% { width: 0px; }
          }
        `);
      }
    }

    // Damage pop-up keyframes per hit
    if (tb.showDmgPop && tb.hitsCount > 0) {
      for (let h = 0; h < tb.hitsCount; h++) {
        const hitT = tb.hitTimes[h];
        cssRules.push(`
          .dmg-pop-${b}-${h} {
            opacity: 0;
            animation: dmgPopAnim_${b}_${h} ${totalTime.toFixed(1)}s infinite;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            font-weight: 900;
            fill: #facc15;
          }
          @keyframes dmgPopAnim_${b}_${h} {
            0%, ${pct(hitT)} { opacity: 0; transform: translateY(0); }
            ${pct(hitT + 0.06)} { opacity: 1; transform: translateY(-4px); }
            ${pct(hitT + 0.45)} { opacity: 1; transform: translateY(-13px); }
            ${pct(hitT + 0.85)}, 100% { opacity: 0; transform: translateY(-19px); }
          }
        `);
      }
    }

    // Tags & Defeat Banner Text
    if (tb.isDefeated) {
      const finalHitT = tb.hitTimes[tb.hitTimes.length - 1] || tb.startTime;
      const deathP = pct(finalHitT + 0.15);

      cssRules.push(`
        .tag-live-${b} {
          animation: tagLiveAnim${b} ${totalTime.toFixed(1)}s infinite;
        }
        @keyframes tagLiveAnim${b} {
          0%, ${deathP} { opacity: 1; }
          ${pct(finalHitT + 0.2)}, 100% { opacity: 0; }
        }

        .tag-felled-${b} {
          opacity: 0;
          animation: tagFelledAnim${b} ${totalTime.toFixed(1)}s infinite;
        }
        @keyframes tagFelledAnim${b} {
          0%, ${deathP} { opacity: 0; }
          ${pct(finalHitT + 0.25)}, ${outStartP} { opacity: 1; }
          ${endP}, 100% { opacity: 0; }
        }

        .felled-text-${b} {
          opacity: 0;
          animation: felledBannerAnim${b} ${totalTime.toFixed(1)}s infinite;
          font-family: 'Times New Roman', 'Georgia', serif;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 5px;
          fill: #fef08a;
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.8));
        }
        @keyframes felledBannerAnim${b} {
          0%, ${deathP} { opacity: 0; }
          ${pct(finalHitT + 0.25)}, ${outStartP} { opacity: 1; }
          ${endP}, 100% { opacity: 0; }
        }
      `);
    }
  });

  // 3. Render SVG Content
  let svgBodies = [];

  timeline.forEach((tb) => {
    const b = tb.bIndex;
    const totalBars = tb.totalBars;
    const { gap, segWidth, actualWidth } = tb.layout;
    const containerX = Math.round((svgWidth - actualWidth) / 2);

    let segmentsMarkup = [];

    for (let i = 0; i < totalBars; i++) {
      const segX = i * (segWidth + gap);
      const drainIndex = (totalBars - 1) - i;
      const getsHit = drainIndex < tb.totalDamage;

      segmentsMarkup.push(`
        <g transform="translate(${segX}, 0)">
          <!-- Frame Background -->
          <rect x="-2" y="-2" width="${segWidth + 4}" height="${barHeight + 4}" fill="${tb.theme.frameOuter}" />
          <rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" fill="${tb.theme.frameInner}" />
          <rect x="0" y="0" width="${segWidth}" height="${barHeight}" fill="${tb.theme.frameBg}" />
          <!-- Animated Fill Bar -->
          <rect x="0" y="0" height="${barHeight}" fill="${tb.theme.bar}" class="bar-${b}-${i}" />
          ${getsHit && tb.sparks ? `
          <!-- Golden/Themed Pixel Sparks -->
          <g class="sparks-${b}-${i}" transform="translate(${Math.round(segWidth / 2)}, ${Math.round(barHeight / 2)})">
            <rect x="-4" y="-4" width="2.5" height="2.5" fill="${tb.theme.sparks[0]}" />
            <rect x="4" y="-3" width="2.5" height="2.5" fill="${tb.theme.sparks[1]}" />
            <rect x="-3" y="4" width="2.5" height="2.5" fill="${tb.theme.sparks[1]}" />
            <rect x="3" y="4" width="2.5" height="2.5" fill="${tb.theme.sparks[0]}" />
          </g>` : ''}
        </g>
      `);
    }

    // Top Header info
    const emblemColor = tb.theme.emblem;
    const tagLive = tb.isDefeated ? '[BOSS]' : '[CURRENT FOE]';
    const tagLiveColor = tb.isDefeated ? '#ef4444' : '#38bdf8';

    // Damage popups markup
    let popupsMarkup = [];
    if (tb.showDmgPop && tb.hitsCount > 0) {
      for (let h = 0; h < tb.hitsCount; h++) {
        const fromDrain = h * tb.damagePerHit;
        const toDrain = Math.min(tb.totalDamage - 1, (h + 1) * tb.damagePerHit - 1);
        const dmgThisHit = toDrain - fromDrain + 1;

        const segStart = (totalBars - 1) - fromDrain;
        const segEnd = (totalBars - 1) - toDrain;
        const hitSegMin = Math.min(segStart, segEnd);
        const hitSegMax = Math.max(segStart, segEnd);
        const hitCenterX = containerX + Math.round((hitSegMin * (segWidth + gap) + hitSegMax * (segWidth + gap) + segWidth) / 2);

        let popText;
        if (typeof tb.dmgPopOption === 'string' && tb.dmgPopOption !== 'true') {
          popText = tb.dmgPopOption
            .replace(/\{N\}/g, dmgThisHit)
            .replace(/\{TOTAL\}/g, tb.totalDamage);
        } else {
          popText = `-${dmgThisHit} ${dmgThisHit > 1 ? 'BARS' : 'BAR'}`;
        }

        popupsMarkup.push(`
          <text x="${hitCenterX}" text-anchor="middle" y="30" class="dmg-pop-${b}-${h}">${escapeXml(popText)}</text>
        `);
      }
    }

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
            <text x="${actualWidth}" text-anchor="end" y="11" fill="${tagLiveColor}" class="pixel-txt tag-live-${b}">${tagLive}</text>
            <text x="${actualWidth}" text-anchor="end" y="11" fill="#f59e0b" class="pixel-txt tag-felled-${b}">[FELLED]</text>
            ` : `
            <text x="${actualWidth}" text-anchor="end" y="11" fill="${tagLiveColor}" class="pixel-txt">${tagLive}</text>
            `}
          </g>

          <!-- Segments -->
          <g transform="translate(${containerX}, ${containerY})">
            ${segmentsMarkup.join('')}
          </g>

          ${tb.isDefeated ? `
          <!-- Felled Banner Overlay -->
          <text x="${Math.round(svgWidth / 2)}" text-anchor="middle" y="48" class="felled-text-${b}">${escapeXml(tb.felledText)}</text>
          ` : ''}

          <!-- Hit Damage Pop-ups -->
          ${popupsMarkup.join('')}
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
  escapeXml,
  THEMES
};

