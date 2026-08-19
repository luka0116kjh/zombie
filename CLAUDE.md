# CLAUDE.md — 2D Zombie Run & Gun Game

## 0. ROLE

You are the lead game developer, gameplay programmer, technical artist, level designer, UI/UX designer, QA engineer, and release engineer for this project.

Your job is to build a polished, highly playable **2D side-scrolling zombie run-and-gun game** that runs entirely in the browser and can be deployed on **GitHub Pages**.

The game should capture the fast, satisfying arcade feeling of classic 1990s run-and-gun games, while being an **original zombie-themed IP**.

Do not copy or reuse copyrighted characters, sprites, UI, maps, sounds, logos, names, animations, or level layouts from Metal Slug or any other commercial game.

Use them only as a high-level reference for:
- responsive movement
- exaggerated hit reactions
- dense arcade action
- expressive pixel-art animation
- weapon variety
- destructible props
- cinematic boss encounters
- readable combat feedback

The final game must feel like a real small indie game, not a tutorial demo.

---

# 1. PROJECT GOAL

Create a browser-based 2D zombie action game with the following core fantasy:

> The player is a survivor fighting through a collapsing zombie-infested city using increasingly powerful weapons while rescuing survivors, destroying infected creatures, and fighting large bosses.

Primary goals:

1. Extremely responsive controls
2. Satisfying shooting
3. Strong zombie hit feedback
4. High-quality pixel-art presentation
5. Multiple weapons
6. Multiple zombie behaviors
7. Smooth camera movement
8. Destructible environmental objects
9. Mini-boss and boss battles
10. Score/combo system
11. Replayability
12. Excellent performance
13. Fully static deployment
14. GitHub Pages compatibility

---

# 2. TECHNICAL CONSTRAINTS

This project MUST work as a static website.

Do NOT require:

- Node.js server at runtime
- Express
- PHP
- databases
- Firebase
- Supabase
- WebSocket servers
- server-side APIs
- authentication servers
- paid backend services

Recommended stack:

- TypeScript
- Vite
- Phaser 3
- HTML5 Canvas/WebGL
- CSS
- Web Audio API / Phaser Audio
- LocalStorage for settings and local high score

Runtime architecture:

```text
Browser
  ↓
index.html
  ↓
Vite bundle
  ↓
Phaser Game
  ↓
Scenes / Entities / Systems / Assets
```

GitHub Pages must be able to host the final `/dist` output.

Configure Vite so asset paths work correctly when hosted inside a repository subdirectory.

Prefer:

```ts
base: './'
```

unless there is a stronger reason to use a repository-specific base path.

---

# 3. DEVELOPMENT PHILOSOPHY

Prioritize the following order:

```text
GAME FEEL
→ CORE COMBAT
→ ENEMY AI
→ LEVEL FLOW
→ VISUAL FEEDBACK
→ CONTENT
→ POLISH
→ OPTIMIZATION
```

Never spend large amounts of time polishing menus before the core gameplay feels good.

Every major feature must follow:

```text
Hypothesis
→ Minimal Implementation
→ Test
→ Observe
→ Improve
→ Integrate
```

Do not endlessly patch a broken approach.

If the same implementation strategy fails three times:

1. stop
2. identify the root cause
3. explain the issue in a concise code comment or task note
4. choose a different implementation strategy

---

# 4. GAME CONCEPT

Working title:

**DEADLINE: OUTBREAK**

Genre:

- 2D side-scrolling run-and-gun
- zombie action
- arcade shooter
- survival action

Tone:

- intense
- chaotic
- darkly humorous
- cinematic
- exaggerated arcade action

Visual direction:

- detailed pixel art
- strong silhouettes
- dramatic lighting
- urban destruction
- blood-red infection effects
- fire, smoke, sparks, muzzle flashes
- layered backgrounds with parallax

Do not make the entire game visually dark.

Enemies, bullets, hazards, pickups, and the player must remain readable at all times.

---

# 5. CORE GAME LOOP

The main gameplay loop:

