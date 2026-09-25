# readme-boss-bar

> Dynamic Animated Souls & Retro Boss Health Bars for your GitHub Profile README.

A zero-dependency, Camo-safe SVG generator that brings authentic Souls-like, Cyberpunk, 8-Bit Arcade, Bloodborne, and Minimalist boss battles to your GitHub profile. Showcase your milestones, projects, or learning goals as epic boss health bars that take damage, shake violently, and dissolve into ash upon victory.

---

## Features

- **Six Distinct Visual Aesthetics**: Choose between `classic`, `souls`, `cyberpunk`, `pixel`, `bloodborne`, and `minimal`.
- **Four Impact Drain Animations**: Customize bar drainage with `sweep`, `pulse`, `burst`, or `glitch`.
- **Visceral Screen Shake**: Dynamic camera shake modes (`none`, `subtle`, `medium`, `heavy`, `glitch`).
- **Granular Multi-Bar Hits**: Customize how many bars drain on each hit (e.g. 3 bars every 0.5s).
- **Flexible Hit Intervals**: Set fast flurries (0.25s) or deliberate heavy impacts (0.8s).
- **Color Themes**: Six souls-themed presets (`crimson`, `purple`, `cyan`, `gold`, `green`, `orange`) or any custom `#hex` color.
- **Contextual Particles**: Golden embers, digital cyber bits, chunky block debris, visceral blood droplets, or soft ring pings.
- **Custom Defeat Banners**: Replace default banners with custom text like `DEMIGOD FELLED` or `MILESTONE ACHIEVED`.
- **Automatic Cinematic Mode**: Generate balanced, dramatic multi-stage encounters with zero manual configuration.
- **Multi-Boss Staging**: Chain multiple bosses sequentially (defeat one, summon the next).
- **Zero Dependencies**: Pure standard library Node.js generator.
- **Camo Sanitizer Safe**: Pure SVG with `0` `<foreignObject>` tags and strict XML escaping.

---

## Visual Aesthetics

The generator supports 6 distinct visual styles. Each style features customized bar geometry, typography, emblem icons, particles, and defeat banner animations.

| Aesthetic | Style Key | Visual Features | Default Victory Banner | Default Theme |
| :--- | :--- | :--- | :--- | :--- |
| **Classic Retro** | `classic` | 16-bit pixel frame, retro monospace typography, pixel skull crest, 4-corner sparks | `GREAT ENEMY FELLED` | `crimson` |
| **Souls Gothic** | `souls` (or `gothic`) | Ornate gothic filigree brackets, Cinzel serif typography, Elden golden cross, floating golden embers | `GREAT ENEMY FELLED` | `gold` |
| **Cyberpunk HUD** | `cyberpunk` (or `scifi`) | 45° chamfered angled bar polygons, tech monospace typography, tactical crosshair reticle, cyber bit slices | `// TARGET DESTROYED //` | `cyan` |
| **8-Bit Arcade** | `pixel` (or `retro`) | Chunky stepped pixel bevel borders, Press Start 2P arcade typography, 8-bit blinking skull, square debris | `STAGE CLEAR` | `crimson` |
| **Bloodborne Horror** | `bloodborne` (or `eldritch`) | Jagged distressed iron borders, sharp gothic typography, Hunter's Mark rune, visceral dripping blood droplets | `PREY SLAUGHTERED` | `crimson` |
| **Modern Minimal** | `minimal` (or `clean`) | Sleek rounded pill bars (`rx="4"`), clean sans-serif typography, pulsing beacon dot, soft ambient ping ring | `STATUS: DEFEATED` | `green` |

---

## Animation Styles

Choose how the health bar drains upon taking impact:

