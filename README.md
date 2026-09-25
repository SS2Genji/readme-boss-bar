# readme-boss-bar

> Retro Pixel Art Animated Souls Boss Health Bar for your GitHub Profile README.

A dynamic, zero-dependency SVG generator that brings authentic 16-bit retro RPG and Souls-like boss battles to your GitHub profile. Showcase your milestones, projects, or learning goals as epic boss health bars that take damage, shake violently, and dissolve into ash upon victory.

---

## Features

- **Retro 16-bit Pixel Aesthetics**: Crisp vector pixels rendered with `shape-rendering="crispEdges"`.
- **Granular Multi-Bar Hits**: Customize how many bars drain on each hit (e.g. 3 bars every 0.5s).
- **Flexible Hit Intervals**: Set fast flurries (0.25s) or deliberate heavy impacts (0.8s).
- **Screen Shake Presets**: Visceral screen shake effects (`none`, `subtle`, `medium`, `heavy`).
- **Color Themes**: Six souls-themed presets (`crimson`, `purple`, `cyan`, `gold`, `green`, `orange`) or any custom `#hex` color.
- **Visual Effects**: Pixel sparks, hit flashes, and floating damage popups (`-{N} BARS`, `-{N} HP`).
- **Custom Victory Banners**: Replace `GREAT ENEMY FELLED` with custom text like `DEMIGOD FELLED` or `MILESTONE ACHIEVED`.
- **Automatic Cinematic Mode**: Generate balanced, dramatic multi-stage encounters with zero manual configuration.
- **Zero Dependencies**: Pure standard library Node.js generator.
- **Multi-Boss Staging**: Chain multiple bosses sequentially (defeat one, summon the next).
- **Camo Sanitizer Safe**: Pure SVG with `0` `<foreignObject>` tags and strict XML escaping.

---

## Quick Start

### Automatic Mode (Zero Config)

Add the following to your GitHub Profile `README.md`:

```markdown
![Boss Bar](https://readme-boss-bar.vercel.app/api?auto=true)
```

### Manual Customization (Multi-Bar Hits)

A 10-bar health bar taking 3 bars per hit every 0.5 seconds with purple void styling and heavy screen shake:

```markdown
![Boss Bar](https://readme-boss-bar.vercel.app/api?boss=STARCOURGE+RADAHN:10:2:0.5:3&theme=purple&shake=heavy)
```

### Multi-Boss Sequential Chain

Defeat Milestone 1, then battle Milestone 2:

```markdown
![Boss Bar](https://readme-boss-bar.vercel.app/api?boss=MILESTONE+1:3:3:0.5:1&boss=MILESTONE+2:5:1:0.6:1)
```

---

## URL Parameters

### Boss Specification Syntax

You can pass bosses using the shorthand format:

```text
NAME:TOTAL_BARS:HITS:INTERVAL:DMG_PER_HIT:THEME:SHAKE:FELLED_TEXT
```

| Component | Type | Description | Default | Example |
| :--- | :--- | :--- | :--- | :--- |
| `NAME` | String | Boss title / milestone name | `BOSS` | `RADAHN` |
| `TOTAL_BARS` | Integer | Total number of health segments | `5` | `10` |
| `HITS` | Integer | Total hits to execute (if omitted, drains until defeated) | `All bars` | `2` |
| `INTERVAL` | Float | Seconds between hits | `0.5s` | `0.5` |
| `DMG_PER_HIT` | Integer | Number of bars drained per hit | `1` | `3` |
| `THEME` | String | Color theme preset or `#hex` | `crimson` | `purple` |
| `SHAKE` | String | Screen shake intensity (`none`, `subtle`, `medium`, `heavy`) | `medium` | `heavy` |
| `FELLED_TEXT` | String | Defeat victory text overlay | `GREAT ENEMY FELLED` | `DEMIGOD FELLED` |

*Note: Trailing components can be omitted (e.g. `?boss=RADAHN:10:::3` drains 3 bars every 0.5s until 10 bars are depleted).*

