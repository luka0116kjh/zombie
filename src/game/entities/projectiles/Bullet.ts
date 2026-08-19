import Phaser from 'phaser'
import { DEPTH } from '../../config/gameConfig'

export interface BulletFireParams {
  x: number
  y: number
  dirX: number
  speed: number
  damage: number
  knockback: number
  lifeMs: number
  tint: number
  textureKey: string
}

/**
 * Pooled player bullet. GameScene owns a Phaser.Physics.Arcade.Group with
 * classType: Bullet and runChildUpdate: true; fire()/deactivate() recycle
 * instances instead of creating/destroying sprites every shot.
 */
export class Bullet extends Phaser.Physics.Arcade.Image {
  damage = 0
  knockback = 0
  private deathTime = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet_pistol')
    this.setDepth(DEPTH.PROJECTILES)
  }

  fire(params: BulletFireParams) {
    this.setTexture(params.textureKey)
    this.setPosition(params.x, params.y)
    this.setActive(true)
    this.setVisible(true)
    this.setTint(params.tint)
    this.setRotation(params.dirX < 0 ? Math.PI : 0)
    this.damage = params.damage
    this.knockback = params.knockback
    this.deathTime = this.scene.time.now + params.lifeMs

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body
      body.enable = true
      body.allowGravity = false
      // Fast bullets can cover more distance in one physics step than a
      // thin visual sprite is wide, letting them tunnel straight through
      // an enemy's hitbox between two discrete steps. Widen the invisible
      // collision body (not the sprite) to at least ~1.3x the per-frame
      // travel distance so it always sweeps through anything in its path.
      const travelPerFrame = params.speed / 60
      const bodyLength = Math.max(10, Math.ceil(travelPerFrame * 1.3))
      body.setSize(bodyLength, 8, true)
      body.setVelocity(params.dirX * params.speed, 0)
    }
  }

  deactivate() {
    this.setActive(false)
    this.setVisible(false)
    if (this.body) (this.body as Phaser.Physics.Arcade.Body).enable = false
  }

  update(time: number) {
    if (!this.active) return
    if (time > this.deathTime) this.deactivate()
  }
}
