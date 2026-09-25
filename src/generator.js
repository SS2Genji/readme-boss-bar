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

const AESTHETICS = {
  classic: {
    name: 'classic',
    label: 'Classic Retro',
    fontFamily: "'Courier New', 'Fira Code', 'JetBrains Mono', monospace",
    fontWeight: '800',
    letterSpacing: '1.5px',
    fontSize: '11.5px',
    defaultBanner: 'GREAT ENEMY FELLED',
    bannerFontFamily: "'Times New Roman', 'Georgia', serif",
    bannerFontSize: '15px',
    bannerLetterSpacing: '5px',
    bannerWeight: '900',
    bannerColor: '#fef08a',
    bannerGlow: 'rgba(245, 158, 11, 0.8)',
    tagLive: '[CURRENT FOE]',
    tagLiveDefeated: '[BOSS]',
    tagFelled: '[FELLED]',
    tagLiveDefeatedColor: '#ef4444',
    tagLiveColor: '#38bdf8',
    defaultShake: 'medium',
    defaultTheme: 'crimson'
  },
  souls: {
    name: 'souls',
    label: 'Souls Gothic',
    fontFamily: "'Cinzel', 'Trajan Pro', 'Times New Roman', 'Georgia', serif",
    fontWeight: '700',
    letterSpacing: '2.5px',
    fontSize: '11.5px',
    defaultBanner: 'GREAT ENEMY FELLED',
    bannerFontFamily: "'Cinzel', 'Trajan Pro', 'Times New Roman', 'Georgia', serif",
    bannerFontSize: '15.5px',
    bannerLetterSpacing: '6px',
    bannerWeight: '900',
    bannerColor: '#fef08a',
    bannerGlow: 'rgba(245, 158, 11, 0.9)',
    tagLive: '[CURRENT FOE]',
    tagLiveDefeated: '[GREAT FOE]',
    tagFelled: '[FELLED]',
    tagLiveDefeatedColor: '#f59e0b',
    tagLiveColor: '#facc15',
    defaultShake: 'heavy',
    defaultTheme: 'gold'
  },
  cyberpunk: {
    name: 'cyberpunk',
    label: 'Cyberpunk HUD',
    fontFamily: "'Orbitron', 'Share Tech Mono', 'Courier New', monospace",
    fontWeight: '800',
    letterSpacing: '2px',
    fontSize: '11px',
    defaultBanner: '// TARGET DESTROYED //',
    bannerFontFamily: "'Orbitron', 'Share Tech Mono', 'Courier New', monospace",
    bannerFontSize: '13.5px',
    bannerLetterSpacing: '4px',
    bannerWeight: '900',
    bannerColor: '#38bdf8',
    bannerGlow: 'rgba(6, 182, 212, 0.9)',
    tagLive: '// TARGET LOCK //',
    tagLiveDefeated: '// HOSTILE //',
    tagFelled: '// NEUTRALIZED //',
    tagLiveDefeatedColor: '#06b6d4',
    tagLiveColor: '#38bdf8',
    defaultShake: 'medium',
    defaultTheme: 'cyan'
  },
  pixel: {
    name: 'pixel',
    label: '8-Bit Arcade',
    fontFamily: "'Press Start 2P', 'Courier New', monospace",
    fontWeight: '700',
    letterSpacing: '1px',
    fontSize: '10px',
    defaultBanner: 'STAGE CLEAR',
    bannerFontFamily: "'Press Start 2P', 'Courier New', monospace",
    bannerFontSize: '12.5px',
    bannerLetterSpacing: '3px',
    bannerWeight: '900',
    bannerColor: '#facc15',
    bannerGlow: 'rgba(0, 0, 0, 0.9)',
    tagLive: '[1P TARGET]',
    tagLiveDefeated: '[1P BOSS]',
    tagFelled: '[CLEAR]',
    tagLiveDefeatedColor: '#ef4444',
    tagLiveColor: '#22c55e',
    defaultShake: 'medium',
    defaultTheme: 'crimson'
  },
  bloodborne: {
    name: 'bloodborne',
    label: 'Eldritch Horror',
    fontFamily: "'IM Fell English', 'Palatino Linotype', 'Book Antiqua', 'Times New Roman', serif",
    fontWeight: '700',
    letterSpacing: '2px',
    fontSize: '11.5px',
    defaultBanner: 'PREY SLAUGHTERED',
    bannerFontFamily: "'IM Fell English', 'Palatino Linotype', 'Book Antiqua', 'Times New Roman', serif",
    bannerFontSize: '15px',
    bannerLetterSpacing: '5px',
    bannerWeight: '900',
    bannerColor: '#f87171',
    bannerGlow: 'rgba(220, 38, 38, 0.9)',
    tagLive: '[ACTIVE PREY]',
    tagLiveDefeated: '[NIGHTMARE]',
    tagFelled: '[SLAUGHTERED]',
    tagLiveDefeatedColor: '#ef4444',
    tagLiveColor: '#dc2626',
    defaultShake: 'heavy',
    defaultTheme: 'crimson'
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal Dashboard',
    fontFamily: "system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif",
    fontWeight: '600',
    letterSpacing: '1px',
    fontSize: '11px',
    defaultBanner: 'STATUS: DEFEATED',
    bannerFontFamily: "system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif",
    bannerFontSize: '12px',
    bannerLetterSpacing: '2.5px',
    bannerWeight: '700',
    bannerColor: '#f8fafc',
    bannerGlow: 'rgba(255, 255, 255, 0.3)',
    tagLive: '[ACTIVE]',
    tagLiveDefeated: '[TARGET]',
    tagFelled: '[RESOLVED]',
    tagLiveDefeatedColor: '#38bdf8',
    tagLiveColor: '#22c55e',
    defaultShake: 'subtle',
    defaultTheme: 'green'
  }
};

function resolveAesthetic(styleName) {
  if (!styleName) return AESTHETICS.classic;
  const key = String(styleName).trim().toLowerCase();
  if (AESTHETICS[key]) return AESTHETICS[key];
  if (key === 'gothic' || key === 'elden' || key === 'eldenring' || key === 'dark_souls' || key === 'darksouls') return AESTHETICS.souls;
  if (key === 'scifi' || key === 'sci-fi' || key === 'cyber' || key === 'mech' || key === 'hud') return AESTHETICS.cyberpunk;
  if (key === 'retro' || key === 'arcade' || key === '8bit' || key === '8-bit' || key === 'nes') return AESTHETICS.pixel;
  if (key === 'clean' || key === 'modern' || key === 'sleek' || key === 'flat') return AESTHETICS.minimal;
  if (key === 'eldritch' || key === 'horror' || key === 'gothic_horror' || key === 'visceral') return AESTHETICS.bloodborne;
  return AESTHETICS.classic;
}

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