### Query Parameters

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `boss` | String | Repeatable boss specification shorthand | `?boss=RADAHN:10:2:0.5:3:purple:heavy` |
| `bosses` | String | Comma-separated boss specifications | `?bosses=M1:3:3,M2:5:1` |
| `b1`, `b2` | String | Numbered boss stages (sorted naturally) | `?b1=STAGE+1:4:4&b2=STAGE+2:6:2` |
| `name`, `bars` | String / Int | Single boss definition | `?name=RADAHN&bars=10&dmg=3&interval=0.5` |
| `auto` | Boolean | Enable automatic cinematic mode | `?auto=true` |
| `theme` | String | Color theme (`crimson`, `purple`, `cyan`, `gold`, `green`, `orange`, `#hex`) | `?theme=purple` |
| `shake` | String | Screen shake intensity (`none`, `subtle`, `medium`, `heavy`) | `?shake=heavy` |
| `interval`, `speed` | Float | Global default hit interval in seconds | `?interval=0.5` |
| `dmg`, `damage` | Integer | Global default damage per hit in bars | `?dmg=3` |
| `sparks` | Boolean | Toggle golden/themed pixel sparks (`true`, `false`) | `?sparks=false` |
| `flash` | String | Hit flash color | `?flash=%23ffffff` |
| `felled` | String | Custom defeat banner text | `?felled=DEMIGOD+FELLED` |
| `dmgPop` | String | Damage popup template (`-{N} BARS`, `-{N} HP`, or `false`) | `?dmgPop=-{N}+HP` |
| `width` | Integer | Total SVG width in pixels | `?width=700` |
| `height` | Integer | Total SVG height in pixels | `?height=95` |
| `id`, `prefix` | String | Scoped CSS class and keyframes namespace prefix | `?id=hero_boss` |

---

## Themes

| Theme | Inspiration | Bar Color | Pulse Highlight |
| :--- | :--- | :--- | :--- |
| `crimson` | Souls Fire & Blood (Default) | `#dc2626` | `#ef4444` |
| `purple` | St. Trina / Gravitational Void | `#9333ea` | `#a855f7` |
| `cyan` | Glintstone Sorcery / Ranni | `#0891b2` | `#06b6d4` |
| `gold` | Erdtree / Golden Order | `#d97706` | `#f59e0b` |
| `green` | Scarlet Rot / Poison Miasma | `#16a34a` | `#22c55e` |
| `orange` | Flame of Frenzy / Giant Flame | `#ea580c` | `#f97316` |
| Custom `#hex` | Any 3- or 6-digit hex (with or without `#`) | `user-defined` | `user-defined` |

---

## CLI Usage

Generate SVGs locally or directly in CI pipelines:

```bash
# 1. Automatic cinematic mode
npx readme-boss-bar --auto -o assets/boss_bar.svg

# 2. Granular multi-bar combat (10 bars, 3 bars per hit every 0.5s)
npx readme-boss-bar -b "RADAHN:10" --dmg 3 --interval 0.5 --theme purple --shake heavy -o assets/radahn.svg

# 3. Defeated boss with custom defeat banner via extended shorthand
npx readme-boss-bar -b "MALENIA:8:4:0.35:2:gold:heavy:DEMIGOD FELLED" -o assets/malenia.svg

# 4. Multi-boss sequential milestones
npx readme-boss-bar -b "MILESTONE 1:3:3" -b "MILESTONE 2:5:1" -o assets/boss_bar.svg

# 5. Using JSON configuration file
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
    "felledText": "DEMIGOD FELLED"
  }
]
```

---

## Interactive Studio

Open `preview.html` in any web browser to access the **Interactive Boss Bar Studio**:
- Live sliders for health bars, damage per hit, hit counts, and interval speed.
- Real-time previews of screen shake, color themes, and sparks.
- Instant export of Markdown image embed codes and CLI commands.

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
      - run: npx readme-boss-bar -b "RADAHN:10:2:0.5:3" --theme purple --shake heavy -o assets/boss_bar.svg
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update profile boss health bar"
```

---

## License

MIT License (c) 2026 [Ahmet Emir Şimşek](https://github.com/SS2Genji)