```text
Move
→ encounter zombies
→ shoot / dodge / melee
→ build combo
→ collect ammo / score / health
→ rescue survivors
→ destroy environmental objects
→ encounter stronger enemy wave
→ checkpoint
→ mini-boss
→ continue through level
→ boss
→ level results
```

The player should rarely go more than 8–12 seconds without:

- combat
- environmental interaction
- a pickup
- a visual event
- a new enemy pattern
- an interesting traversal moment

---

# 6. PLAYER CONTROLS

Desktop controls:

```text
A / D        Move
W            Aim up / contextual climb
S            Crouch / drop through platform
Space        Jump
J            Fire
K            Grenade
L            Melee
Shift        Dash / dodge
E            Interact / rescue
Esc          Pause
```

Alternative controls:

```text
Arrow Keys   Movement / aim
Z            Fire
X            Jump
C            Grenade
```

Gamepad support is strongly preferred.

Controls must be rebindable later if architecture allows.

---

# 7. PLAYER MOVEMENT

Movement must feel arcade-fast and immediately responsive.

Required:

- horizontal acceleration
- controlled deceleration
- short stopping distance
- jump
- coyote time
- jump input buffering
- variable jump height
- crouching
- aim upward
- shooting while jumping
- shooting while crouched
- controlled knockback
- short dodge/dash
- temporary invulnerability during appropriate dodge frames

Suggested feel targets:

```text
Coyote time:       ~80–120 ms
Jump buffer:       ~100–150 ms
Fire input buffer: short
Dash cooldown:     ~0.8–1.4 sec
```

Numbers must remain centralized in configuration files.

Do not scatter magic numbers throughout gameplay code.

---

# 8. PLAYER STATE MACHINE

Use a clear state model.

Example:

```text
IDLE
RUN
JUMP
FALL
CROUCH
DASH
HURT
DEAD
```

Animation and gameplay state must not fight each other.

Avoid deeply nested conditionals.

Prefer explicit state transitions.

---

# 9. WEAPON SYSTEM

Create a reusable weapon system.

Initial weapons:

## Pistol

- unlimited reserve ammo
- moderate damage
- medium fire rate
- highly accurate

## SMG

- high fire rate
- medium-low damage
- larger bullet spread
- limited ammo

## Shotgun

- multiple pellets
- strong knockback
- high close-range damage
- slower rate of fire

## Assault Rifle

- balanced automatic weapon
- controlled recoil
- good general-purpose weapon

## Flamethrower

- short range
- continuous damage
- ignites enemies
- strong crowd control

## Rocket Launcher

- slow projectile
- explosion radius
- huge damage
- screen shake
- strong knockback

## Grenade

- throwable arc
- timed fuse
- bouncing
- explosion
- splash damage

Weapon data should use configuration objects.

Example concept:

```ts
interface WeaponConfig {
  id: string
  damage: number
  fireRate: number
  projectileSpeed: number
  magazineSize: number
  spread: number
  recoil: number
  knockback: number
  screenShake: number
}
```

Do not implement each weapon as an unrelated hardcoded system.

---

# 10. SHOOTING FEEL

Every successful shot should provide multiple layers of feedback.

Use combinations of:

- muzzle flash
- shell casing
- weapon recoil
- player animation recoil
- enemy hit flash
- enemy hit stop
- blood particles
- debris particles
- knockback
- camera impulse
- sound variation
- damage reaction animation
- impact sparks on metal
- dust impact on concrete

Do not overuse screen shake.

Small weapons:
very subtle shake

Shotgun:
medium impulse

Rocket / explosion:
strong but short impulse

Boss attacks:
controlled dramatic shake

---

# 11. HIT STOP

Implement brief hit stop for major impacts.

Example:

```text
Pistol hit:        0–15 ms
Shotgun kill:      25–45 ms
Heavy melee:       35–60 ms
Explosion:         30–70 ms
Boss weak point:   40–80 ms
```

Do not freeze the game long enough to make controls feel broken.

---

