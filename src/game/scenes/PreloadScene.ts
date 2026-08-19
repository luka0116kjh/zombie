import Phaser from 'phaser'
import { generatePlaceholderTextures } from '../utils/placeholderTextures'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  create() {
    // No external assets to load yet — see utils/placeholderTextures.ts.
    // Guard anyway so a future real asset load failure never leaves the
    // game silently broken (CLAUDE.md #44).
    try {
      generatePlaceholderTextures(this)
    } catch (err) {
      console.error('[Preload] failed to generate placeholder textures', err)
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Asset load error — see console', {
          color: '#ff5555',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
      return
    }

    this.scene.start('Menu')
  }
}