function renderEmblemMarkup(aesthetic, emblemColor, pfx = '', b = 0) {
  if (aesthetic.name === 'souls') {
    return `
      <!-- Elden Golden Cross Emblem -->
      <rect x="5" y="0" width="2" height="14" fill="${emblemColor}" />
      <rect x="0" y="5" width="12" height="2" fill="${emblemColor}" />
      <polygon points="6,3 8,6 6,9 4,6" fill="#fef08a" />
      <circle cx="6" cy="6" r="5" stroke="${emblemColor}" stroke-width="1" fill="none" opacity="0.8" />
    `;
  }
  if (aesthetic.name === 'cyberpunk') {
    return `
      <!-- Tactical Crosshair Reticle Emblem -->
      <circle cx="6" cy="7" r="5.5" stroke="${emblemColor}" stroke-width="1" fill="none" stroke-dasharray="3 1" />
      <line x1="6" y1="0" x2="6" y2="4" stroke="${emblemColor}" stroke-width="1.2" />
      <line x1="6" y1="10" x2="6" y2="14" stroke="${emblemColor}" stroke-width="1.2" />
      <line x1="0" y1="7" x2="4" y2="7" stroke="${emblemColor}" stroke-width="1.2" />
      <line x1="8" y1="7" x2="12" y2="7" stroke="${emblemColor}" stroke-width="1.2" />
      <circle cx="6" cy="7" r="1.5" fill="#fef08a" />
    `;
  }
  if (aesthetic.name === 'pixel') {
    return `
      <!-- 8-Bit Arcade Skull Emblem -->
      <g class="${pfx}emblem-pixel-${b}">
        <rect x="1" y="0" width="10" height="2" fill="${emblemColor}" />
        <rect x="0" y="2" width="12" height="7" fill="${emblemColor}" />
        <rect x="2" y="9" width="8" height="4" fill="${emblemColor}" />
        <!-- Eye Sockets & Glowing Pixel Pupils -->
        <rect x="2" y="4" width="2.5" height="3" fill="#050811" />
        <rect x="7.5" y="4" width="2.5" height="3" fill="#050811" />
        <rect x="2.5" y="4.5" width="1.5" height="1.5" fill="#ef4444" />
        <rect x="8" y="4.5" width="1.5" height="1.5" fill="#ef4444" />
        <!-- Teeth -->
        <rect x="3" y="10" width="1.5" height="2" fill="#050811" />
        <rect x="5.5" y="10" width="1" height="2" fill="#050811" />
        <rect x="7.5" y="10" width="1.5" height="2" fill="#050811" />
      </g>
    `;
  }
  if (aesthetic.name === 'bloodborne') {
    return `
      <!-- Hunter's Mark Rune Emblem -->
      <rect x="5.5" y="0" width="1.5" height="15" fill="${emblemColor}" />
      <path d="M 1 2 Q 5.5 5 5.5 9" stroke="${emblemColor}" stroke-width="1.5" fill="none" />
      <path d="M 11 2 Q 6.5 5 6.5 9" stroke="${emblemColor}" stroke-width="1.5" fill="none" />
      <line x1="2" y1="8" x2="10" y2="8" stroke="${emblemColor}" stroke-width="1.5" />
    `;
  }
  if (aesthetic.name === 'minimal') {
    return `
      <!-- Pulsing Dot Beacon Emblem -->
      <g transform="translate(6, 7)">
        <circle cx="0" cy="0" r="3.5" fill="${emblemColor}" />
        <circle cx="0" cy="0" r="6" stroke="${emblemColor}" stroke-width="1.2" fill="none" opacity="0.6" class="${pfx}beacon-ping-${b}" />
      </g>
    `;
  }
  // Classic 8-bit crest
  return `
    <!-- Pixel Emblem -->
    <rect x="0" y="2" width="12" height="10" fill="${emblemColor}" />
    <rect x="2" y="0" width="8" height="14" fill="${emblemColor}" />
    <rect x="3" y="4" width="2" height="3" fill="#0d1117" />
    <rect x="7" y="4" width="2" height="3" fill="#0d1117" />
    <rect x="5" y="9" width="2" height="2" fill="#0d1117" />
  `;
}

function renderParticleMarkup(aesthetic, theme) {
  if (aesthetic.name === 'souls') {
    return `
      <!-- Golden Ember Particles -->
      <circle cx="-5" cy="0" r="1.5" fill="#facc15" />
      <circle cx="0" cy="2" r="2" fill="#f59e0b" />
      <circle cx="5" cy="-2" r="1.5" fill="#fef08a" />
      <circle cx="-2" cy="-4" r="1.2" fill="#ea580c" />
      <circle cx="3" cy="4" r="1" fill="#facc15" />
    `;
  }
  if (aesthetic.name === 'cyberpunk') {
    return `
      <!-- Cyber Bits / Glitch Slices -->
      <rect x="-8" y="-4" width="7" height="1.5" fill="#06b6d4" />
      <rect x="2" y="-1" width="9" height="1.5" fill="#facc15" />
      <rect x="-5" y="3" width="6" height="1.5" fill="#38bdf8" />
      <rect x="4" y="5" width="5" height="1" fill="#ffffff" />
    `;
  }
  if (aesthetic.name === 'pixel') {
    return `
      <!-- Pixel Block Debris -->
      <rect x="-7" y="-6" width="3" height="3" fill="${theme.sparks[0]}" />
      <rect x="5" y="-5" width="3" height="3" fill="${theme.sparks[1]}" />
      <rect x="-6" y="4" width="3" height="3" fill="${theme.sparks[1]}" />
      <rect x="6" y="5" width="3" height="3" fill="${theme.sparks[0]}" />
    `;
  }
  if (aesthetic.name === 'bloodborne') {
    return `
      <!-- Visceral Blood Droplets -->
      <circle cx="-4" cy="0" r="1.8" fill="#ef4444" />
      <circle cx="4" cy="2" r="1.8" fill="#b91c1c" />
      <circle cx="-1" cy="4" r="2.2" fill="#dc2626" />
      <path d="M 2 1 Q 3 6 3 8 Q 2 9 1 8 Q 1 6 2 1 Z" fill="#991b1b" />
    `;
  }
  if (aesthetic.name === 'minimal') {
    return `
      <!-- Soft Ambient Ping Ring -->
      <circle cx="0" cy="0" r="3" stroke="${theme.pulse}" stroke-width="1.5" fill="none" opacity="0.9" />
      <circle cx="0" cy="0" r="1.5" fill="${theme.flash}" />
    `;
  }
  // Classic Sparks
  return `
    <!-- Pixel Sparks -->
    <rect x="-4" y="-4" width="2.5" height="2.5" fill="${theme.sparks[0]}" />
    <rect x="4" y="-3" width="2.5" height="2.5" fill="${theme.sparks[1]}" />
    <rect x="-3" y="4" width="2.5" height="2.5" fill="${theme.sparks[1]}" />
    <rect x="3" y="4" width="2.5" height="2.5" fill="${theme.sparks[0]}" />
  `;
}