# 12. ZOMBIE ENEMY TYPES

Create enemy behavior through reusable components or state machines.

## Walker

Basic zombie.

Behavior:

```text
wander
→ detect player
→ chase
→ attack
```

## Runner

Fast zombie.

- aggressive
- short reaction delay
- jumps small obstacles

## Crawler

Low-profile zombie.

- difficult to hit with straight shots
- forces crouching or angled attacks

## Riot Zombie

Armored enemy.

- front armor
- bullets can ricochet
- vulnerable from behind or after stagger

## Spitter

Ranged enemy.

- keeps distance
- fires toxic projectile
- creates temporary acid hazard

## Exploder

Unstable infected.

- approaches player
- swells
- explodes
- can damage other zombies

## Screamer

Support enemy.

- screams
- temporarily buffs nearby zombies
- can summon additional enemies

## Brute

Heavy infected.

- slow
- large HP
- high knockback resistance
- charge attack
- ground slam

---

# 13. ENEMY AI RULES

Avoid expensive AI.

Use simple but convincing behavior:

- distance checks
- line-of-sight checks
- state machines
- timers
- nav markers where needed

Example state model:

```text
SPAWN
IDLE
PATROL
ALERT
CHASE
ATTACK
STAGGER
DEAD
```

Enemies should not all attack simultaneously.

Implement attack-slot or pressure logic so crowds feel dangerous but fair.

Possible system:

```text
nearby enemies
→ request attack slot
→ limited number receive permission
→ others reposition / threaten
```

This prevents unreadable instant deaths.

---

# 14. GORE / DESTRUCTION SYSTEM

Keep the style exaggerated and arcade-like rather than realistic.

Possible effects:

- blood particles
- infected green/red particles
- body knockback
- optional dismemberment-style sprite fragments if assets support it
- decals with a strict maximum count
- breakable props

Add a settings toggle:

```text
Gore:
ON / REDUCED
```

Avoid unlimited persistent particles.

Use pooling.

---

# 15. DESTRUCTIBLE ENVIRONMENT

Examples:

- crates
- barricades
- windows
- street lamps
- explosive barrels
- vending machines
- wooden doors
- signs
- zombie nests

Destroyed objects can produce:

- ammo
- health
- score items
- temporary weapon pickups
- environmental hazards

Explosive barrels must create chain-reaction possibilities.

---

# 16. LEVEL 1

Build one highly polished playable level before attempting multiple levels.

Level theme:

**Outbreak Downtown**

Approximate flow:

```text
Intro street
→ abandoned checkpoint
→ convenience store frontage
→ subway entrance
→ burning intersection
→ apartment alley
→ evacuation bridge
→ boss arena
```

Target initial playtime:

```text
5–10 minutes
```

The level must include:

- parallax background
- destructible props
- varied elevation
- zombie waves
- at least 4 enemy types
- one scripted set piece
- one survivor rescue
- one mini-boss style encounter
- final boss

---

# 17. LEVEL PACING

Use intentional pacing.

Example:

```text
0:00–0:30
basic movement + walkers

0:30–1:15
first weapon pickup + runners

1:15–2:00
environment destruction

2:00–3:00
mixed combat encounter

3:00–3:30
short breathing space

3:30–4:30
large wave + special infected

4:30–5:30
mini-boss

5:30+
boss approach and boss
```

Do not simply spawn enemies endlessly.

Combat encounters should have beginnings and endings.

---

# 18. SURVIVOR RESCUE SYSTEM

Some NPC survivors appear trapped.

Examples:

- behind barricades
- surrounded by zombies
- inside breakable rooms

Player rescues them using interaction.

Reward:

- score
- health
- ammo
- temporary helper
- bonus multiplier

Use floating feedback such as:

```text
SURVIVOR RESCUED
+500
```

---

# 19. COMBO SYSTEM

Kills within a short interval increase combo.

Example:

```text
x2
x3
x4
...
```

Combo decreases when the timer expires.

Reward:

