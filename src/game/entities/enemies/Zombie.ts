import Phaser from 'phaser'
import type { EnemyConfig } from '../../config/enemies'
import { EnemyState } from './EnemyState'
import { DEPTH } from '../../config/gameConfig'
import { Player } from '../player/Player'
import { AttackSlotManager } from '../../systems/AttackSlotManager'
import { EventBus, GameEvents } from '../../utils/events'

let nextZombieId = 1

/**
 * Generic zombie driven entirely by an EnemyConfig (see config/enemies.ts).
 * Walker vs Runner is a data difference, not a class hierarchy — new
 * infected types are added as config entries first, and only need a real
 * subclass once their behavior genuinely diverges (Spitter's projectile,
 * Exploder's death nova, etc.).
 */
export class Zombie extends Phaser.Physics.Arcade.Sprite {
  readonly zombieId = nextZombieId++
  cfg: EnemyConfig
  state: EnemyState = EnemyState.IDLE
  hp: number
  isDead = false

  private attackSlots: AttackSlotManager
  private nextAttackReadyAt = 0
  private attackWindupUntil = 0
  private staggerUntil = 0
  private hasSlot = false
  private patrolDirX: 1 | -1 = 1
  private patrolTimer = 0
  private hitFlashUntil = 0

  constructor(scene: Phaser.Scene, x: number, y: number, cfg: EnemyConfig, attackSlots: AttackSlotManager) {
    super(scene, x, y, cfg.textureKey)
    this.cfg = cfg
    this.hp = cfg.hp
    this.attackSlots = attackSlots

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setDepth(DEPTH.ENEMIES)
    this.setCollideWorldBounds(true)
    this.setBodySize(cfg.bodyWidth, cfg.bodyHeight)
    this.setOffset((this.width - cfg.bodyWidth) / 2, this.height - cfg.bodyHeight)
    this.setGravityY(1500)
    this.patrolDirX = Math.random() < 0.5 ? -1 : 1
  }

  takeDamage(amount: number, sourceX: number, knockback: number) {
    if (this.isDead) return
    this.hp -= amount
    this.hitFlashUntil = this.scene.time.now + 80
    this.setTint(0xffffff)

    const away = this.x >= sourceX ? 1 : -1
    this.setVelocityX(away * knockback)

    if (this.hp <= 0) {
      this.die()
      return
    }

    this.state = EnemyState.STAGGER
    this.staggerUntil = this.scene.time.now + this.cfg.staggerMs
    this.releaseSlot()
  }

  private releaseSlot() {
    if (this.hasSlot) {
      this.attackSlots.release(this.zombieId)
      this.hasSlot = false
    }
  }

  private die() {
    this.isDead = true
    this.state = EnemyState.DEAD
    this.releaseSlot()
    ;(this.body as Phaser.Physics.Arcade.Body).enable = false

    EventBus.emit(GameEvents.ENEMY_KILLED, { x: this.x, y: this.y, score: this.cfg.score, type: this.cfg.id })

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: Phaser.Math.Between(-70, 70) * (Math.random() < 0.5 ? 1 : -1),
      y: this.y - 6,
      duration: 260,
      ease: 'Quad.easeIn',
      onComplete: () => this.destroy(),
    })
  }

  update(time: number, delta: number, player: Player) {
    if (this.isDead) return

    if (this.hitFlashUntil && time > this.hitFlashUntil) {
      this.clearTint()
      this.hitFlashUntil = 0
    }

    if (this.state === EnemyState.STAGGER) {
      if (time > this.staggerUntil) this.state = EnemyState.CHASE
      this.setFlipX(player.x < this.x)
      return
    }

    const dist = Math.abs(player.x - this.x)
    const sameLevel = Math.abs(player.y - this.y) < 60

    if (this.state === EnemyState.IDLE || this.state === EnemyState.PATROL) {
      this.patrol(delta)
      if (!player.isDead && sameLevel && dist < this.cfg.detectRange) {
        this.state = EnemyState.CHASE
      }
      return
    }

    if (this.state === EnemyState.CHASE) {
      this.setFlipX(player.x < this.x)

      if (player.isDead || dist > this.cfg.loseInterestRange) {
        this.releaseSlot()
        this.state = EnemyState.IDLE
        return
      }

      if (dist <= this.cfg.attackRange && time >= this.nextAttackReadyAt) {
        if (this.attackSlots.request(this.zombieId)) {
          this.hasSlot = true
          this.setVelocityX(0)
          this.state = EnemyState.ATTACK
          this.attackWindupUntil = time + this.cfg.attackWindupMs
          return
        }
      }

      // Approach, but hold slightly outside range if denied an attack
      // slot so the crowd doesn't stack on the player.
      const holdDistance = this.hasSlot ? this.cfg.attackRange * 0.6 : this.cfg.attackRange * 1.15
      if (dist > holdDistance) {
        const dir = player.x > this.x ? 1 : -1
        this.setVelocityX(dir * this.cfg.moveSpeed)
      } else {
        this.setVelocityX(0)
      }
      return
    }

    if (this.state === EnemyState.ATTACK) {
      this.setVelocityX(0)
      // Telegraph: grow slightly during windup so the attack is readable
      // before it lands.
      const windupProgress = 1 - Math.max(0, this.attackWindupUntil - time) / this.cfg.attackWindupMs
      const pulse = 1 + 0.18 * Math.min(1, windupProgress)
      this.setScale(this.flipX ? -pulse : pulse, pulse)

      if (time >= this.attackWindupUntil) {
        this.setScale(this.flipX ? -1 : 1, 1)
        const dist2 = Math.abs(player.x - this.x)
        if (dist2 <= this.cfg.attackRange * 1.3 && !player.isDead) {
          player.takeDamage(this.cfg.damage, this.x)
        }
        this.nextAttackReadyAt = time + this.cfg.attackCooldownMs
        this.releaseSlot()
        this.state = EnemyState.CHASE
      }
      return
    }
  }

  private patrol(delta: number) {
    this.patrolTimer -= delta
    if (this.patrolTimer <= 0) {
      this.patrolDirX = Math.random() < 0.5 ? -1 : 1
      this.patrolTimer = Phaser.Math.Between(800, 2200)
    }
    this.setVelocityX(this.patrolDirX * this.cfg.moveSpeed * 0.35)
    this.setFlipX(this.patrolDirX < 0)
  }

}
