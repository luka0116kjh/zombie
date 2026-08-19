import Phaser from 'phaser'
import { DEPTH } from '../config/gameConfig'

/**
 * Lightweight particle/impact-feedback helper built on a single pooled
 * emitter manager. Every "hit" in the game should route through here so
 * blood/sparks/dust stay capped and centrally tunable (CLAUDE.md #14/#29).
 */
export class FxSystem {
  private blood: Phaser.GameObjects.Particles.ParticleEmitter
  private sparks: Phaser.GameObjects.Particles.ParticleEmitter
  goreEnabled = true

  constructor(scene: Phaser.Scene) {
    this.blood = scene.add.particles(0, 0, 'particle_square', {
      lifespan: 350,
      speed: { min: 60, max: 220 },
      angle: { min: 200, max: 340 },
      gravityY: 900,
      scale: { start: 1.2, end: 0.4 },
      tint: 0x8f1616,
      quantity: 0,
      emitting: false,
    })
    this.blood.setDepth(DEPTH.FX)

    this.sparks = scene.add.particles(0, 0, 'particle_square', {
      lifespan: 220,
      speed: { min: 80, max: 260 },
      angle: { min: 0, max: 360 },
      gravityY: 500,
      scale: { start: 0.9, end: 0.1 },
      tint: 0xffe28a,
      quantity: 0,
      emitting: false,
    })
    this.sparks.setDepth(DEPTH.FX)
  }

  hitImpact(x: number, y: number) {
    if (this.goreEnabled) this.blood.explode(Phaser.Math.Between(5, 8), x, y)
    else this.sparks.explode(4, x, y)
  }

  deathBurst(x: number, y: number) {
    if (this.goreEnabled) this.blood.explode(Phaser.Math.Between(12, 18), x, y)
    else this.sparks.explode(10, x, y)
  }

  bulletSpark(x: number, y: number) {
    this.sparks.explode(Phaser.Math.Between(2, 4), x, y)
  }

  setGoreEnabled(enabled: boolean) {
    this.goreEnabled = enabled
  }
}
