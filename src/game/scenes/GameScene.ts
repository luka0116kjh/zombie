import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/gameConfig'
import { HITSTOP_MS, RANDOM_SPAWN, BRUTE_SPAWN } from '../config/balance'
import { ENEMIES } from '../config/enemies'
import { Player, type PlayerInput } from '../entities/player/Player'
import { Zombie } from '../entities/enemies/Zombie'
import { Bullet } from '../entities/projectiles/Bullet'
import { CameraController } from '../systems/CameraController'
import { WeaponSystem } from '../systems/WeaponSystem'
import { AttackSlotManager } from '../systems/AttackSlotManager'
import { FxSystem } from '../systems/FxSystem'
import { ScoreSystem } from '../systems/ScoreSystem'
import { EventBus, GameEvents } from '../utils/events'
import { loadGorePreference } from './MenuScene'

const LEVEL_WIDTH = 3200
const GROUND_TOP = GAME_HEIGHT - 32

interface EnemySpawn {
  type: keyof typeof ENEMIES
  x: number
}

const ENEMY_SPAWNS: EnemySpawn[] = [
  { type: 'walker', x: 560 },
  { type: 'walker', x: 900 },
  { type: 'runner', x: 1250 },
  { type: 'walker', x: 1620 },
  { type: 'walker', x: 2000 },
  { type: 'runner', x: 2350 },
  { type: 'walker', x: 2650 },
]

export class GameScene extends Phaser.Scene {
  private player!: Player
  private cameraController!: CameraController
  private weaponSystem!: WeaponSystem
  private attackSlots!: AttackSlotManager
  private fx!: FxSystem
  private scoreSystem!: ScoreSystem
  private zombies!: Phaser.Physics.Arcade.Group
  private spawnTimer!: Phaser.Time.TimerEvent
  private bruteSpawnTimer!: Phaser.Time.TimerEvent

  private keys!: Record<string, Phaser.Input.Keyboard.Key>
  private bgFar!: Phaser.GameObjects.TileSprite
  private bgMid!: Phaser.GameObjects.TileSprite
  private bgSky!: Phaser.GameObjects.TileSprite

  private hitStopUntil = 0
  private levelComplete = false
  private paused = false

  constructor() {
    super('Game')
  }

  create() {
    this.levelComplete = false
    this.hitStopUntil = 0
    this.paused = false

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBackgroundColor(0x120c18)

    this.buildParallax()
    this.buildGround()

    this.attackSlots = new AttackSlotManager(2)
    this.fx = new FxSystem(this)
    this.fx.setGoreEnabled(loadGorePreference())
    this.scoreSystem = new ScoreSystem()

    this.player = new Player(this, 100, GROUND_TOP - 60)
    this.physics.add.collider(this.player, this.groundCollider)

    this.cameraController = new CameraController(this, this.player)
    this.cameraController.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT)

    this.weaponSystem = new WeaponSystem(this, this.cameraController)

    // NOTE: Arcade.Group.add() re-applies the group's own body defaults
    // (gravity, bounce, collideWorldBounds, ...) to whatever is added,
    // silently overwriting the per-instance values each Zombie sets on
    // itself in its constructor. Passing them here keeps the group's
    // defaults in sync with what Zombie actually wants instead of
    // fighting it after the fact.
    this.zombies = this.physics.add.group({ gravityY: 1500, collideWorldBounds: true })
    for (const spawn of ENEMY_SPAWNS) this.spawnZombie(spawn.type, spawn.x)

    // Brutes from the very start: staggered ahead of the player rather
    // than stacked on one spot, and still off-screen at spawn time so
    // the opening seconds stay survivable instead of an instant swarm.
    for (let i = 0; i < BRUTE_SPAWN.INITIAL_COUNT; i++) {
      const x = this.player.x + BRUTE_SPAWN.MIN_DISTANCE_FROM_PLAYER + i * 160
      this.spawnZombie('brute', Phaser.Math.Clamp(x, 60, LEVEL_WIDTH - 60))
    }

    this.physics.add.collider(this.zombies, this.groundCollider)
    this.physics.add.collider(this.player, this.zombies)
    this.physics.add.overlap(
      this.weaponSystem.bullets,
      this.zombies,
      this.onBulletHitZombie,
      undefined,
      this
    )

