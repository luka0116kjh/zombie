import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig'
import { ScoreSystem } from '../systems/ScoreSystem'

const GORE_KEY = 'deadline_outbreak_gore'

export function loadGorePreference(): boolean {
  try {
    return localStorage.getItem(GORE_KEY) !== 'reduced'
  } catch {
    return true
  }
}

function saveGorePreference(enabled: boolean) {
  try {
    localStorage.setItem(GORE_KEY, enabled ? 'full' : 'reduced')
  } catch {
    console.warn('[Menu] could not persist gore preference')
  }
}

export class MenuScene extends Phaser.Scene {
  private helpVisible = false

  constructor() {
    super('Menu')
  }

  create() {
    const cx = GAME_WIDTH / 2

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a0a0d).setOrigin(0)
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_far').setOrigin(0).setAlpha(0.6)
    this.add.rectangle(0, GAME_HEIGHT - 90, GAME_WIDTH, 90, 0x000000, 0.35).setOrigin(0)

    this.add
      .text(cx, 150, 'DEADLINE: OUTBREAK', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '56px',
        color: '#e63b3b',
        stroke: '#1a0505',
        strokeThickness: 8,
      })
      .setOrigin(0.5)

    this.add
      .text(cx, 200, 'a survivor. a dying city. one route out.', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#c9b8b8',
      })
      .setOrigin(0.5)

    const startText = this.add
      .text(cx, 320, 'PRESS SPACE / CLICK TO START', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffe28a',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    this.tweens.add({
      targets: startText,
      alpha: 0.4,
      duration: 650,
      yoyo: true,
      repeat: -1,
    })

    const best = ScoreSystem.getHighScore()
    this.add
      .text(cx, 360, `BEST SCORE: ${best}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5)

    const helpText = this.add
      .text(
        cx,
        430,
        'A/D move   SPACE jump   J fire   SHIFT dash   S crouch\n(arrow keys / Z / X also work)',
        {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#9fb0c0',
          align: 'center',
        }
      )
      .setOrigin(0.5)
      .setAlpha(0)

    let goreEnabled = loadGorePreference()
    const goreText = this.add
      .text(cx, 480, `GORE: ${goreEnabled ? 'ON' : 'REDUCED'}  (click to toggle)`, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#9fb0c0',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    goreText.on('pointerdown', () => {
      goreEnabled = !goreEnabled
      saveGorePreference(goreEnabled)
      goreText.setText(`GORE: ${goreEnabled ? 'ON' : 'REDUCED'}  (click to toggle)`)
    })

    const howToPlay = this.add
      .text(cx, 500 + 30, 'HOW TO PLAY', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#666666',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    howToPlay.on('pointerdown', () => {
      this.helpVisible = !this.helpVisible
      helpText.setAlpha(this.helpVisible ? 1 : 0)
    })

    const start = () => {
      this.scene.start('Game')
      this.scene.launch('UI')
    }
    startText.on('pointerdown', start)
    this.input.keyboard?.once('keydown-SPACE', start)
    this.input.keyboard?.once('keydown-ENTER', start)
  }
}
