import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from './game/config/gameConfig'
import { BootScene } from './game/scenes/BootScene'
import { PreloadScene } from './game/scenes/PreloadScene'
import { MenuScene } from './game/scenes/MenuScene'
import { GameScene } from './game/scenes/GameScene'
import { UIScene } from './game/scenes/UIScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a0d',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene],
}

try {
  new Phaser.Game(config)
} catch (err) {
  console.error('[Boot] failed to start Phaser game', err)
  const el = document.getElementById('app')
  if (el) el.innerHTML = '<p style="color:#ff5555;font-family:monospace;padding:24px">Failed to start — see console.</p>'
}