    this.spawnTimer = this.time.addEvent({
      delay: RANDOM_SPAWN.INTERVAL_MS,
      loop: true,
      callback: this.spawnRandomWave,
      callbackScope: this,
    })

    this.bruteSpawnTimer = this.time.addEvent({
      delay: BRUTE_SPAWN.INTERVAL_MS,
      loop: true,
      callback: this.spawnBruteWave,
      callbackScope: this,
    })

    this.setupInput()
    this.setupEventListeners()
  }

  private groundCollider!: Phaser.Physics.Arcade.StaticGroup

  private buildParallax() {
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_sky')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_SKY)

    this.bgFar = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_far')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_FAR)
      .setAlpha(0.85)

    this.bgMid = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_mid')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_MID)
  }

  private buildGround() {
    this.add
      .tileSprite(0, GROUND_TOP, LEVEL_WIDTH, 32, 'ground_tile')
      .setOrigin(0)
      .setDepth(DEPTH.GROUND)

    this.groundCollider = this.physics.add.staticGroup()
    const floor = this.add.rectangle(LEVEL_WIDTH / 2, GAME_HEIGHT + 16, LEVEL_WIDTH, 32, 0x000000, 0)
    this.groundCollider.add(floor)

    // One raised platform partway through so movement/jump feel gets
    // exercised even in the short test street.
    const platformX = 1450
    const platformY = GROUND_TOP - 110
    this.add
      .tileSprite(platformX, platformY, 220, 20, 'ground_tile')
      .setOrigin(0, 0.5)
      .setDepth(DEPTH.GROUND)
    const platform = this.add.rectangle(platformX + 110, platformY, 220, 20, 0x000000, 0)
    this.groundCollider.add(platform)
  }

  private spawnZombie(type: keyof typeof ENEMIES, x: number) {
    const cfg = ENEMIES[type]
    const zombie = new Zombie(this, x, GROUND_TOP - 40, cfg, this.attackSlots)
    this.zombies.add(zombie)
  }

  /** A random off-screen x, on either side of the player, clamped to the level. */
  private randomOffscreenX(minDist: number, maxDist: number): number {
    const side = Math.random() < 0.5 ? -1 : 1
    const dist = Phaser.Math.Between(minDist, maxDist)
    return Phaser.Math.Clamp(this.player.x + side * dist, 60, LEVEL_WIDTH - 60)
  }

  /** Recurring reinforcement wave: a few random zombies, off-screen, every few seconds. */
  private spawnRandomWave() {
    if (this.levelComplete || this.player.isDead) return
    if (this.zombies.countActive(true) >= RANDOM_SPAWN.MAX_ACTIVE_ZOMBIES) return

    for (let i = 0; i < RANDOM_SPAWN.COUNT_PER_WAVE; i++) {
      const x = this.randomOffscreenX(RANDOM_SPAWN.MIN_DISTANCE_FROM_PLAYER, RANDOM_SPAWN.MAX_DISTANCE_FROM_PLAYER)
      const type: keyof typeof ENEMIES = Math.random() < RANDOM_SPAWN.RUNNER_CHANCE ? 'runner' : 'walker'
      this.spawnZombie(type, x)
    }
  }

  /** Recurring Brute reinforcement wave — heavier, rarer, capped separately from the regular horde. */
  private spawnBruteWave() {
    if (this.levelComplete || this.player.isDead) return
    const activeBrutes = (this.zombies.getChildren() as Zombie[]).filter((z) => !z.isDead && z.cfg.id === 'brute')
    if (activeBrutes.length >= BRUTE_SPAWN.MAX_ACTIVE_BRUTES) return

    for (let i = 0; i < BRUTE_SPAWN.COUNT_PER_WAVE; i++) {
      const x = this.randomOffscreenX(BRUTE_SPAWN.MIN_DISTANCE_FROM_PLAYER, BRUTE_SPAWN.MAX_DISTANCE_FROM_PLAYER)
      this.spawnZombie('brute', x)
    }
  }

  private setupInput() {
    const kb = this.input.keyboard!
    this.keys = {
      left: kb.addKey('A'),
      right: kb.addKey('D'),
      leftArrow: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      rightArrow: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: kb.addKey('W'),
      upArrow: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey('S'),
      downArrow: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      jumpAlt: kb.addKey('X'),
      fire: kb.addKey('J'),
      fireAlt: kb.addKey('Z'),
      dash: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      pause: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    }
  }

  private setupEventListeners() {
    EventBus.on(GameEvents.ENEMY_KILLED, this.onEnemyKilled, this)
    EventBus.on(GameEvents.PLAYER_DIED, this.onPlayerDied, this)
    EventBus.on(GameEvents.GAME_RESTART, this.onRestart, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.ENEMY_KILLED, this.onEnemyKilled, this)
      EventBus.off(GameEvents.PLAYER_DIED, this.onPlayerDied, this)
      EventBus.off(GameEvents.GAME_RESTART, this.onRestart, this)
    })
  }

  private onEnemyKilled = (payload: { x: number; y: number; score: number }) => {
    this.scoreSystem.addKill(payload.score, this.time.now)
    this.fx.deathBurst(payload.x, payload.y)
    this.triggerHitStop(HITSTOP_MS.KILL)
  }

  private onPlayerDied = () => {
    this.scoreSystem.saveIfHighScore()
  }

  private onRestart = () => {
    this.scene.restart()
  }

  private onBulletHitZombie = (bulletObj: unknown, zombieObj: unknown) => {
    const bullet = bulletObj as Bullet
    const zombie = zombieObj as Zombie
    if (!bullet.active || zombie.isDead) return

    const wasAlive = !zombie.isDead
    zombie.takeDamage(bullet.damage, bullet.x, bullet.knockback)
    this.fx.hitImpact(zombie.x, zombie.y - 10)
    if (wasAlive && !zombie.isDead) this.triggerHitStop(HITSTOP_MS.PISTOL_HIT)
    bullet.deactivate()
  }

  private triggerHitStop(ms: number) {
    if (ms <= 0) return
    this.hitStopUntil = Math.max(this.hitStopUntil, this.time.now + ms)
    if (!this.physics.world.isPaused) this.physics.world.pause()
  }

  private buildPlayerInput(): PlayerInput {
    const k = this.keys
    return {
      left: k.left.isDown || k.leftArrow.isDown,
      right: k.right.isDown || k.rightArrow.isDown,
      up: k.up.isDown || k.upArrow.isDown,
      down: k.down.isDown || k.downArrow.isDown,
      jumpDown: Phaser.Input.Keyboard.JustDown(k.jump) || Phaser.Input.Keyboard.JustDown(k.jumpAlt),
      jumpHeld: k.jump.isDown || k.jumpAlt.isDown,
      fireHeld: k.fire.isDown || k.fireAlt.isDown,
      dashDown: Phaser.Input.Keyboard.JustDown(k.dash),
    }
  }

  update(time: number, delta: number) {
    if (this.physics.world.isPaused) {
      if (time >= this.hitStopUntil) this.physics.world.resume()
      else return
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause()
    }
    if (this.paused) return

    const input = this.buildPlayerInput()
    this.player.update(time, delta, input)
    this.cameraController.update(this.player.facing, this.player.body!.velocity.x)

    if (input.fireHeld) this.weaponSystem.tryFire(time, this.player)

    this.zombies.getChildren().forEach((z) => (z as Zombie).update(time, delta, this.player))

    this.scoreSystem.update(time)

    this.bgFar.tilePositionX = this.cameras.main.scrollX * 0.35
    this.bgMid.tilePositionX = this.cameras.main.scrollX * 0.65
    this.bgSky.tilePositionX = this.cameras.main.scrollX * 0.1

    if (!this.levelComplete && this.player.x > LEVEL_WIDTH - 160) {
      this.levelComplete = true
      EventBus.emit(GameEvents.LEVEL_COMPLETED, { score: this.scoreSystem.score })
      this.scoreSystem.saveIfHighScore()
    }
  }

  private togglePause() {
    this.paused = !this.paused
    this.spawnTimer.paused = this.paused
    this.bruteSpawnTimer.paused = this.paused
    EventBus.emit(GameEvents.GAME_PAUSE_TOGGLED, { paused: this.paused })
  }
}
