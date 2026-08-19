import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/gameConfig'
import { PLAYER } from '../config/balance'
import { EventBus, GameEvents } from '../utils/events'

/**
 * HUD + meta overlays (pause / game over / level complete). Runs as a
 * parallel scene over GameScene and talks to it only through EventBus —
 * it never reaches into GameScene internals directly.
 */
export class UIScene extends Phaser.Scene {
  private hpBarFill!: Phaser.GameObjects.Rectangle
  private hpText!: Phaser.GameObjects.Text
  private weaponText!: Phaser.GameObjects.Text
  private ammoText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private comboText!: Phaser.GameObjects.Text

  private overlay?: Phaser.GameObjects.Container
  private pauseOverlay?: Phaser.GameObjects.Container

  private score = 0
  private hp: number = PLAYER.MAX_HP
  private maxHp: number = PLAYER.MAX_HP

  constructor() {
    super({ key: 'UI', active: false })
  }

  create() {
    this.overlay = undefined
    this.pauseOverlay = undefined
    this.score = 0
    this.hp = this.maxHp = PLAYER.MAX_HP

    this.buildHud()
    this.bindEvents()
  }

  private buildHud() {
    const pad = 16

    this.add.rectangle(pad - 4, pad - 4, 204, 26, 0x000000, 0.45).setOrigin(0).setDepth(DEPTH.UI)
    this.add.rectangle(pad, pad, 200, 18, 0x2a0a0a).setOrigin(0).setDepth(DEPTH.UI)
    this.hpBarFill = this.add.rectangle(pad, pad, 200, 18, 0xd23c3c).setOrigin(0).setDepth(DEPTH.UI)
    this.hpText = this.add
      .text(pad + 100, pad + 9, `${this.hp}/${this.maxHp}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI)

    this.weaponText = this.add
      .text(pad, pad + 34, 'PISTOL', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffe28a',
      })
      .setDepth(DEPTH.UI)

    this.ammoText = this.add
      .text(pad, pad + 54, 'AMMO: ∞', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#c9c9c9',
      })
      .setDepth(DEPTH.UI)

    this.scoreText = this.add
      .text(GAME_WIDTH - pad, pad, 'SCORE 0', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(1, 0)
      .setDepth(DEPTH.UI)

    this.comboText = this.add
      .text(GAME_WIDTH - pad, pad + 26, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffb84d',
      })
      .setOrigin(1, 0)
      .setDepth(DEPTH.UI)
  }

  private bindEvents() {
    EventBus.on(GameEvents.PLAYER_HP_CHANGED, this.onHpChanged, this)
    EventBus.on(GameEvents.WEAPON_CHANGED, this.onWeaponChanged, this)
    EventBus.on(GameEvents.AMMO_CHANGED, this.onAmmoChanged, this)
    EventBus.on(GameEvents.SCORE_CHANGED, this.onScoreChanged, this)
    EventBus.on(GameEvents.COMBO_CHANGED, this.onComboChanged, this)
    EventBus.on(GameEvents.PLAYER_DIED, this.onPlayerDied, this)
    EventBus.on(GameEvents.LEVEL_COMPLETED, this.onLevelCompleted, this)
    EventBus.on(GameEvents.GAME_PAUSE_TOGGLED, this.onPauseToggled, this)
    EventBus.on(GameEvents.GAME_RESTART, this.onGameRestart, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.PLAYER_HP_CHANGED, this.onHpChanged, this)
      EventBus.off(GameEvents.WEAPON_CHANGED, this.onWeaponChanged, this)
      EventBus.off(GameEvents.AMMO_CHANGED, this.onAmmoChanged, this)
      EventBus.off(GameEvents.SCORE_CHANGED, this.onScoreChanged, this)
      EventBus.off(GameEvents.COMBO_CHANGED, this.onComboChanged, this)
      EventBus.off(GameEvents.PLAYER_DIED, this.onPlayerDied, this)
      EventBus.off(GameEvents.LEVEL_COMPLETED, this.onLevelCompleted, this)
      EventBus.off(GameEvents.GAME_PAUSE_TOGGLED, this.onPauseToggled, this)
      EventBus.off(GameEvents.GAME_RESTART, this.onGameRestart, this)
    })
  }

  private onGameRestart = () => {
    this.overlay?.destroy()
    this.overlay = undefined
    this.pauseOverlay?.destroy()
    this.pauseOverlay = undefined
    this.hp = this.maxHp = PLAYER.MAX_HP
    this.onHpChanged({ hp: this.hp, maxHp: this.maxHp })
    this.onScoreChanged({ score: 0 })
    this.onComboChanged({ combo: 0 })
  }

  private onHpChanged = (payload: { hp: number; maxHp: number }) => {
    this.hp = payload.hp
    this.maxHp = payload.maxHp
    const ratio = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1)
    this.hpBarFill.width = 200 * ratio
    this.hpBarFill.fillColor = ratio > 0.35 ? 0xd23c3c : 0xff7a1a
    this.hpText.setText(`${Math.max(0, this.hp)}/${this.maxHp}`)
  }

  private onWeaponChanged = (payload: { name: string }) => {
    this.weaponText.setText(payload.name.toUpperCase())
  }

  private onAmmoChanged = (payload: { current: number; max: number }) => {
    const text = Number.isFinite(payload.max) ? `AMMO: ${payload.current}/${payload.max}` : 'AMMO: ∞'
    this.ammoText.setText(text)
  }

  private onScoreChanged = (payload: { score: number }) => {
    this.score = payload.score
    this.scoreText.setText(`SCORE ${this.score}`)
  }

  private onComboChanged = (payload: { combo: number }) => {
    this.comboText.setText(payload.combo > 1 ? `COMBO x${payload.combo}` : '')
  }

  private onPauseToggled = (payload: { paused: boolean }) => {
    if (payload.paused) this.showPauseOverlay()
    else this.hidePauseOverlay()
  }

  private showPauseOverlay() {
    if (this.pauseOverlay) return
    const c = this.add.container(0, 0).setDepth(DEPTH.UI + 10)
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0)
    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'PAUSED', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
    const hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'ESC to resume', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cccccc',
      })
      .setOrigin(0.5)
    c.add([bg, title, hint])
    this.pauseOverlay = c
  }

  private hidePauseOverlay() {
    this.pauseOverlay?.destroy()
    this.pauseOverlay = undefined
  }

  private onPlayerDied = () => {
    this.showEndOverlay('GAME OVER', `SCORE ${this.score}`, '#e63b3b')
  }

  private onLevelCompleted = (payload: { score: number }) => {
    this.showEndOverlay('SECTOR CLEARED', `SCORE ${payload.score}`, '#5fd66c')
  }

  private showEndOverlay(title: string, subtitle: string, color: string) {
    if (this.overlay) return
    const c = this.add.container(0, 0).setDepth(DEPTH.UI + 20)
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0)
    const titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, title, {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '44px',
        color,
      })
      .setOrigin(0.5)
    const scoreLine = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, subtitle, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const retry = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'RETRY', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffe28a',
        backgroundColor: '#00000055',
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const menu = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 84, 'MAIN MENU', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#9fb0c0',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    retry.on('pointerdown', () => EventBus.emit(GameEvents.GAME_RESTART))
    menu.on('pointerdown', () => {
      this.scene.stop('Game')
      this.scene.stop('UI')
      this.scene.start('Menu')
    })

    c.add([bg, titleText, scoreLine, retry, menu])
    this.overlay = c
  }
}
