# ⚔️ readme-boss-bar

> Retro Pixel Art Animated Souls Boss Health Bar for your GitHub Profile README.

A dynamic, zero-dependency SVG generator that brings authentic 16-bit retro RPG / Souls-like boss battles to your GitHub profile. Showcase your milestones, projects, or learning goals as epic boss health bars that take damage, shake, and dissolve into ash upon victory!

---

## ✨ Features

- **Retro 16-bit Pixel Aesthetics**: Sharp vector pixels rendered with `shape-rendering="crispEdges"`.
- **Right-to-Left Damage**: Bars deplete sequentially from right to left, accompanied by golden pixel sparks and screen shake.
- **Multi-Boss Staging**: Defeat one boss (e.g. `MILESTONE 1`) with `GREAT ENEMY FELLED` text, then seamlessly summon the next active foe (`MILESTONE 2`).
- **Zero Dependencies**: Pure standard library Node.js generator.
- **Versatile Usage**: Use directly via serverless URL in Markdown or generate locally via CLI.

---

## 🚀 Quick Start (Markdown URL)

Add the following to your GitHub Profile `README.md`:

```markdown
<div align="center">
  <img src="https://readme-boss-bar.vercel.app/api?boss=MILESTONE+1:3:3&boss=MILESTONE+2:5:1" alt="Boss Bar" />
</div>
```

---

## 🛠️ URL Parameters

| Parameter | Format | Description | Example |
| :--- | :--- | :--- | :--- |
| `boss` | `NAME:TOTAL_BARS:HITS` | Defines a boss stage (repeatable). | `boss=MILESTONE+1:3:3` |
| `bosses` | Comma-separated | Alternate multi-boss syntax. | `bosses=M1:3:3,M2:5:1` |
| `width` | Integer (pixels) | Total SVG width (default: 700). | `width=650` |

### Parameter Breakdown: `NAME:TOTAL_BARS:HITS`
- `NAME`: Title of the boss (e.g. `COMMON CORE`, `CIRCLE 01`, `BACKEND DEPLOY`).
- `TOTAL_BARS`: Total number of health segments/bars (e.g. `3` for 3 projects).
- `HITS`: Number of bars depleted (e.g. if `HITS == TOTAL_BARS`, the boss is defeated and dies!).

---

## 💻 CLI Usage

You can also run the generator locally or in a CI workflow:

```bash
# Clone the repository
git clone https://github.com/SS2Genji/readme-boss-bar.git
cd readme-boss-bar

# Generate via flags
node bin/cli.js -b "MILESTONE 1:3:3" -b "MILESTONE 2:5:1" -o assets/boss_bar.svg

# Or generate from a JSON config
node bin/cli.js --config config.example.json -o assets/boss_bar.svg
```

### JSON Config Format (`config.example.json`):
```json
[
  { "name": "MILESTONE 1", "totalBars": 3, "hits": 3 },
  { "name": "MILESTONE 2", "totalBars": 5, "hits": 1 }
]
```

---

## 🤖 GitHub Actions Workflow

Automatically update your profile boss bar on every commit or milestone:

```yaml
name: Update Boss Bar
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
      - run: npx readme-boss-bar -b "MILESTONE 1:3:3" -b "MILESTONE 2:5:1" -o assets/boss_bar.svg
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update boss health bar"
```

---

## 📜 License

MIT License © 2026 [Ahmet Emir Şimşek](https://github.com/SS2Genji)