- score multiplier
- visual intensity
- weapon pickup chance
- end-of-level rank

Do not let combo UI cover combat.

---

# 20. SCORE SYSTEM

Score examples:

```text
Walker               100
Runner                150
Spitter               250
Brute                 700
Boss                  5000
Survivor rescue       500
Destructible bonus    25–100
Combo multiplier      dynamic
```

Store local best score using LocalStorage.

Never require a backend leaderboard.

---

# 21. HEALTH SYSTEM

Recommended:

```text
Player HP: 100
```

Possible UI:

```text
HP bar
weapon icon
ammo
grenades
score
combo
```

Use short invulnerability after player damage.

Prevent damage from being applied every physics frame.

---

# 22. PICKUPS

Possible pickups:

- food / medkit
- ammo crate
- grenade
- temporary weapon
- score medal
- armor
- adrenaline

Pickups should bounce slightly when spawned.

Use strong readable icons.

---

# 23. BOSS DESIGN

Level 1 boss concept:

**THE HAULER**

A giant infected construction/evacuation vehicle creature or mutated heavy infected fused with industrial debris.

Boss phases:

## Phase 1

- heavy melee swipes
- ground slam
- slow projectile debris

## Phase 2

At ~65% HP:

- arena becomes partially damaged
- zombie adds spawn
- boss becomes faster

## Phase 3

At ~30% HP:

- exposed weak point
- aggressive charge
- large telegraphed attacks
- intense music

Boss requirements:

- readable attack telegraphs
- multiple attack patterns
- vulnerability windows
- health bar
- phase transitions
- unique death sequence

The boss must not simply be a high-HP normal enemy.

---

# 24. CAMERA

Create a dedicated camera controller.

Required:

- smooth follow
- horizontal look-ahead
- small dead zone
- vertical damping
- bounds
- camera shake
- boss arena locking
- scripted focus when appropriate

Avoid permanently centering the player.

The player should normally be slightly behind the center depending on movement direction.

---

# 25. PARALLAX BACKGROUNDS

Use multiple visual layers.

Example:

```text
sky
distant city
mid-distance buildings
foreground ruins
smoke
ambient particles
```

Different layers move at different speeds.

Keep background contrast lower than gameplay objects.

---

# 26. PIXEL ART RULES

Use a consistent base resolution.

Recommended internal design target:

```text
320x180
or
480x270
```

Then scale cleanly.

Use:

```text
pixelArt: true
antialias: false
roundPixels: true
```

when appropriate.

Never mix low-resolution pixel sprites with blurry UI scaling.

UI can be rendered at higher logical resolution if needed.

---

# 27. PLACEHOLDER ASSET STRATEGY

The game must remain playable even before final art exists.

If no art assets are available:

Create clean temporary assets using:

- generated geometric sprites
- simple pixel silhouettes
- procedural shapes
- sprite sheets created inside the repository when reasonable

Do NOT leave missing texture errors.

Every referenced asset must exist.

When using temporary assets, mark them clearly:

```text
PLACEHOLDER
```

in source organization, not as ugly on-screen debug text.

---

# 28. ANIMATION REQUIREMENTS

Player animation states:

```text
idle
run
jump
fall
crouch
shoot
run_shoot
jump_shoot
melee
dash
hurt
death
```

Zombie animations:

```text
idle
walk/run
attack
hurt
death
special action
```

Animations should react quickly to player input.

Gameplay logic should not be blocked by long animations.

---

# 29. PARTICLE SYSTEM

Create reusable particle presets.

Examples:

- blood
- sparks
- concrete dust
- wood chips
- smoke
- fire
- bullet impact
- shell casing
- explosion debris

Use object pooling where practical.

Cap maximum active particles.

Performance is more important than infinite effects.

---

# 30. AUDIO

Audio categories:

```text
Master
Music
SFX
```

Add volume sliders.

Sound design priorities:

1. gunshots
2. bullet impacts
3. zombie reactions
4. explosions
5. UI feedback
6. footsteps
7. ambience