| Animation | Key | Description |
| :--- | :--- | :--- |
| **Sequential Sweep** | `sweep` | (Default) Smooth continuous drainage flowing sequentially from right to left across bars. |
| **Rhythmic Pulse** | `pulse` | Flash highlight followed by a rhythmic pulse wave that contracts before draining. |
| **Visceral Burst** | `burst` | Violent hit flash holding full width, followed by an instantaneous explosive drop like shattering glass. |
| **Digital Glitch** | `glitch` | Discrete staircase drainage with horizontal jitter and opacity flickers. |

---

## Quick Start

### 1. Visual Web Studio (Easiest - 1 Click)

Design your boss bar visually in your browser with real-time preview:  
Open `index.html` or `preview.html` locally in any browser, or visit your deployed URL on Vercel:
- **[https://readme-boss-barr.vercel.app](https://readme-boss-barr.vercel.app)**  
Pick an aesthetic, adjust sliders, and click **"Copy Markdown for README"** or **"Download SVG"**!

---

### 2. Deploy with Vercel (1-Click Free Hosting)

Deploy your own live serverless endpoint to get real-time dynamic SVG URLs for your GitHub README:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSS2Genji%2Freadme-boss-bar)

> **No Vercel Account? Zero-Server Option:**  
> You can also download the SVG directly from the Web Studio (or run `npx readme-boss-bar -o assets/boss_bar.svg`), commit it to your repository, and embed it locally:
> ```markdown
> ![Boss Bar](./assets/boss_bar.svg)
> ```

---

### 3. Copy & Paste into your GitHub README

Once deployed to Vercel (or using the local asset), copy any line below and replace `YOUR+NAME` with your project, milestone, or boss name:

#### Souls Gothic (Elden Ring Style)
```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=STARCOURGE+RADAHN&bars=10&dmg=3&style=souls&theme=purple&shake=heavy&felled=DEMIGOD+FELLED)
```

#### Cyberpunk Sci-Fi HUD
```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=TITAN+MECH&bars=8&dmg=2&style=cyberpunk&theme=cyan&shake=glitch&anim=glitch)
```

#### Bloodborne Eldritch Horror
```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=CLERIC+BEAST&bars=8&dmg=2&style=bloodborne&theme=crimson&shake=heavy&anim=burst)
```

#### 8-Bit NES Arcade
```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=CASTLE+OVERLORD&bars=8&dmg=2&style=pixel&theme=gold&anim=burst)
```

#### Modern Sleek Dashboard (Minimal)
```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=SYSTEM+INTEGRITY&bars=6&dmg=2&style=minimal&theme=green&shake=subtle)
```

#### Classic 16-Bit Retro
```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=MILESTONE+1&bars=6&dmg=2&style=classic&theme=crimson)
```

#### Zero-Config Cinematic Auto Mode
```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?auto=true)
```

---

### 4. Interactive CLI Wizard

Prefer the command line? Run the step-by-step interactive wizard:

```bash
npx readme-boss-bar wizard
```

It walks you through aesthetic styles, boss names, health bars, speed, themes, and automatically exports your SVG and Markdown embed code!

---

### 5. Multi-Boss Milestone Chains

Defeat Phase 1, then summon Phase 2:

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?boss=CIRCLE+01:4:4:0.4:1:crimson:medium:PHASE+1+CLEAR:souls:sweep&boss=CIRCLE+02:6:3:0.5:2:gold:heavy:PUSH_SWAP+FELLED:souls:pulse)
```

---

## URL Parameters

### Boss Specification Syntax

You can pass bosses using the extended 10-part shorthand format:

```text
NAME:TOTAL_BARS:HITS:INTERVAL:DMG_PER_HIT:THEME:SHAKE:FELLED_TEXT:STYLE:ANIMATION
```

| Component | Type | Description | Default | Example |
| :--- | :--- | :--- | :--- | :--- |
| `NAME` | String | Boss title / milestone name | `BOSS` | `RADAHN` |
| `TOTAL_BARS` | Integer | Total number of health segments | `5` | `10` |
| `HITS` | Integer | Total hits to execute (if omitted, drains until defeated) | `All bars` | `2` |
| `INTERVAL` | Float | Seconds between hits | `0.5s` | `0.5` |
| `DMG_PER_HIT` | Integer | Number of bars drained per hit | `1` | `3` |
| `THEME` | String | Color theme preset or `#hex` | `crimson` | `purple` |
| `SHAKE` | String | Screen shake intensity (`none`, `subtle`, `medium`, `heavy`, `glitch`) | `medium` | `heavy` |
| `FELLED_TEXT` | String | Defeat victory text overlay | Aesthetic default | `DEMIGOD FELLED` |
| `STYLE` | String | Aesthetic style (`classic`, `souls`, `cyberpunk`, `pixel`, `bloodborne`, `minimal`) | `classic` | `souls` |
| `ANIMATION` | String | Drain animation (`sweep`, `pulse`, `burst`, `glitch`) | Aesthetic default | `pulse` |

