# DEADLINE: OUTBREAK

A 2D side-scrolling zombie run-and-gun, built for the browser and playable from a static GitHub Pages deploy — no server, no database, no login.

> A quarantine operation has failed. The city is being abandoned. One route to the evacuation zone is left.

![Vertical slice gameplay: player firing a pistol at Walker zombies on the test street, HUD showing HP/score](docs/screenshot.png)

*(Placeholder art — procedurally generated, no final pixel art yet.)*

## Status

This is an early, playable **vertical slice**: menu → run/jump → pistol → Walker & Runner zombies → damage/death → score, on one short test street. It is the foundation the full level (multiple weapons, more infected types, mini-boss, boss) is being built on top of — see [CLAUDE.md](CLAUDE.md) for the full design spec and milestone plan.

## Controls

| Action | Primary | Alternate |
|---|---|---|
| Move | `A` / `D` | Arrow keys |
| Jump | `Space` | `X` |
| Crouch | `S` | Down arrow |
| Fire | `J` | `Z` |
| Dash / dodge | `Shift` | — |
| Pause | `Esc` | — |

Controls respond immediately — no input buffering delay beyond the intentional jump-buffer/coyote-time window that makes platforming feel forgiving.

## Features (current slice)

- Arcade-fast movement: acceleration/deceleration, coyote time, jump buffering, variable jump height, dash with i-frames, crouch.
- Data-driven weapon system (pistol live; SMG/shotgun/AR/flamethrower/rocket/grenade planned) with muzzle flash, shell casings, recoil, and screen shake.
- Data-driven zombie AI (Walker, Runner) with a shared state machine and an attack-slot manager so crowds pressure the player without piling on unfairly.
- Hit-stop, hit-flash, knockback, and pooled particle FX on every kill.
- HUD (HP, weapon, ammo, score, combo), pause overlay, game-over / level-complete overlay with retry.
- LocalStorage: high score and a gore ON/REDUCED preference. No backend of any kind.
- Parallax city backdrop, procedurally-generated placeholder art (no missing-texture risk while final pixel art is pending).

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks, then builds to dist/
npm run preview   # serve the production build locally
```

## Deployment (GitHub Pages)

Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which builds the app and publishes `dist/` via GitHub's official Pages actions. In the repo's **Settings → Pages**, set **Source** to **GitHub Actions** once; after that every push to `main` deploys automatically.

`vite.config.ts` uses `base: './'` so the built asset paths stay relative and work when served from a repository subpath (`https://USERNAME.github.io/REPOSITORY/`).

## Architecture

```text
src/
├─ main.ts                 Phaser.Game bootstrap
├─ game/
│  ├─ config/               balance.ts, weapons.ts, enemies.ts, gameConfig.ts — every tunable number lives here
│  ├─ scenes/                Boot → Preload → Menu → Game + UI (parallel HUD scene)
│  ├─ entities/              player/, enemies/, projectiles/
│  ├─ systems/                WeaponSystem, CameraController, FxSystem, ScoreSystem, AttackSlotManager
│  └─ utils/                  events.ts (centralized EventBus), placeholderTextures.ts (procedural art)
└─ styles/
```

Cross-scene communication (GameScene ↔ UIScene) goes through a single `EventBus`, never direct scene reach-through. See `utils/events.ts` for the full event list.

## Credits

Design spec and direction: see [CLAUDE.md](CLAUDE.md). All current art/audio is original placeholder content generated in-repo (`game/utils/placeholderTextures.ts`) — no third-party or copyrighted assets are used. Built with [Phaser 3](https://phaser.io/) + TypeScript + Vite.
