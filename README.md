# readme-boss-bar

Animated boss health bars for your GitHub Profile README.

Pure SVG vector graphics that run on GitHub's Camo image proxy without `<foreignObject>` or client-side JavaScript. Boss bars take damage, shake, drop status particles, and dissolve into defeat banners when depleted.

**Interactive Web Studio:** [https://readme-boss-barr.vercel.app](https://readme-boss-barr.vercel.app)

---

## Live Showcase

Below are live SVGs rendered directly through the public API. Copy the markdown snippets below any example to use them in your own profile.

### Souls Gothic

![Souls Boss Bar](https://readme-boss-barr.vercel.app/api?name=STARCOURGE+RADAHN&bars=10&dmg=3&style=souls&theme=purple&shake=heavy&felled=DEMIGOD+FELLED)

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=STARCOURGE+RADAHN&bars=10&dmg=3&style=souls&theme=purple&shake=heavy&felled=DEMIGOD+FELLED)
```

### Cyberpunk HUD

![Cyberpunk Boss Bar](https://readme-boss-barr.vercel.app/api?name=TITAN+MECH&bars=8&dmg=2&style=cyberpunk&theme=cyan&shake=heavy&felledColor=06b6d4)

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=TITAN+MECH&bars=8&dmg=2&style=cyberpunk&theme=cyan&shake=heavy&felledColor=06b6d4)
```

### Bloodborne Horror

![Bloodborne Boss Bar](https://readme-boss-barr.vercel.app/api?name=CLERIC+BEAST&bars=8&dmg=2&style=bloodborne&theme=crimson&shake=heavy&felledColor=dc2626)

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=CLERIC+BEAST&bars=8&dmg=2&style=bloodborne&theme=crimson&shake=heavy&felledColor=dc2626)
```

### 8-Bit Arcade

![Pixel Boss Bar](https://readme-boss-barr.vercel.app/api?name=CASTLE+OVERLORD&bars=8&dmg=2&style=pixel&theme=gold&felledColor=facc15)

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=CASTLE+OVERLORD&bars=8&dmg=2&style=pixel&theme=gold&felledColor=facc15)
```

### Modern Minimal

![Minimal Boss Bar](https://readme-boss-barr.vercel.app/api?name=SYSTEM+INTEGRITY&bars=6&dmg=2&style=minimal&theme=green&shake=subtle)

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=SYSTEM+INTEGRITY&bars=6&dmg=2&style=minimal&theme=green&shake=subtle)
```

### Multi-Phase Encounter Chain

Chain multiple phases sequentially. Phase 2 begins only after Phase 1 is defeated:

![Multi-Phase Boss Bar](https://readme-boss-barr.vercel.app/api?boss=PHASE+1:4:4:0.4:1:crimson:medium:PHASE+1+CLEAR:souls&boss=PHASE+2:6:3:0.5:2:gold:heavy:PUSH_SWAP+FELLED:souls)

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?boss=PHASE+1:4:4:0.4:1:crimson:medium:PHASE+1+CLEAR:souls&boss=PHASE+2:6:3:0.5:2:gold:heavy:PUSH_SWAP+FELLED:souls)
```

---

## Quick Start

### Option 1: Web Studio (Fastest)

1. Open the [Web Studio](https://readme-boss-barr.vercel.app).
2. Click **[EXECUTE SYSTEM]** or press Space/Enter.
3. Select your aesthetic, pick a preset, and customize bars, damage, or colors.
4. Click **Copy Markdown for README** and paste it into your `README.md`.

### Option 2: Direct API URL

Add an image link to your markdown using the public API:

```markdown
![Boss Bar](https://readme-boss-barr.vercel.app/api?name=YOUR_PROJECT&bars=10&dmg=2&style=souls)
```

### Option 3: Local SVG Generation (Zero External Requests)

If you prefer committing static files to your repository without third-party requests:

```bash
npx readme-boss-bar -b "MY PROJECT:10:3:0.5:3" --style souls -o assets/boss_bar.svg
```

Then reference the file in your README:

```markdown
![Boss Bar](./assets/boss_bar.svg)
```

---

## Aesthetics

| Style Key | Description | Emblems & Particles | Default Banner | Default Color |
| :--- | :--- | :--- | :--- | :--- |
| `souls` | Ornate gothic filigree brackets and Cinzel serif font | Golden cross & floating embers | `GREAT ENEMY FELLED` | `#d97706` (gold) |
| `cyberpunk` | Chamfered polygon bars with monospace typography | Tactical reticle & digital bits | `// TARGET DESTROYED //` | `#0891b2` (cyan) |
| `bloodborne` | Distressed gothic iron with sharp distressed lettering | Hunter rune & dripping blood | `PREY SLAUGHTERED` | `#dc2626` (crimson) |
| `pixel` | Stepped pixel borders and arcade typography | Blinking skull & square debris | `STAGE CLEAR` | `#dc2626` (crimson) |
| `minimal` | Rounded pill bars with clean sans-serif type | Beacon dot & ping rings | `STATUS: DEFEATED` | `#16a34a` (green) |
| `classic` | 16-bit retro frame with corner accents | Corner sparks & pixel skull | `GREAT ENEMY FELLED` | `#dc2626` (crimson) |

Aliases are supported:
- `gothic`, `elden`, `eldenring` &rarr; `souls`
- `scifi`, `mech`, `hud` &rarr; `cyberpunk`
- `retro`, `arcade`, `8bit` &rarr; `pixel`
- `clean`, `flat` &rarr; `minimal`
- `eldritch`, `horror` &rarr; `bloodborne`

---

## URL Parameters

### Shorthand Format

Define a boss encounter in a single parameter:

```text
?boss=NAME:TOTAL_BARS:HITS:INTERVAL:DMG_PER_HIT:THEME:SHAKE:FELLED_TEXT:STYLE
```

Trailing values can be omitted. Example:
- `?boss=RADAHN:10` &rarr; 10 bars, drains to defeat automatically.
- `?boss=RADAHN:10:2:0.5:3` &rarr; 10 bars, takes 2 hits of 3 bars every 0.5s.

### Granular Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | `BOSS` | Boss name displayed above health bars |
| `bars` | integer | `5` | Total number of health segments |
| `dmg` | integer | `1` | Health segments lost per hit |
| `hits` | integer | Auto | Number of attacks before stopping (omitted = until defeated) |
| `interval` | float | `0.5` | Attack interval in seconds |
| `style` | string | `classic` | Visual aesthetic (`souls`, `cyberpunk`, `bloodborne`, `pixel`, `minimal`, `classic`) |
| `theme` | string | `crimson` | Color preset (`crimson`, `purple`, `cyan`, `gold`, `green`, `orange`) or `#hex` |
| `shake` | string | `medium` | Screen shake level (`none`, `subtle`, `medium`, `heavy`) |
| `felled` | string | Auto | Custom defeat banner text |
| `felledColor` | string | Theme | Custom hex color for defeat banner and glow |
| `dmgPopColor` | string | `#facc15` | Color for floating damage popup text |
| `tag` | string | Auto | Custom status tag (e.g. `[CURRENT FOE]`) |
| `tagColor` | string | Auto | Color for active status tag |
| `tagFelled` | string | Auto | Custom status tag when defeated |
| `tagFelledColor` | string | Auto | Color for defeated status tag |
| `auto` | boolean | `false` | When `true`, automatically derives balanced cinematic defaults |

---

## CLI Usage

Run directly with `npx`:

```bash
# Step-by-step interactive CLI wizard
npx readme-boss-bar wizard

# Generate a Cyberpunk Mech bar
npx readme-boss-bar --style cyberpunk -b "CYBER MECH:10:3:0.4:3" -o assets/mech.svg

# Generate a Souls Radahn encounter
npx readme-boss-bar --style souls -b "RADAHN:10" --dmg 3 --interval 0.5 --theme purple --shake heavy -o assets/radahn.svg

# Automatic cinematic encounter
npx readme-boss-bar --auto -o assets/boss_bar.svg

# From a configuration file
npx readme-boss-bar --config config.example.json -o assets/boss_bar.svg
```

### Configuration File (`bosses.json`)

```json
[
  {
    "name": "STARCOURGE RADAHN",
    "totalBars": 10,
    "damagePerHit": 3,
    "hitInterval": 0.5,
    "hits": 4,
    "barColor": "purple",
    "shake": "heavy",
    "style": "souls",
    "felledText": "DEMIGOD FELLED"
  }
]
```

---

## GitHub Actions Automation

Regenerate your boss bar automatically on each commit or milestone:

```yaml
name: Update Boss Health Bar

on:
  push:
    branches: [ main ]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx readme-boss-bar -b "RADAHN:10:4:0.5:3" --style souls --theme purple -o assets/boss_bar.svg
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update profile boss health bar"
```

---

## Self-Hosting

Deploy your own private instance to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSS2Genji%2Freadme-boss-bar)

---

## License

MIT License (c) 2026 [Ahmet Emir Şimşek](https://github.com/SS2Genji)