*Note: Trailing components can be omitted (e.g. `?boss=RADAHN:10:::3::::souls` drains 3 bars every 0.5s with the Souls aesthetic until 10 bars are depleted).*

### Query Parameters

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `style`, `aesthetic` | String | Aesthetic style (`classic`, `souls`, `cyberpunk`, `pixel`, `bloodborne`, `minimal`) | `?style=cyberpunk` |
| `anim`, `animation` | String | Drain animation (`sweep`, `pulse`, `burst`, `glitch`) | `?anim=glitch` |
| `shake` | String | Screen shake intensity (`none`, `subtle`, `medium`, `heavy`, `glitch`) | `?shake=glitch` |
| `boss` | String | Repeatable boss specification shorthand | `?boss=RADAHN:10:2:0.5:3:purple:heavy` |
| `bosses` | String | Comma-separated boss specifications | `?bosses=M1:3:3,M2:5:1` |
| `b1`, `b2` | String | Numbered boss stages (sorted naturally) | `?b1=STAGE+1:4:4&b2=STAGE+2:6:2` |
| `name`, `bars` | String / Int | Single boss definition | `?name=RADAHN&bars=10&dmg=3&interval=0.5` |
| `auto` | Boolean | Enable automatic cinematic mode | `?auto=true` |
| `theme` | String | Color theme (`crimson`, `purple`, `cyan`, `gold`, `green`, `orange`, `#hex`) | `?theme=purple` |
| `interval`, `speed` | Float | Global default hit interval in seconds | `?interval=0.5` |
| `dmg`, `damage` | Integer | Global default damage per hit in bars | `?dmg=3` |
| `sparks` | Boolean | Toggle contextual particles & sparks (`true`, `false`) | `?sparks=false` |
| `flash` | String | Hit flash color | `?flash=%23ffffff` |
| `felled` | String | Custom defeat banner text | `?felled=DEMIGOD+FELLED` |
| `dmgPop` | String | Damage popup template (`-{N} BARS`, `-{N} HP`, or `false`) | `?dmgPop=-{N}+HP` |
| `width` | Integer | Total SVG width in pixels | `?width=700` |
| `height` | Integer | Total SVG height in pixels | `?height=95` |
| `id`, `prefix` | String | Scoped CSS class and keyframes namespace prefix | `?id=hero_boss` |

#### Aesthetic Aliases
For developer convenience, common aliases are automatically resolved:
- `gothic`, `elden`, `eldenring`, `dark_souls` &rarr; `souls`
- `scifi`, `sci-fi`, `cyber`, `mech`, `hud` &rarr; `cyberpunk`
- `retro`, `arcade`, `8bit`, `nes` &rarr; `pixel`
- `clean`, `modern`, `sleek`, `flat` &rarr; `minimal`
- `eldritch`, `horror`, `gothic_horror` &rarr; `bloodborne`

---

## Themes

