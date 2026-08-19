import Phaser from 'phaser'
import { CAMERA } from '../config/balance'

/**
 * Wraps the main camera with arcade-shooter-appropriate follow behavior:
 * a small deadzone, horizontal look-ahead based on player facing/velocity,
 * and a shake helper so weapons/explosions don't reach into camera internals.
 */
export class CameraController {
  private cam: Phaser.Cameras.Scene2D.Camera
  private target: Phaser.GameObjects.Sprite
  private lookaheadX = 0
  private locked = false

  constructor(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite) {
    this.cam = scene.cameras.main
    this.target = target
    this.cam.startFollow(target, true, CAMERA.LERP_X, CAMERA.LERP_Y)
    this.cam.setDeadzone(CAMERA.DEADZONE_W, CAMERA.DEADZONE_H)
    this.cam.setRoundPixels(true)
  }

  setBounds(x: number, y: number, w: number, h: number) {
    this.cam.setBounds(x, y, w, h)
  }

  update(facing: 1 | -1, velocityX: number) {
    if (this.locked) return
    const wantsLookahead = Math.abs(velocityX) > 20
    const targetLookahead = wantsLookahead ? facing * CAMERA.LOOKAHEAD_X : 0
    this.lookaheadX += (targetLookahead - this.lookaheadX) * CAMERA.LOOKAHEAD_LERP
    this.cam.setFollowOffset(-this.lookaheadX, 0)
  }

  shake(intensity: number, durationMs: number) {
    this.cam.shake(durationMs, intensity)
  }

  flash(durationMs: number, r = 255, g = 255, b = 255) {
    this.cam.flash(durationMs, r, g, b, false)
  }

  lockToArena(centerX: number, centerY: number) {
    this.locked = true
    this.cam.stopFollow()
    this.cam.pan(centerX, centerY, 400, 'Sine.easeInOut')
  }

  unlock() {
    this.locked = false
    this.cam.startFollow(this.target, true, CAMERA.LERP_X, CAMERA.LERP_Y)
  }
}