function renderContainerBrackets(aesthetic, theme, actualWidth, barHeight, pfx = '', b = 0) {
  if (aesthetic.name === 'souls') {
    return `
      <!-- Ornate Filigree Brackets -->
      <g class="${pfx}brackets-souls-${b}">
        <!-- Double-lined Antique Gold Container Frame -->
        <rect x="-6" y="-3.5" width="${actualWidth + 12}" height="${barHeight + 7}" fill="none" stroke="${theme.frameOuter}" stroke-width="1.2" opacity="0.85" />
        <rect x="-3" y="-1.5" width="${actualWidth + 6}" height="${barHeight + 3}" fill="none" stroke="${theme.frameInner}" stroke-width="0.8" opacity="0.9" />
        <!-- Corner Filigree Scrollwork Flourishes -->
        <path d="M -8,2 L -8,-4 L -2,-4 M -6,-2 L -2,-6" stroke="${theme.frameInner}" stroke-width="1" fill="none" />
        <path d="M -8,${barHeight-2} L -8,${barHeight+4} L -2,${barHeight+4} M -6,${barHeight+2} L -2,${barHeight+6}" stroke="${theme.frameInner}" stroke-width="1" fill="none" />
        <path d="M ${actualWidth+8},2 L ${actualWidth+8},-4 L ${actualWidth+2},-4 M ${actualWidth+6},-2 L ${actualWidth+2},-6" stroke="${theme.frameInner}" stroke-width="1" fill="none" />
        <path d="M ${actualWidth+8},${barHeight-2} L ${actualWidth+8},${barHeight+4} L ${actualWidth+2},${barHeight+4} M ${actualWidth+6},${barHeight+2} L ${actualWidth+2},${barHeight+6}" stroke="${theme.frameInner}" stroke-width="1" fill="none" />
        <!-- Prominent Gothic Finials & Grand Filigree Wings -->
        <path d="M -24,${barHeight/2} C -20,-7 -8,-6 -2,-3 L -1,${barHeight/2} L -2,${barHeight+3} C -8,${barHeight+6} -20,${barHeight+7} -24,${barHeight/2} Z" stroke="${theme.frameInner}" stroke-width="1.2" fill="${theme.frameOuter}" />
        <path d="M -16,${barHeight/2} L -10,-4 L -4,-1 L -1,${barHeight/2} L -4,${barHeight+1} L -10,${barHeight+4} Z" stroke="${theme.frameInner}" stroke-width="1.2" fill="${theme.frameOuter}" />
        <polygon points="-15,${barHeight/2} -10,${barHeight/2 - 3} -6,${barHeight/2} -10,${barHeight/2 + 3}" fill="#facc15" />
        <circle cx="-10" cy="${barHeight/2}" r="1.5" fill="#fef08a" />
        <circle cx="-20" cy="${barHeight/2}" r="1.2" fill="#facc15" />
        <path d="M ${actualWidth+24},${barHeight/2} C ${actualWidth+20},-7 ${actualWidth+8},-6 ${actualWidth+2},-3 L ${actualWidth+1},${barHeight/2} L ${actualWidth+2},${barHeight+3} C ${actualWidth+8},${barHeight+6} ${actualWidth+20},${barHeight+7} ${actualWidth+24},${barHeight/2} Z" stroke="${theme.frameInner}" stroke-width="1.2" fill="${theme.frameOuter}" />
        <path d="M ${actualWidth+16},${barHeight/2} L ${actualWidth+10},-4 L ${actualWidth+4},-1 L ${actualWidth+1},${barHeight/2} L ${actualWidth+4},${barHeight+1} L ${actualWidth+10},${barHeight+4} Z" stroke="${theme.frameInner}" stroke-width="1.2" fill="${theme.frameOuter}" />
        <polygon points="${actualWidth+15},${barHeight/2} ${actualWidth+10},${barHeight/2 - 3} ${actualWidth+6},${barHeight/2} ${actualWidth+10},${barHeight/2 + 3}" fill="#facc15" />
        <circle cx="${actualWidth+10}" cy="${barHeight/2}" r="1.5" fill="#fef08a" />
        <circle cx="${actualWidth+20}" cy="${barHeight/2}" r="1.2" fill="#facc15" />
        <!-- Gothic Arch Center Crest -->
        <path d="M ${Math.round(actualWidth/2)-18},-3.5 Q ${Math.round(actualWidth/2)},-9 ${Math.round(actualWidth/2)+18},-3.5" stroke="${theme.frameInner}" stroke-width="1.2" fill="none" />
        <polygon points="${Math.round(actualWidth/2)},-9.5 ${Math.round(actualWidth/2)+4},-4.5 ${Math.round(actualWidth/2)},-2 ${Math.round(actualWidth/2)-4},-4.5" fill="#facc15" stroke="${theme.frameOuter}" stroke-width="0.8" />
      </g>
    `;
  }
  if (aesthetic.name === 'cyberpunk') {
    return `
      <!-- Tactical HUD Brackets -->
      <g class="${pfx}brackets-cyber-${b}">
        <path d="M -6,0 L -12,0 L -16,${barHeight/2} L -12,${barHeight} L -6,${barHeight}" stroke="${theme.emblem}" stroke-width="1.5" fill="none" opacity="0.85" />
        <line x1="-16" y1="${barHeight/2}" x2="-8" y2="${barHeight/2}" stroke="${theme.emblem}" stroke-width="1" opacity="0.6" />
        <path d="M ${actualWidth+6},0 L ${actualWidth+12},0 L ${actualWidth+16},${barHeight/2} L ${actualWidth+12},${barHeight} L ${actualWidth+6},${barHeight}" stroke="${theme.emblem}" stroke-width="1.5" fill="none" opacity="0.85" />
        <line x1="${actualWidth+8}" y1="${barHeight/2}" x2="${actualWidth+16}" y2="${barHeight/2}" stroke="${theme.emblem}" stroke-width="1" opacity="0.6" />
      </g>
    `;
  }
  if (aesthetic.name === 'pixel') {
    return `
      <!-- 8-Bit Stepped Pixel Brackets -->
      <g class="${pfx}bracket-pixel-${b}">
        <rect x="-10" y="5" width="2" height="${barHeight - 10}" fill="${theme.frameInner}" />
        <rect x="-8" y="3" width="2" height="${barHeight - 6}" fill="${theme.frameOuter}" />
        <rect x="-6" y="1" width="2" height="${barHeight - 2}" fill="${theme.frameInner}" />
        <rect x="-4" y="-1" width="2" height="${barHeight + 2}" fill="#000000" />
        <rect x="${actualWidth + 2}" y="-1" width="2" height="${barHeight + 2}" fill="#000000" />
        <rect x="${actualWidth + 4}" y="1" width="2" height="${barHeight - 2}" fill="${theme.frameInner}" />
        <rect x="${actualWidth + 6}" y="3" width="2" height="${barHeight - 6}" fill="${theme.frameOuter}" />
        <rect x="${actualWidth + 8}" y="5" width="2" height="${barHeight - 10}" fill="${theme.frameInner}" />
        <!-- Stepped Pixel Corners -->
        <rect x="-4" y="-3" width="6" height="2" fill="#000" /><rect x="-4" y="-3" width="2" height="6" fill="#000" />
        <rect x="-4" y="${barHeight+1}" width="6" height="2" fill="#000" /><rect x="-4" y="${barHeight-3}" width="2" height="6" fill="#000" />
        <rect x="${actualWidth-2}" y="-3" width="6" height="2" fill="#000" /><rect x="${actualWidth+2}" y="-3" width="2" height="6" fill="#000" />
        <rect x="${actualWidth-2}" y="${barHeight+1}" width="6" height="2" fill="#000" /><rect x="${actualWidth+2}" y="${barHeight-3}" width="2" height="6" fill="#000" />
      </g>
    `;
  }
  if (aesthetic.name === 'bloodborne') {
    // Generate visceral barbed thorn teeth along rails
    const step = 20;
    const count = Math.min(24, Math.floor(actualWidth / step));
    const extraTeeth = [];
    for (let s = 1; s < count; s++) {
      const sx = Math.round(s * (actualWidth / count));
      extraTeeth.push(`<polygon points="${sx-3},-2 ${sx},-5 ${sx+3},-2" fill="${theme.frameOuter}" stroke="${theme.frameInner}" stroke-width="0.8" />`);
      extraTeeth.push(`<polygon points="${sx-3},${barHeight+2} ${sx},${barHeight+5} ${sx+3},${barHeight+2}" fill="${theme.frameOuter}" stroke="${theme.frameInner}" stroke-width="0.8" />`);
    }
    return `
      <!-- Distressed Jagged Iron Brackets -->
      <g class="${pfx}brackets-blood-${b}">
        <path d="M -16,${barHeight/2} L -10,-4 L -5,0 L -9,${barHeight/2} L -5,${barHeight} L -10,${barHeight+4} Z" fill="#2d060e" stroke="${theme.frameOuter}" stroke-width="1.2" />
        <polygon points="-12,${barHeight/2} -7,${barHeight/2 - 2.5} -3,${barHeight/2} -7,${barHeight/2 + 2.5}" fill="#dc2626" />
        <line x1="-14" y1="${barHeight/2}" x2="-1" y2="${barHeight/2}" stroke="#ef4444" stroke-width="1" />
        <path d="M ${actualWidth+16},${barHeight/2} L ${actualWidth+10},-4 L ${actualWidth+5},0 L ${actualWidth+9},${barHeight/2} L ${actualWidth+5},${barHeight} L ${actualWidth+10},${barHeight+4} Z" fill="#2d060e" stroke="${theme.frameOuter}" stroke-width="1.2" />
        <polygon points="${actualWidth+12},${barHeight/2} ${actualWidth+7},${barHeight/2 - 2.5} ${actualWidth+3},${barHeight/2} ${actualWidth+7},${barHeight/2 + 2.5}" fill="#dc2626" />
        <line x1="${actualWidth+14}" y1="${barHeight/2}" x2="${actualWidth+1}" y2="${barHeight/2}" stroke="#ef4444" stroke-width="1" />
        <!-- Top & Bottom Barbed Thorn Spikes -->
        <polygon points="${Math.round(actualWidth*0.25)},-2 ${Math.round(actualWidth*0.25)+4},-5 ${Math.round(actualWidth*0.25)+8},-2" fill="${theme.frameOuter}" stroke="${theme.frameInner}" stroke-width="0.8" />
        <polygon points="${Math.round(actualWidth*0.75)},-2 ${Math.round(actualWidth*0.75)+4},-5 ${Math.round(actualWidth*0.75)+8},-2" fill="${theme.frameOuter}" stroke="${theme.frameInner}" stroke-width="0.8" />
        <polygon points="${Math.round(actualWidth*0.35)},${barHeight+2} ${Math.round(actualWidth*0.35)+4},${barHeight+5} ${Math.round(actualWidth*0.35)+8},${barHeight+2}" fill="${theme.frameOuter}" stroke="${theme.frameInner}" stroke-width="0.8" />
        <polygon points="${Math.round(actualWidth*0.65)},${barHeight+2} ${Math.round(actualWidth*0.65)+4},${barHeight+5} ${Math.round(actualWidth*0.65)+8},${barHeight+2}" fill="${theme.frameOuter}" stroke="${theme.frameInner}" stroke-width="0.8" />
        ${extraTeeth.join('\n        ')}
      </g>
    `;
  }
  if (aesthetic.name === 'minimal') {
    return `
      <!-- Sleek Modern Pill Rail -->
      <g class="${pfx}brackets-minimal-${b}">
        <rect x="-6" y="-3" width="${actualWidth + 12}" height="${barHeight + 6}" rx="5" ry="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="-8" y1="3" x2="-8" y2="${barHeight - 3}" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="-8" cy="${barHeight/2}" r="1.5" fill="${theme.pulse}" />
        <line x1="${actualWidth + 8}" y1="3" x2="${actualWidth + 8}" y2="${barHeight - 3}" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="${actualWidth + 8}" cy="${barHeight/2}" r="1.5" fill="${theme.pulse}" />
      </g>
    `;
  }
  return '';
}