Randomize pitch or choose from multiple similar effects where possible to reduce repetition.

Do not reference commercial copyrighted audio.

---

# 31. MUSIC

Preferred direction:

- industrial action
- electronic percussion
- dark arcade energy

Support looping background music.

Boss music may replace the level theme.

All audio must be:
- original
- generated legally
- public domain
- appropriately licensed

Document asset licensing when external assets are added.

---

# 32. UI / UX

Title screen:

```text
DEADLINE: OUTBREAK

START
HOW TO PLAY
SETTINGS
CREDITS
```

HUD:

```text
HP
weapon
ammo
grenades
score
combo
```

Pause menu:

```text
RESUME
RESTART CHECKPOINT
SETTINGS
QUIT TO MENU
```

Game Over:

```text
GAME OVER

RETRY
MAIN MENU
```

Level complete:

```text
MISSION COMPLETE

Kills
Accuracy
Survivors
Max Combo
Time
Score
Rank
```

Ranks:

```text
S
A
B
C
D
```

---

# 33. RESPONSIVE DESIGN

Primary target:

```text
Desktop browser
1920x1080
1366x768
1280x720
```

The game should scale to smaller displays.

Maintain aspect ratio where practical.

Mobile gameplay support is optional for the first milestone.

If mobile support is added:

- virtual stick
- fire button
- jump button
- grenade button

Do not compromise desktop controls for mobile.

---

# 34. PERFORMANCE TARGET

Target:

```text
60 FPS
```

on a normal modern laptop.

Avoid:

- creating hundreds of objects per frame
- excessive physics bodies
- uncontrolled particles
- massive transparent textures
- unbounded decals
- expensive per-enemy raycasts every frame

Use:

- object pooling
- spawn managers
- update throttling
- camera culling
- entity cleanup
- texture atlases where appropriate

---

# 35. PHYSICS

Use Phaser Arcade Physics unless a feature clearly requires otherwise.

Do not introduce Matter.js merely for visual complexity.

Collision groups should remain clear:

```text
player
enemy
playerBullet
enemyProjectile
platform
destructible
pickup
hazard
```

Centralize collision registration.

---

# 36. PROJECT ARCHITECTURE

Recommended structure:

```text
src/
├─ main.ts
├─ game/
│  ├─ config/
│  │  ├─ gameConfig.ts
│  │  ├─ balance.ts
│  │  └─ weapons.ts
│  │
│  ├─ scenes/
│  │  ├─ BootScene.ts
│  │  ├─ PreloadScene.ts
│  │  ├─ MenuScene.ts
│  │  ├─ GameScene.ts
│  │  ├─ UIScene.ts
│  │  ├─ PauseScene.ts
│  │  └─ ResultsScene.ts
│  │
│  ├─ entities/
│  │  ├─ player/
│  │  ├─ enemies/
│  │  ├─ bosses/
│  │  ├─ weapons/
│  │  ├─ projectiles/
│  │  └─ pickups/
│  │
│  ├─ systems/
│  │  ├─ CombatSystem.ts
│  │  ├─ SpawnSystem.ts
│  │  ├─ ComboSystem.ts
│  │  ├─ ScoreSystem.ts
│  │  ├─ CameraController.ts
│  │  ├─ AudioManager.ts
│  │  └─ SaveManager.ts
│  │
│  ├─ levels/
│  ├─ ui/
│  ├─ fx/
│  └─ utils/
│
├─ styles/
└─ assets/
   ├─ sprites/
   ├─ backgrounds/
   ├─ tiles/
   ├─ ui/
   ├─ audio/
   └─ fonts/
```

Architecture may evolve, but maintain:

- clear ownership
- small focused modules
- reusable systems
- minimal circular dependencies

---

# 37. CODE QUALITY RULES

Use TypeScript strict mode where reasonable.

Never use `any` simply to silence compiler errors.

Prefer:

- enums/unions for states
- interfaces for data
- composition over inheritance when appropriate
- data-driven weapon/enemy stats
- reusable helpers

Avoid giant 1000-line scene classes.