| Theme | Inspiration | Bar Color | Pulse Highlight |
| :--- | :--- | :--- | :--- |
| `crimson` | Souls Fire & Blood | `#dc2626` | `#ef4444` |
| `purple` | St. Trina / Gravitational Void | `#9333ea` | `#a855f7` |
| `cyan` | Glintstone Sorcery / Neon Mech | `#0891b2` | `#06b6d4` |
| `gold` | Erdtree / Golden Order | `#d97706` | `#f59e0b` |
| `green` | System Green / Poison Miasma | `#16a34a` | `#22c55e` |
| `orange` | Flame of Frenzy / Giant Flame | `#ea580c` | `#f97316` |
| Custom `#hex` | Any 3- or 6-digit hex (with or without `#`) | `user-defined` | `user-defined` |

---

## CLI Usage

Generate SVGs locally or directly in CI pipelines:

```bash
# 0. Interactive step-by-step wizard
npx readme-boss-bar wizard

# 1. Generate Cyberpunk Mech HUD
npx readme-boss-bar --style cyberpunk --anim glitch --shake glitch -b "CYBER MECH:10:3:0.4:3" -o assets/mech.svg

# 2. Generate Souls Gothic Radahn
npx readme-boss-bar --style souls -b "RADAHN:10" --dmg 3 --interval 0.5 --theme purple --shake heavy -o assets/radahn.svg

# 3. Generate Bloodborne Beast with visceral burst
npx readme-boss-bar --style bloodborne --anim burst -b "CLERIC BEAST:8:4:0.35:2" -o assets/bloodborne.svg

# 4. Generate 8-Bit Arcade Boss
npx readme-boss-bar --style pixel --anim burst -b "CASTLE OVERLORD:8:4:0.4:2" -o assets/pixel.svg

# 5. Generate Modern Minimal Dashboard
npx readme-boss-bar --style minimal -b "SYSTEM INTEGRITY:6:3:0.5:2" -o assets/minimal.svg

# 6. Automatic cinematic mode
npx readme-boss-bar --auto -o assets/boss_bar.svg

# 7. Using JSON configuration file
npx readme-boss-bar --config config.example.json -o assets/boss_bar.svg
```

### JSON Configuration Format

```json
[
  {
    "name": "STARCOURGE RADAHN",
    "totalBars": 10,
    "hits": 2,
    "damagePerHit": 3,
    "hitInterval": 0.5,
    "barColor": "purple",
    "shake": "heavy",
    "style": "souls",
    "animation": "pulse",
    "dmgPop": "-{N} BARS"
  },
  {
    "name": "MALENIA, BLADE OF MIQUELLA",
    "totalBars": 8,
    "hits": 4,
    "damagePerHit": 2,
    "hitInterval": 0.35,
    "barColor": "gold",
    "shake": "heavy",
    "style": "souls",
    "animation": "sweep",
    "felledText": "DEMIGOD FELLED"
  }
]
```

---

## Interactive Studio (Web App)

Visit **[readme-boss-barr.vercel.app](https://readme-boss-barr.vercel.app)** or open `index.html` / `preview.html` locally in any web browser to access the **Interactive Boss Bar Studio**:
- **Aesthetic Selector**: Switch seamlessly between Classic, Souls, Cyberpunk, Pixel, Bloodborne, and Minimal styles.
- **1-Click Presets**: Dedicated presets for every aesthetic style plus 42 School and Elden Ring runs.
- **Interactive Stage Manager**: Add and remove multiple encounter phases on the fly.
- **Real-Time Live Preview**: Instant rendering with live damage animations and screen shakes as you type or adjust sliders.
- **1-Click Export Bar**: Copy GitHub README Markdown embeds, download SVG files, or copy CLI commands.

---

## GitHub Actions Automation

Automatically regenerate your profile health bar on every push or milestone:

```yaml
name: Update Boss Health Bar
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx readme-boss-bar -b "RADAHN:10:2:0.5:3" --style souls --theme purple --shake heavy -o assets/boss_bar.svg
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update profile boss health bar"
```

---

## License

MIT License (c) 2026 [Ahmet Emir Şimşek](https://github.com/SS2Genji)