function renderSegmentMarkup(tb, i, segX, segWidth, barHeight, getsHit, pfx, b) {
  const aesthetic = tb.aesthetic;
  const theme = tb.theme;
  const gap = tb.layout?.gap ?? 8;
  const particleMarkup = (getsHit && tb.sparks)
    ? `<g class="${pfx}sparks-${b}-${i}" transform="translate(${Math.round(segWidth / 2)}, ${Math.round(barHeight / 2)})">${renderParticleMarkup(aesthetic, theme)}</g>`
    : '';

  if (aesthetic.name === 'minimal') {
    return `
      <g transform="translate(${segX}, 0)" class="${pfx}track-minimal-${b}">
        <!-- Minimal Pill Track -->
        <rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" rx="4" ry="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
        <rect x="0" y="0" width="${segWidth}" height="${barHeight}" rx="3.5" ry="3.5" fill="#0b0f19" />
        <!-- Animated Fill Bar -->
        <rect x="0" y="0" height="${barHeight}" rx="3.5" ry="3.5" fill="${theme.bar}" class="${pfx}bar-${b}-${i}" />
        <!-- Sleek Sheen Rail -->
        <line x1="3" y1="1" x2="${Math.max(3, segWidth - 3)}" y2="1" stroke="rgba(255,255,255,0.22)" stroke-width="0.8" stroke-linecap="round" />
        ${particleMarkup}
      </g>
    `;
  }

  if (aesthetic.name === 'cyberpunk') {
    return `
      <g transform="translate(${segX}, 0) skewX(-20)">
        <!-- Cyber HUD Chamfered Segment -->
        <rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" fill="rgba(0,0,0,0.8)" stroke="${theme.frameInner}" stroke-width="1" />
        <rect x="0" y="0" width="${segWidth}" height="${barHeight}" fill="#08101a" />
        <!-- 45° Chamfered Polygon Accent -->
        <polygon points="0,3 3,0 ${segWidth-3},0 ${segWidth},3 ${segWidth},${barHeight-3} ${segWidth-3},${barHeight} 3,${barHeight} 0,${barHeight-3}" fill="none" stroke="${theme.frameInner}" stroke-width="0.8" opacity="0.6" />
        <!-- Animated Fill Bar -->
        <rect x="0" y="0" height="${barHeight}" fill="${theme.bar}" class="${pfx}bar-${b}-${i}" />
        <!-- Cyber Tech Scanline -->
        <line x1="0" y1="${barHeight/2}" x2="${segWidth}" y2="${barHeight/2}" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2 2" />
        ${particleMarkup}
      </g>
    `;
  }

  if (aesthetic.name === 'pixel') {
    const bPad = Math.max(1, Math.min(3, Math.floor(gap / 2)));
    const bevelLines = [];
    if (bPad >= 3) {
      bevelLines.push(`<rect x="-3" y="-3" width="${segWidth + 6}" height="${barHeight + 6}" fill="#000000" />`);
      bevelLines.push(`<rect x="-2" y="-2" width="${segWidth + 4}" height="${barHeight + 4}" fill="${theme.frameOuter}" />`);
      bevelLines.push(`<rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" fill="${theme.frameInner}" />`);
    } else if (bPad === 2) {
      bevelLines.push(`<rect x="-2" y="-2" width="${segWidth + 4}" height="${barHeight + 4}" fill="#000000" />`);
      bevelLines.push(`<rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" fill="${theme.frameInner}" />`);
    } else {
      bevelLines.push(`<rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" fill="${theme.frameInner}" />`);
    }
    return `
      <g transform="translate(${segX}, 0)">
        <!-- Chunky Stepped Pixel Bevel -->
        ${bevelLines.join('\n        ')}
        <rect x="0" y="0" width="${segWidth}" height="${barHeight}" fill="#111111" />
        <!-- Animated Fill Bar -->
        <rect x="0" y="0" height="${barHeight}" fill="${theme.bar}" class="${pfx}bar-${b}-${i}" />
        <!-- High-Contrast 8-Bit Arcade Bevels -->
        <rect x="0" y="0" width="${segWidth}" height="2" fill="#ffffff" opacity="0.8" />
        <rect x="0" y="0" width="2" height="${barHeight}" fill="#ffffff" opacity="0.8" />
        <rect x="0" y="${barHeight-2}" width="${segWidth}" height="2" fill="#000000" opacity="0.9" />
        <rect x="${segWidth-2}" y="0" width="2" height="${barHeight}" fill="#000000" opacity="0.9" />
        <!-- Specular Pixel Highlight -->
        <rect x="2" y="2" width="2" height="2" fill="#ffffff" opacity="0.6" />
        ${particleMarkup}
      </g>
    `;
  }

  if (aesthetic.name === 'souls') {
    return `
      <g transform="translate(${segX}, 0)">
        <!-- Ornate Gothic Frame -->
        <rect x="-1.5" y="-1.5" width="${segWidth + 3}" height="${barHeight + 3}" stroke="${theme.frameInner}" stroke-width="1" fill="${theme.frameOuter}" />
        <rect x="0" y="0" width="${segWidth}" height="${barHeight}" fill="${theme.frameBg}" />
        <!-- Animated Fill Bar -->
        <rect x="0" y="0" height="${barHeight}" fill="${theme.bar}" class="${pfx}bar-${b}-${i}" />
        <!-- Gothic Top Highlight Sheen & Bottom Shadow -->
        <line x1="0" y1="1" x2="${segWidth}" y2="1" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
        <line x1="0" y1="${barHeight-1}" x2="${segWidth}" y2="${barHeight-1}" stroke="rgba(0,0,0,0.5)" stroke-width="1" />
        <!-- Ornate Filigree Diamond Pips -->
        <polygon points="${Math.round(segWidth/2)},0 ${Math.round(segWidth/2)+2},2.5 ${Math.round(segWidth/2)},5 ${Math.round(segWidth/2)-2},2.5" fill="#facc15" opacity="0.75" />
        <polygon points="${Math.round(segWidth/2)},${barHeight} ${Math.round(segWidth/2)+2},${barHeight-2.5} ${Math.round(segWidth/2)},${barHeight-5} ${Math.round(segWidth/2)-2},${barHeight-2.5}" fill="#facc15" opacity="0.75" />
        ${particleMarkup}
      </g>
    `;
  }

  if (aesthetic.name === 'bloodborne') {
    const cPad = Math.max(1, Math.min(2, Math.floor(gap / 2)));
    return `
      <g transform="translate(${segX}, 0)">
        <!-- Jagged Distressed Iron Frame -->
        <rect x="-${cPad}" y="-${cPad}" width="${segWidth + cPad * 2}" height="${barHeight + cPad * 2}" fill="#1c070c" stroke="${theme.frameOuter}" stroke-width="1" />
        <rect x="0" y="0" width="${segWidth}" height="${barHeight}" fill="#0a0204" />
        <!-- Animated Fill Bar -->
        <rect x="0" y="0" height="${barHeight}" fill="${theme.bar}" class="${pfx}bar-${b}-${i}" />
        <!-- Blood Vial Vein & Visceral Slash -->
        <line x1="0" y1="${barHeight-3}" x2="${segWidth}" y2="${barHeight-3}" stroke="#450a0a" stroke-width="1" opacity="0.8" />
        <line x1="1" y1="2" x2="3" y2="${barHeight-2}" stroke="rgba(239,68,68,0.35)" stroke-width="0.8" />
        <line x1="2" y1="${barHeight-1}" x2="${Math.min(segWidth-2, 10)}" y2="1" stroke="#ef4444" stroke-width="1.2" opacity="0.6" stroke-linecap="round" />
        <line x1="${Math.max(2, segWidth-8)}" y1="${barHeight-2}" x2="${segWidth-1}" y2="3" stroke="#991b1b" stroke-width="1" opacity="0.5" />
        ${particleMarkup}
      </g>
    `;
  }

  // Classic default
  const cPad = Math.max(1, Math.min(2, Math.floor(gap / 2)));
  return `
    <g transform="translate(${segX}, 0)">
      <!-- Frame Background -->
      ${cPad >= 2 ? `<rect x="-2" y="-2" width="${segWidth + 4}" height="${barHeight + 4}" fill="${theme.frameOuter}" />` : ''}
      <rect x="-1" y="-1" width="${segWidth + 2}" height="${barHeight + 2}" fill="${theme.frameInner}" />
      <rect x="0" y="0" width="${segWidth}" height="${barHeight}" fill="${theme.frameBg}" />
      <!-- Animated Fill Bar -->
      <rect x="0" y="0" height="${barHeight}" fill="${theme.bar}" class="${pfx}bar-${b}-${i}" />
      ${particleMarkup}
    </g>
  `;
}