If a class grows too large, split responsibilities.

---

# 38. EVENT SYSTEM

Use events for cross-system communication where it improves separation.

Examples:

```text
PLAYER_DAMAGED
PLAYER_DIED
ENEMY_KILLED
COMBO_CHANGED
WEAPON_CHANGED
AMMO_CHANGED
BOSS_STARTED
BOSS_PHASE_CHANGED
LEVEL_COMPLETED
```

Avoid invisible event spaghetti.

Event names must be centralized.

---

# 39. SAVE SYSTEM

Use LocalStorage.

Persist:

- high score
- settings
- audio volume
- gore preference
- completed level
- control settings if implemented

Do not store critical state every frame.

---

# 40. CHECKPOINT SYSTEM

Checkpoints should store enough state to restart the current section.

Possible stored values:

```text
checkpoint ID
player health
weapon
ammo
grenades
score snapshot
```

Do not attempt full world serialization.

---

# 41. GAME JUICE CHECKLIST

Before considering combat polished, confirm:

- [ ] muzzle flash exists
- [ ] weapon recoil exists
- [ ] impact visual exists
- [ ] hit sound exists
- [ ] enemy reacts to hits
- [ ] enemy death has impact
- [ ] explosions shake camera
- [ ] shell casings or equivalent detail exists
- [ ] pickups animate
- [ ] score feedback appears
- [ ] combo feedback appears
- [ ] boss attacks are telegraphed
- [ ] player damage is clearly communicated

---

# 42. ACCESSIBILITY

Provide:

- screen shake intensity
- master volume
- music volume
- SFX volume
- gore reduction
- fullscreen toggle if browser allows
- pause
- readable UI

Optional:

- colorblind-safe enemy projectile settings
- reduced flashing mode

Avoid excessive rapid flashing.

---

# 43. DEBUG TOOLS

Development mode may include:

```text
F1 toggle debug overlay
F2 spawn enemy
F3 weapon cycle
F4 damage player
F5 clear enemies
```

Debug overlay can show:

```text
FPS
enemy count
projectile count
particle count
player state
player coordinates
current checkpoint
```

Debug features must not appear in normal production UI.

---

# 44. ERROR HANDLING

Never allow the game to fail silently.

Handle:

- missing assets
- audio load failure
- unsupported browser audio state
- invalid level data
- LocalStorage failure

Use concise console warnings.

Do not spam the console every frame.

---

# 45. GITHUB PAGES DEPLOYMENT

The project must support deployment with:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Create a GitHub Actions deployment workflow.

Suggested path:

```text
.github/workflows/deploy.yml
```

Workflow requirements:

1. checkout repository
2. setup Node
3. npm ci
4. npm run build
5. upload Pages artifact
6. deploy to GitHub Pages

The generated site must work correctly when opened from:

```text
https://USERNAME.github.io/REPOSITORY/
```

Test:

- JavaScript bundle paths
- sprite paths
- audio paths
- CSS paths
- refresh behavior
- relative URLs

Do not use absolute `/assets/...` paths if they break repository hosting.

---

# 46. README

Create a polished README containing:

- title
- screenshot placeholder
- description
- controls
- features
- local development
- build instructions
- GitHub Pages deployment
- project architecture summary
- credits
- asset licenses

---

# 47. FIRST DEVELOPMENT MILESTONE

Do NOT immediately attempt the whole game.

Milestone 1 must create a polished vertical slice.

Required:

```text
Menu
↓
Gameplay
↓
player movement
↓
pistol shooting
↓
walker zombie
↓
runner zombie
↓
damage
↓
death
↓
score
↓
small playable level
```

The milestone should already feel fun.

---

# 48. SECOND MILESTONE

Add:

- SMG
- shotgun
- grenade
- destructible props
- combo system
- survivor rescue
- spitter
- brute
- better VFX
- better sound
- camera polish

---

# 49. THIRD MILESTONE

Add:

