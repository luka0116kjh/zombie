import Phaser from 'phaser'
import { GAME_HEIGHT } from '../config/gameConfig'

// PLACEHOLDER ART.
// No external sprite assets exist yet. Every texture the game references
// is generated procedurally here so nothing ever renders as a missing
// texture. Replace with real pixel-art spritesheets later — entities only
// know texture *keys*, so swapping art later needs no gameplay changes.

function circle(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number, alpha = 1) {
  g.fillStyle(color, alpha)
  g.fillCircle(x, y, r)
}

export function generatePlaceholderTextures(scene: Phaser.Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false)

  // ---- Player survivor silhouette (28x44) ----
  g.clear()
  g.fillStyle(0x2b5f8a, 1) // jacket
  g.fillRoundedRect(6, 14, 16, 22, 3)
  g.fillStyle(0xe0b48c, 1) // head
  g.fillCircle(14, 9, 7)
  g.fillStyle(0x21374d, 1) // legs
  g.fillRect(7, 34, 6, 10)
  g.fillRect(15, 34, 6, 10)
  g.fillStyle(0x1a2c3d, 1) // gun arm
  g.fillRect(18, 18, 12, 5)
  g.generateTexture('player', 30, 44)

  // Crouched variant (shorter)
  g.clear()
  g.fillStyle(0x2b5f8a, 1)
  g.fillRoundedRect(6, 8, 16, 16, 3)
  g.fillStyle(0xe0b48c, 1)
  g.fillCircle(14, 6, 6)
  g.fillStyle(0x21374d, 1)
  g.fillRect(6, 22, 8, 6)
  g.fillRect(16, 22, 8, 6)
  g.fillStyle(0x1a2c3d, 1)
  g.fillRect(18, 12, 12, 5)
  g.generateTexture('player_crouch', 30, 28)

  // ---- Walker zombie (sickly green, hunched) ----
  g.clear()
  g.fillStyle(0x3d6b34, 1)
  g.fillRoundedRect(5, 12, 18, 24, 3)
  g.fillStyle(0x6f9a52, 1)
  g.fillCircle(14, 8, 7)
  g.fillStyle(0x24421f, 1)
  g.fillRect(6, 34, 6, 9)
  g.fillRect(16, 34, 6, 9)
  g.fillStyle(0x1c3418, 1)
  circle(g, 11, 7, 1.6, 0x0d1a0a)
  circle(g, 17, 7, 1.6, 0x0d1a0a)
  g.generateTexture('walker', 28, 43)

  // ---- Runner zombie (leaner, red-orange, forward-leaning) ----
  g.clear()
  g.fillStyle(0x8a3a1e, 1)
  g.fillRoundedRect(5, 12, 16, 22, 3)
  g.fillStyle(0xb85f3a, 1)
  g.fillCircle(15, 8, 6)
  g.fillStyle(0x5c2610, 1)
  g.fillRect(6, 32, 5, 9)
  g.fillRect(15, 32, 5, 9)
  circle(g, 12, 7, 1.4, 0x1a0a05)
  circle(g, 17, 7, 1.4, 0x1a0a05)
  g.generateTexture('runner', 26, 41)

  // ---- Brute (heavy infected — bulky, dark, menacing silhouette) ----
  g.clear()
  g.fillStyle(0x1c0f10, 1) // dark mass, reads as heavier than Walker/Runner
  g.fillRoundedRect(2, 16, 34, 34, 4)
  g.fillStyle(0x4a1414, 1) // exposed muscle/wound tone
  g.fillRoundedRect(6, 20, 26, 22, 3)
  g.fillStyle(0x6b6258, 1) // pale scarred head
  g.fillCircle(19, 12, 10)
  g.fillStyle(0x1c0f10, 1)
  g.fillRect(4, 48, 10, 14) // legs, wide stance
  g.fillRect(24, 48, 10, 14)
  g.fillStyle(0x2a1a1a, 1) // heavy arms
  g.fillRect(-2, 22, 10, 26)
  g.fillRect(30, 22, 10, 26)
  circle(g, 14, 11, 2, 0xd93b3b) // glowing red eyes — reads as dangerous at a glance
  circle(g, 24, 11, 2, 0xd93b3b)
  g.generateTexture('brute', 40, 62)

  // ---- Bullet ----
  g.clear()
  g.fillStyle(0xfff3b0, 1)
  g.fillRoundedRect(0, 0, 8, 3, 1.5)
  g.generateTexture('bullet_pistol', 8, 3)

  // ---- Muzzle flash ----
  g.clear()
  g.fillStyle(0xfff6cf, 1)
  g.fillTriangle(0, 6, 16, 0, 16, 12)
  circle(g, 3, 6, 5, 0xffd257, 0.85)
  g.generateTexture('muzzle_flash', 18, 12)

  // ---- Shell casing ----
  g.clear()
  g.fillStyle(0xc9a227, 1)
  g.fillRect(0, 0, 3, 5)
  g.generateTexture('shell_casing', 3, 5)

  // ---- Generic small particle (tinted at spawn) ----
  g.clear()
  g.fillStyle(0xffffff, 1)
  g.fillRect(0, 0, 4, 4)
  g.generateTexture('particle_square', 4, 4)

  // ---- Ground / platform tile (64x32) ----
  g.clear()
  g.fillStyle(0x2a2a30, 1)
  g.fillRect(0, 0, 64, 32)
  g.fillStyle(0x3a3a42, 1)
  g.fillRect(0, 0, 64, 5)
  g.fillStyle(0x1c1c20, 0.5)
  for (let i = 0; i < 4; i++) g.fillRect(i * 16 + 2, 8, 10, 2)
  g.generateTexture('ground_tile', 64, 32)

  // ---- Background parallax layers (tileable strips) ----
  g.clear()
  g.fillGradientStyle(0x1a1030, 0x1a1030, 0x3a2a55, 0x3a2a55, 1)
  g.fillRect(0, 0, 64, GAME_HEIGHT)
  g.generateTexture('bg_sky', 64, GAME_HEIGHT)

  g.clear()
  g.fillStyle(0x241c38, 1)
  for (let i = 0; i < 3; i++) {
    const bw = 40 + (i % 2) * 20
    g.fillRect(i * 70, GAME_HEIGHT - (120 + (i % 3) * 40), bw, 400)
  }
  g.generateTexture('bg_far', 210, GAME_HEIGHT)

  g.clear()
  g.fillStyle(0x2f2340, 1)
  for (let i = 0; i < 3; i++) {
    const bw = 60 + (i % 2) * 30
    g.fillRect(i * 90, GAME_HEIGHT - (170 + (i % 2) * 60), bw, 400)
    g.fillStyle(0x3a2a50, 1)
    for (let w = 0; w < 6; w++) {
      g.fillRect(i * 90 + 6 + w * 9, GAME_HEIGHT - (160 + (i % 2) * 60), 4, 6)
    }
    g.fillStyle(0x2f2340, 1)
  }
  g.generateTexture('bg_mid', 270, GAME_HEIGHT)

  g.destroy()
}