function generateBossBarSVG(bossesConfig = [], options = {}) {
  const isGlobalAuto = options.auto === true || options.auto === 'true' || options.auto === '1';
  const rawId = options.id || options.prefix || '';
  const id = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '');
  const pfx = id ? `${id}-` : '';
  const kfPfx = id ? `${id}_` : '';

  const globalAesthetic = resolveAesthetic(options.style || options.aesthetic);
  const globalAnimation = options.animation || options.anim;

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

    const bossAesthetic = resolveAesthetic(boss.style || boss.aesthetic || globalAesthetic.name);

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
    } else if (!themeChoice && bossAesthetic.defaultTheme) {
      themeChoice = bossAesthetic.defaultTheme;
    }
    const theme = resolveTheme(themeChoice, bIndex);
    uniqueThemes.set(theme.name, theme);

    const hitFlash = String(boss.hitFlash || options.hitFlash || theme.flash).trim();
    const sparks = resolveSparks(boss.sparks ?? options.sparks);

    // Resolve Shake
    let defaultShake = bossAesthetic.defaultShake || 'medium';
    if (isBossAuto) {
      defaultShake = (isDefeated || damagePerHit >= 3) ? 'heavy' : (bossAesthetic.defaultShake || 'medium');
    }
    const shake = resolveShake(boss.shake ?? options.shake, defaultShake);

    // Defeated banner text & color
    const felledText = String(boss.felledText || options.felledText || bossAesthetic.defaultBanner).trim();
    const rawFelledColor = boss.felledColor || boss.bannerColor || options.felledColor || options.bannerColor;
    const felledColor = rawFelledColor ? (rawFelledColor.startsWith('#') ? rawFelledColor : '#' + rawFelledColor) : null;

    // Damage popup template & color
    const dmgPopOption = boss.dmgPop !== undefined ? boss.dmgPop : options.dmgPop;
    const showDmgPop = dmgPopOption !== false && dmgPopOption !== 'false' && dmgPopOption !== 'none';
    const rawDmgPopColor = boss.dmgPopColor || boss.popupColor || options.dmgPopColor || options.popupColor;
    const dmgPopColor = rawDmgPopColor ? (rawDmgPopColor.startsWith('#') ? rawDmgPopColor : '#' + rawDmgPopColor) : null;

    // Tags
    const tagLive = boss.tagLive || (isDefeated ? (bossAesthetic.tagLiveDefeated || '[BOSS]') : (bossAesthetic.tagLive || '[CURRENT FOE]'));
    const tagFelled = boss.tagFelled || bossAesthetic.tagFelled || '[FELLED]';

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
      felledColor,
      dmgPopOption,
      showDmgPop,
      dmgPopColor,
      aesthetic: bossAesthetic,
      tagLive,
      tagFelled
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
      .${pfx}pulse-${th.name} {
        animation: ${kfPfx}pulse_${th.name} 2s infinite alternate;
      }
      @keyframes ${kfPfx}pulse_${th.name} {
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
      .${pfx}boss-layer-${b} {
        opacity: 0;
        animation: ${kfPfx}bossLife${b} ${totalTime.toFixed(1)}s infinite;
      }
      @keyframes ${kfPfx}bossLife${b} {
        0%, ${startP} { opacity: 0; transform: translateY(3px); }
        ${inP}, ${outStartP} { opacity: 1; transform: translateY(0); }
        ${endP}, 100% { opacity: 0; transform: translateY(-3px); }
      }
      .${pfx}txt-${b} {
        font-family: ${tb.aesthetic.fontFamily};
        font-size: ${tb.aesthetic.fontSize};
        font-weight: ${tb.aesthetic.fontWeight};
        letter-spacing: ${tb.aesthetic.letterSpacing};
      }
    `);

    if (tb.aesthetic.name === 'pixel') {
      cssRules.push(`
        .${pfx}emblem-pixel-${b} {
          animation: ${kfPfx}arcadeBlink${b} 1.4s steps(1, end) infinite;
        }
        @keyframes ${kfPfx}arcadeBlink${b} {
          0%, 65% { opacity: 1; }
          66%, 82% { opacity: 0.25; }
          83%, 100% { opacity: 1; }
        }
      `);
    } else if (tb.aesthetic.name === 'minimal') {
      cssRules.push(`
        .${pfx}beacon-ping-${b} {
          animation: ${kfPfx}beaconPulse${b} 2.2s ease-out infinite;
        }
        @keyframes ${kfPfx}beaconPulse${b} {
          0% { transform: scale(0.85); opacity: 0.85; }
          50% { transform: scale(1.4); opacity: 0.15; }
          100% { transform: scale(0.85); opacity: 0.85; }
        }
        .${pfx}track-minimal-${b} {
          filter: drop-shadow(0 0 3px ${tb.theme.pulse});
        }
      `);
    }

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
      .${pfx}shake-${b} {
        animation: ${kfPfx}shakeAnim${b} ${totalTime.toFixed(1)}s infinite;
      }
      @keyframes ${kfPfx}shakeAnim${b} {
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
        const h = Math.floor(drainIndex / tb.damagePerHit);
        const hitT = tb.hitTimes[h];
        const fromDrain = h * tb.damagePerHit;
        const toDrain = Math.min(tb.totalDamage - 1, (h + 1) * tb.damagePerHit - 1);
        const K = toDrain - fromDrain + 1; // Number of bars drained in this strike
        const p = drainIndex - fromDrain;   // 0 = rightmost, K - 1 = leftmost

        // Scale total drain duration with K while keeping well within interval
        const maxDrain = Math.min(0.35, tb.hitInterval * 0.75);
        const drainDuration = Math.min(maxDrain, Math.max(0.16, 0.08 + K * 0.06));
        const dt = drainDuration / K;

        const tStart = hitT + p * dt;
        const tEnd = hitT + (p + 1) * dt;

        const hitP0 = pct(hitT - 0.04);
        const hitPFlash = pct(hitT);

        const drainKeyframes = (p === 0)
          ? `
            0%, ${startP} { width: 0px; fill: ${tb.theme.bar}; }
            ${pct(tb.startTime + 0.3)}, ${hitP0} { width: ${segWidth}px; fill: ${tb.theme.bar}; }
            ${hitPFlash} { width: ${segWidth}px; fill: ${tb.hitFlash}; }
            ${pct(tEnd)}, ${endP} { width: 0px; fill: ${tb.theme.bar}; }
            100% { width: 0px; }
          `
          : `
            0%, ${startP} { width: 0px; fill: ${tb.theme.bar}; }
            ${pct(tb.startTime + 0.3)}, ${hitP0} { width: ${segWidth}px; fill: ${tb.theme.bar}; }
            ${hitPFlash}, ${pct(tStart)} { width: ${segWidth}px; fill: ${tb.hitFlash}; }
            ${pct(tEnd)}, ${endP} { width: 0px; fill: ${tb.theme.bar}; }
            100% { width: 0px; }
          `;

        cssRules.push(`
          .${pfx}bar-${b}-${i} {
            animation: ${kfPfx}drain_${b}_${i} ${totalTime.toFixed(1)}s infinite;
          }
          @keyframes ${kfPfx}drain_${b}_${i} {
            ${drainKeyframes.trim()}
          }
        `);

        if (tb.sparks) {
          let sparkKeyframes = '';
          if (tb.aesthetic.name === 'souls') {
            // Golden embers drifting upward
            sparkKeyframes = `
              0%, ${hitP0} { opacity: 0; transform: translateY(0) scale(0.6); }
              ${hitPFlash} { opacity: 1; transform: translateY(-3px) scale(1.1); }
              ${pct(hitT + drainDuration * 0.9)} { opacity: 0; transform: translateY(-12px) scale(0.4); }
              100% { opacity: 0; }
            `;
          } else if (tb.aesthetic.name === 'cyberpunk') {
            // Digital cyber bits jittering horizontally
            sparkKeyframes = `
              0%, ${hitP0} { opacity: 0; transform: translateX(0); }
              ${hitPFlash} { opacity: 1; transform: translateX(-4px) scaleX(1.3); }
              ${pct(hitT + drainDuration * 0.5)} { opacity: 0.8; transform: translateX(4px) scaleX(0.8); }
              ${pct(hitT + drainDuration * 0.9)} { opacity: 0; transform: translateX(-2px); }
              100% { opacity: 0; }
            `;
          } else if (tb.aesthetic.name === 'pixel') {
            // Chunky pixel debris bursting outward
            sparkKeyframes = `
              0%, ${hitP0} { opacity: 0; transform: scale(0.5); }
              ${hitPFlash} { opacity: 1; transform: scale(1.2); }
              ${pct(hitT + drainDuration * 0.9)} { opacity: 0; transform: scale(1.8) rotate(45deg); }
              100% { opacity: 0; }
            `;
          } else if (tb.aesthetic.name === 'bloodborne') {
            // Visceral blood droplets dripping downward
            sparkKeyframes = `
              0%, ${hitP0} { opacity: 0; transform: translateY(0); }
              ${hitPFlash} { opacity: 1; transform: translateY(2px) scaleY(1.2); }
              ${pct(hitT + drainDuration * 0.9)} { opacity: 0; transform: translateY(14px) scaleY(1.5) scaleX(0.7); }
              100% { opacity: 0; }
            `;
          } else if (tb.aesthetic.name === 'minimal') {
            // Soft ambient ring ping expanding
            sparkKeyframes = `
              0%, ${hitP0} { opacity: 0; transform: scale(0.5); }
              ${hitPFlash} { opacity: 1; transform: scale(1); }
              ${pct(hitT + drainDuration * 0.9)} { opacity: 0; transform: scale(2.8); stroke-width: 0.5; }
              100% { opacity: 0; }
            `;
          } else {
            // Classic 4-corner sparks
            sparkKeyframes = `
              0%, ${hitP0} { opacity: 0; transform: scale(0.6); }
              ${hitPFlash} { opacity: 1; transform: scale(1.2); }
              ${pct(hitT + drainDuration * 0.9)} { opacity: 0; transform: scale(1.5); }
              100% { opacity: 0; }
            `;
          }

          cssRules.push(`
            .${pfx}sparks-${b}-${i} {
              opacity: 0;
              animation: ${kfPfx}sparkAnim_${b}_${i} ${totalTime.toFixed(1)}s infinite;
            }
            @keyframes ${kfPfx}sparkAnim_${b}_${i} {
              ${sparkKeyframes.trim()}
            }
          `);
        }
      } else {
        // Stays full / alive
        cssRules.push(`
          .${pfx}bar-${b}-${i} {
            animation: ${kfPfx}alive_${b}_${i} ${totalTime.toFixed(1)}s infinite, ${kfPfx}pulse_${tb.theme.name} 2s infinite alternate;
          }
          @keyframes ${kfPfx}alive_${b}_${i} {
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
          .${pfx}dmg-pop-${b}-${h} {
            opacity: 0;
            animation: ${kfPfx}dmgPopAnim_${b}_${h} ${totalTime.toFixed(1)}s infinite;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            font-weight: 900;
            fill: ${tb.dmgPopColor || '#facc15'};
          }
          @keyframes ${kfPfx}dmgPopAnim_${b}_${h} {
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

      let bannerKeyframes = '';
      if (tb.aesthetic.name === 'souls') {
        // Souls: Slow ethereal ascent and golden bloom
        bannerKeyframes = `
          0%, ${deathP} { opacity: 0; transform: translateY(4px) scale(0.96); }
          ${pct(finalHitT + 0.35)} { opacity: 0.85; transform: translateY(-1px) scale(1.02); }
          ${pct(finalHitT + 0.75)}, ${outStartP} { opacity: 1; transform: translateY(0) scale(1); }
          ${endP}, 100% { opacity: 0; transform: translateY(-4px); }
        `;
      } else if (tb.aesthetic.name === 'cyberpunk') {
        // Cyberpunk: Digital typewriter / glitch flicker decode
        bannerKeyframes = `
          0%, ${deathP} { opacity: 0; transform: translate(0, 0); }
          ${pct(finalHitT + 0.18)} { opacity: 1; transform: translate(-3px, 0); }
          ${pct(finalHitT + 0.22)} { opacity: 0.2; transform: translate(3px, 0); }
          ${pct(finalHitT + 0.26)} { opacity: 1; transform: translate(0, 0); }
          ${pct(finalHitT + 0.30)} { opacity: 0.6; transform: translate(-1px, 0); }
          ${pct(finalHitT + 0.35)}, ${outStartP} { opacity: 1; transform: translate(0, 0); }
          ${endP}, 100% { opacity: 0; }
        `;
      } else if (tb.aesthetic.name === 'pixel') {
        // Pixel: 8-bit arcade flashing blink
        bannerKeyframes = `
          0%, ${deathP} { opacity: 0; }
          ${pct(finalHitT + 0.18)} { opacity: 1; }
          ${pct(finalHitT + 0.28)} { opacity: 0; }
          ${pct(finalHitT + 0.38)} { opacity: 1; }
          ${pct(finalHitT + 0.48)} { opacity: 0; }
          ${pct(finalHitT + 0.58)}, ${outStartP} { opacity: 1; }
          ${endP}, 100% { opacity: 0; }
        `;
      } else if (tb.aesthetic.name === 'bloodborne') {
        // Bloodborne: Visceral heavy drop and blood surge
        bannerKeyframes = `
          0%, ${deathP} { opacity: 0; transform: scale(1.18); }
          ${pct(finalHitT + 0.2)} { opacity: 1; transform: scale(0.98); }
          ${pct(finalHitT + 0.35)}, ${outStartP} { opacity: 1; transform: scale(1); }
          ${endP}, 100% { opacity: 0; transform: translateY(4px); }
        `;
      } else if (tb.aesthetic.name === 'minimal') {
        // Minimal: Sleek smooth slide down
        bannerKeyframes = `
          0%, ${deathP} { opacity: 0; transform: translateY(-4px); }
          ${pct(finalHitT + 0.25)}, ${outStartP} { opacity: 1; transform: translateY(0); }
          ${endP}, 100% { opacity: 0; transform: translateY(3px); }
        `;
      } else {
        // Classic: Smooth fade
        bannerKeyframes = `
          0%, ${deathP} { opacity: 0; }
          ${pct(finalHitT + 0.25)}, ${outStartP} { opacity: 1; }
          ${endP}, 100% { opacity: 0; }
        `;
      }

      cssRules.push(`
        .${pfx}tag-live-${b} {
          animation: ${kfPfx}tagLiveAnim${b} ${totalTime.toFixed(1)}s infinite;
        }
        @keyframes ${kfPfx}tagLiveAnim${b} {
          0%, ${deathP} { opacity: 1; }
          ${pct(finalHitT + 0.2)}, 100% { opacity: 0; }
        }

        .${pfx}tag-felled-${b} {
          opacity: 0;
          animation: ${kfPfx}tagFelledAnim${b} ${totalTime.toFixed(1)}s infinite;
        }
        @keyframes ${kfPfx}tagFelledAnim${b} {
          0%, ${deathP} { opacity: 0; }
          ${pct(finalHitT + 0.25)}, ${outStartP} { opacity: 1; }
          ${endP}, 100% { opacity: 0; }
        }

        .${pfx}felled-text-${b} {
          opacity: 0;
          animation: ${kfPfx}felledBannerAnim${b} ${totalTime.toFixed(1)}s infinite;
          font-family: ${tb.aesthetic.bannerFontFamily};
          font-size: ${tb.aesthetic.bannerFontSize};
          font-weight: ${tb.aesthetic.bannerWeight};
          letter-spacing: ${tb.aesthetic.bannerLetterSpacing};
          fill: ${tb.felledColor || tb.aesthetic.bannerColor};
          filter: drop-shadow(0 0 6px ${tb.felledColor || tb.aesthetic.bannerGlow});
        }
        .${pfx}felled-banner-bg-${b} {
          opacity: 0;
          animation: ${kfPfx}felledBannerAnim${b} ${totalTime.toFixed(1)}s infinite;
        }
        @keyframes ${kfPfx}felledBannerAnim${b} {
          ${bannerKeyframes.trim()}
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

      segmentsMarkup.push(renderSegmentMarkup(tb, i, segX, segWidth, barHeight, getsHit, pfx, b));
    }

    // Top Header info
    const tagLiveColor = tb.isDefeated ? (tb.aesthetic.tagLiveDefeatedColor || '#ef4444') : (tb.aesthetic.tagLiveColor || '#38bdf8');

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
          <text x="${hitCenterX}" text-anchor="middle" y="30" class="${pfx}dmg-pop-${b}-${h}">${escapeXml(popText)}</text>
        `);
      }
    }

    const containerBrackets = renderContainerBrackets(tb.aesthetic, tb.theme, actualWidth, barHeight, pfx, b);
    const emblemMarkup = renderEmblemMarkup(tb.aesthetic, tb.theme.emblem, pfx, b);
    const shapeRenderingMode = (tb.aesthetic.name === 'pixel' || tb.aesthetic.name === 'classic') ? 'crispEdges' : 'geometricPrecision';

    svgBodies.push(`
      <g class="${pfx}boss-layer-${b}">
        <g class="${pfx}shake-${b}">
          <!-- Header (Name & Emblem) -->
          <g transform="translate(${containerX}, 22)">
            ${emblemMarkup}

            <!-- Boss Name -->
            <text x="22" y="11" fill="#f8fafc" class="pixel-txt ${pfx}txt-${b}">${escapeXml(tb.name)}</text>
            
            ${tb.isDefeated ? `
            <!-- Live & Felled Tags -->
            <text x="${actualWidth}" text-anchor="end" y="11" fill="${tagLiveColor}" class="pixel-txt ${pfx}txt-${b} ${pfx}tag-live-${b}">${escapeXml(tb.tagLive)}</text>
            <text x="${actualWidth}" text-anchor="end" y="11" fill="#f59e0b" class="pixel-txt ${pfx}txt-${b} ${pfx}tag-felled-${b}">${escapeXml(tb.tagFelled)}</text>
            ` : `
            <text x="${actualWidth}" text-anchor="end" y="11" fill="${tagLiveColor}" class="pixel-txt ${pfx}txt-${b}">${escapeXml(tb.tagLive)}</text>
            `}
          </g>

          <!-- Segments -->
          <g transform="translate(${containerX}, ${containerY})" shape-rendering="${shapeRenderingMode}">
            ${containerBrackets}
            ${segmentsMarkup.join('')}
          </g>

          ${tb.isDefeated ? `
          <!-- Felled Banner Overlay -->
          ${tb.aesthetic.name === 'souls' ? `
          <!-- Golden Flourish Separator Lines -->
          <path d="M ${Math.round(svgWidth/2)-110},33 L ${Math.round(svgWidth/2)-14},33 L ${Math.round(svgWidth/2)},31 L ${Math.round(svgWidth/2)+14},33 L ${Math.round(svgWidth/2)+110},33" stroke="${tb.aesthetic.bannerColor}" stroke-width="1.2" fill="none" class="${pfx}felled-banner-bg-${b}" />
          <polygon points="${Math.round(svgWidth/2)},29 ${Math.round(svgWidth/2)+4},33 ${Math.round(svgWidth/2)},37 ${Math.round(svgWidth/2)-4},33" fill="${tb.aesthetic.bannerColor}" class="${pfx}felled-banner-bg-${b}" />
          <path d="M ${Math.round(svgWidth/2)-110},57 L ${Math.round(svgWidth/2)-14},57 L ${Math.round(svgWidth/2)},59 L ${Math.round(svgWidth/2)+14},57 L ${Math.round(svgWidth/2)+110},57" stroke="${tb.aesthetic.bannerColor}" stroke-width="1.2" fill="none" class="${pfx}felled-banner-bg-${b}" />
          <polygon points="${Math.round(svgWidth/2)},53 ${Math.round(svgWidth/2)+4},57 ${Math.round(svgWidth/2)},61 ${Math.round(svgWidth/2)-4},57" fill="${tb.aesthetic.bannerColor}" class="${pfx}felled-banner-bg-${b}" />
          ` : ''}
          ${tb.aesthetic.name === 'pixel' ? `
          <!-- Chunky 8-Bit Arcade Box -->
          <rect x="${Math.round(svgWidth/2)-110}" y="31" width="220" height="26" fill="#000000" stroke="#facc15" stroke-width="2" class="${pfx}felled-banner-bg-${b}" />
          <rect x="${Math.round(svgWidth/2)-107}" y="34" width="214" height="20" fill="#111111" class="${pfx}felled-banner-bg-${b}" />
          <rect x="${Math.round(svgWidth/2)-105}" y="36" width="3" height="3" fill="#facc15" class="${pfx}felled-banner-bg-${b}" />
          <rect x="${Math.round(svgWidth/2)+102}" y="36" width="3" height="3" fill="#facc15" class="${pfx}felled-banner-bg-${b}" />
          <rect x="${Math.round(svgWidth/2)-105}" y="49" width="3" height="3" fill="#facc15" class="${pfx}felled-banner-bg-${b}" />
          <rect x="${Math.round(svgWidth/2)+102}" y="49" width="3" height="3" fill="#facc15" class="${pfx}felled-banner-bg-${b}" />
          ` : ''}
          ${tb.aesthetic.name === 'bloodborne' ? `
          <!-- Visceral Abyssal Splatter Backdrop -->
          <path d="M ${Math.round(svgWidth/2)-120},45 L ${Math.round(svgWidth/2)-40},33 L ${Math.round(svgWidth/2)+110},35 L ${Math.round(svgWidth/2)+130},45 L ${Math.round(svgWidth/2)+40},57 L ${Math.round(svgWidth/2)-100},55 Z" fill="rgba(153, 27, 27, 0.45)" class="${pfx}felled-banner-bg-${b}" />
          <line x1="${Math.round(svgWidth/2)-130}" y1="45" x2="${Math.round(svgWidth/2)+130}" y2="45" stroke="#ef4444" stroke-width="1.2" opacity="0.7" class="${pfx}felled-banner-bg-${b}" />
          ` : ''}
          ${tb.aesthetic.name === 'minimal' ? `
          <!-- Clean Floating Status Pill -->
          <rect x="${Math.round(svgWidth / 2) - 110}" y="33" width="220" height="22" rx="11" fill="rgba(11, 15, 25, 0.94)" stroke="rgba(255,255,255,0.18)" stroke-width="1" class="${pfx}felled-banner-bg-${b}" />
          ` : ''}
          ${tb.aesthetic.name === 'cyberpunk' ? `
          <!-- Cyber HUD Targeting Overlay -->
          <rect x="${Math.round(svgWidth/2)-120}" y="33" width="240" height="22" fill="rgba(4, 12, 20, 0.92)" stroke="#06b6d4" stroke-width="1" stroke-dasharray="6 3" class="${pfx}felled-banner-bg-${b}" />
          <polygon points="${Math.round(svgWidth/2)-120},33 ${Math.round(svgWidth/2)-114},33 ${Math.round(svgWidth/2)-120},39" fill="#06b6d4" class="${pfx}felled-banner-bg-${b}" />
          <polygon points="${Math.round(svgWidth/2)+120},55 ${Math.round(svgWidth/2)+114},55 ${Math.round(svgWidth/2)+120},49" fill="#06b6d4" class="${pfx}felled-banner-bg-${b}" />
          ` : ''}
          <text x="${Math.round(svgWidth / 2)}" text-anchor="middle" y="48" class="${pfx}felled-text-${b}">${escapeXml(tb.felledText)}</text>
          ` : ''}

          <!-- Hit Damage Pop-ups -->
          ${popupsMarkup.join('')}
        </g>
      </g>
    `);
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="${svgHeight}">
  <defs>
    <style><![CDATA[
      ${cssRules.join('\n')}
    ]]></style>
  </defs>
  ${svgBodies.join('\n')}
</svg>
`.trim();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateBossBarSVG,
    escapeXml,
    THEMES,
    AESTHETICS,
    resolveAesthetic,
    resolveTheme,
    resolveShake
  };
}
if (typeof window !== 'undefined') {
  window.generateBossBarSVG = generateBossBarSVG;
  window.THEMES = THEMES;
  window.AESTHETICS = AESTHETICS;
  window.resolveAesthetic = resolveAesthetic;
  window.resolveTheme = resolveTheme;
  window.resolveShake = resolveShake;
  window.escapeXml = escapeXml;
}