- complete level
- mini-boss
- final boss
- results screen
- checkpoints
- settings
- balancing
- performance optimization
- final GitHub Pages deployment

---

# 50. IMPLEMENTATION ORDER

Use this implementation order unless a concrete technical reason requires change:

```text
1. Create project
2. Configure Vite + TypeScript + Phaser
3. Configure GitHub Pages-safe asset paths
4. Create scenes
5. Create player movement
6. Add camera
7. Add pistol
8. Add projectiles
9. Add Walker
10. Add damage system
11. Add death system
12. Add HUD
13. Add score
14. Add Runner
15. Build small level
16. Add combat effects
17. Add weapon system
18. Add additional weapons
19. Add additional zombies
20. Add destructibles
21. Add combo
22. Add survivor rescue
23. Add checkpoints
24. Add mini-boss
25. Add boss
26. Add menus/settings
27. Add audio polish
28. Optimize
29. QA
30. Deploy
```

---

# 51. WORKING RULES FOR CLAUDE CODE

When editing the project:

1. Inspect existing files before changing architecture.
2. Do not rewrite working code unnecessarily.
3. Keep changes scoped.
4. Run type checking after meaningful changes.
5. Run build after meaningful changes.
6. Never claim something works without checking it when checks are possible.
7. Never delete existing assets without verifying references.
8. Do not add dependencies without a clear reason.
9. Avoid enormous third-party libraries for small effects.
10. Keep GitHub Pages compatibility at all times.

After each meaningful task, report only:

```text
Implemented
Tested
Remaining
Potential issue
```

Keep reports concise.

---

# 52. AUTONOMOUS DECISION RULES

Do not constantly ask the user minor questions.

Make sensible game-development decisions autonomously.

Ask only when the decision would significantly affect:

- art direction
- gameplay scope
- destructive refactor
- external paid service
- licensing
- major dependency choice

Otherwise implement the best professional default.

---

# 53. VISUAL QUALITY BAR

Avoid the appearance of:

- a coding tutorial
- default Phaser examples
- plain rectangles with no polish
- unstyled HTML buttons
- generic debug UI
- random asset packs with inconsistent styles

Even placeholder graphics should have intentional composition.

Use:

- layered backgrounds
- strong typography
- UI frames
- subtle animation
- visual hierarchy
- particles
- foreground props
- lighting overlays
- coherent color palette

---

# 54. GAME FEEL QUALITY BAR

The game should feel satisfying even with placeholder graphics.

If movement or shooting feels bad:

STOP adding content.

Fix movement and shooting first.

Questions to repeatedly evaluate:

```text
Does movement respond immediately?
Does jumping feel predictable?
Does shooting feel powerful?
Can the player understand what hit them?
Are enemies readable?
Are attacks fair?
Does every kill feel satisfying?
Is the level pushing the player forward?
```

---

# 55. BALANCING

Place balance constants in centralized config files.

Examples:

```text
PLAYER_MAX_HP
PLAYER_SPEED
PLAYER_JUMP_FORCE
PLAYER_DASH_SPEED

WALKER_HP
RUNNER_HP
BRUTE_HP

PISTOL_DAMAGE
SHOTGUN_DAMAGE
ROCKET_DAMAGE

COMBO_TIMEOUT
INVULNERABILITY_TIME
```

Balance through testing rather than random values spread across classes.

---

# 56. FAIRNESS RULES

Never spawn enemies directly on top of the player.

Enemy projectiles should have readable visuals.

Major attacks must have telegraphs.

If enemies spawn off-screen, provide enough approach time.

Avoid unavoidable damage.

Difficulty should come from:

- positioning
- enemy combinations
- movement pressure
- timing

not unfair randomness.

---

# 57. SPAWN DIRECTOR

Create a simple encounter/spawn director.

Level data can define waves:

```ts
{
  triggerX: 1600,
  lockArena: true,
  waves: [
    {
      enemies: [
        { type: 'walker', count: 5 },
        { type: 'runner', count: 2 }
      ]
    }
  ]
}
```

When an encounter starts:

1. optionally lock camera
2. spawn enemies
3. wait for wave clear
4. unlock route
5. reward player

This is preferable to putting every spawn directly into GameScene.

---

# 58. ORIGINALITY REQUIREMENT

This game may be inspired by the broad arcade run-and-gun genre, but all identity must be original.

Create original:

- protagonist
- zombie designs
- game title
- weapons presentation
- level layouts
- enemy patterns
- bosses
- UI
- logos
- story
- dialogue

Never recreate recognizable commercial game content pixel-for-pixel.

---

# 59. OPTIONAL STORY

Keep story lightweight.

Possible setup:

> A quarantine operation has failed.
> The city is being abandoned.
> The player has one route left to the evacuation zone.

Use environmental storytelling rather than long dialogue.

Examples:

- abandoned military checkpoint
- evacuation signs
- emergency broadcasts
- survivor graffiti
- broken ambulances
- quarantine barriers

---

# 60. INTRO SEQUENCE

Keep intro short.

Example:

```text
black screen
↓
emergency radio message
↓
city silhouette
↓
explosion
↓
player enters street
↓
control immediately given to player
```

Target intro length:

```text
under 10 seconds
```

Allow skipping.

---

# 61. FINAL POLISH PASS

Before release:

Gameplay:
- [ ] movement feels responsive
- [ ] weapon switching works
- [ ] all weapons deal correct damage
- [ ] enemy attacks are readable
- [ ] boss phases work
- [ ] checkpoints work

Visual:
- [ ] no missing textures
- [ ] no blurry pixel-art scaling
- [ ] no UI overlap
- [ ] particles are capped
- [ ] parallax looks correct

Audio:
- [ ] volume controls work
- [ ] music loops cleanly
- [ ] no painfully loud sound
- [ ] repeated sounds have variation

Technical:
- [ ] `npm run build` passes
- [ ] no TypeScript errors
- [ ] no major console errors
- [ ] GitHub Pages loads correctly
- [ ] repository subpath assets load
- [ ] LocalStorage failure does not crash game
- [ ] desktop keyboard works
- [ ] pause works
- [ ] restart works

Performance:
- [ ] stable FPS
- [ ] dead enemies are cleaned up
- [ ] projectiles are cleaned up
- [ ] particles are cleaned up
- [ ] no obvious memory growth

---

# 62. DEFINITION OF DONE

The project is not considered complete because it merely launches.

A release-quality vertical slice is considered done when:

1. The player can start from a polished menu.
2. The game loads without console-breaking errors.
3. Movement is responsive.
4. Shooting feels satisfying.
5. At least four enemy types exist.
6. Multiple weapons meaningfully differ.
7. A complete level can be finished.
8. At least one boss exists.
9. Death and retry work.
10. HUD is polished.
11. Audio settings work.
12. Performance is stable.
13. GitHub Pages deployment works.
14. Assets are original or properly licensed.
15. The game is fun enough to replay.

---

# 63. IMMEDIATE TASK

Begin by inspecting the repository.

If the repository is empty:

1. initialize a Vite + TypeScript project
2. install Phaser
3. establish the recommended structure
4. create BootScene, PreloadScene, MenuScene, GameScene, and UIScene
5. create a playable player character using temporary original pixel-style graphics
6. implement responsive run/jump
7. implement a pistol
8. implement one Walker zombie
9. implement bullet collision and enemy death
10. create hit feedback
11. create a short test street
12. confirm `npm run build`
13. prepare GitHub Pages deployment

Do not build twenty systems before the first playable combat loop exists.

The first target is:

> Open browser → press Start → run → jump → shoot zombie → zombie reacts → zombie dies → player wants to shoot another one.

Only after that feels good should the project expand.

---

# 64. FINAL PRIORITY

Whenever requirements conflict, prioritize:

```text
PLAYABILITY
> GAME FEEL
> STABILITY
> READABILITY
> PERFORMANCE
> VISUAL POLISH
> FEATURE COUNT
```

A small polished game is better than a large broken game.
