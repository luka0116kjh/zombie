import Phaser from 'phaser'
import { PLAYER } from '../../config/balance'
import { DEPTH } from '../../config/gameConfig'
import { PlayerState } from './PlayerState'
import { EventBus, GameEvents } from '../../utils/events'

export interface PlayerInput {
  left: boolean
  right: boolean
  up: boolean // aim up / contextual
  down: boolean // crouch
  jumpDown: boolean // just pressed this frame
  jumpHeld: boolean
  fireHeld: boolean
  dashDown: boolean // just pressed this frame
}

/**
 * Player controller + state machine. Owns movement feel (acceleration,
 * coyote time, jump buffering, dash) and combat state (hp, i-frames,
 * knockback). Weapon firing itself lives in WeaponSystem — this class
 * only exposes where a muzzle flash / bullet should spawn from.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  state: PlayerState = PlayerState.IDLE
  facing: 1 | -1 = 1
  hp: number = PLAYER.MAX_HP
  maxHp: number = PLAYER.MAX_HP
  isDead = false

  private invulnUntil = 0
  private coyoteUntil = 0
  private jumpBufferUntil = 0
  private wasOnGround = false

  private dashTimer = 0 // counts down while dashing
  private dashCooldownRemaining = 0
  private dashDirX = 1

  private hurtLockUntil = 0
  private recoilOffset = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setDepth(DEPTH.PLAYER)
    this.setCollideWorldBounds(true)
    this.setDragX(0)
    this.setMaxVelocity(9999, PLAYER.MAX_FALL_SPEED)
    this.setGravityY(PLAYER.GRAVITY)
    this.setBodySize(PLAYER.BODY_WIDTH, PLAYER.BODY_HEIGHT)
    this.setOffset((this.width - PLAYER.BODY_WIDTH) / 2, this.height - PLAYER.BODY_HEIGHT)
  }

  get isInvulnerable(): boolean {
    return this.scene.time.now < this.invulnUntil
  }

  get isDashing(): boolean {
    return this.dashTimer > 0
  }

  /** World-space muzzle point, following facing + crouch. */
  getMuzzlePosition(): { x: number; y: number } {
    // Chest height, not head height — must land inside enemy hitboxes,
    // which exclude a small "head" margin at the very top of their sprite.
    const crouch = this.state === PlayerState.CROUCH
    const forwardOffset = 15 * this.facing
    const yOff = crouch ? -2 : -6
    return { x: this.x + forwardOffset, y: this.y + yOff }
  }

  applyRecoil(px: number) {
    this.recoilOffset = px
  }

  takeDamage(amount: number, sourceX: number) {
    if (this.isDead || this.isInvulnerable || this.isDashing) return

    this.hp = Math.max(0, this.hp - amount)
    this.invulnUntil = this.scene.time.now + PLAYER.HURT_INVULN_MS
    this.hurtLockUntil = this.scene.time.now + 220
    this.state = PlayerState.HURT

    const away = this.x >= sourceX ? 1 : -1
    this.setVelocityX(away * PLAYER.HURT_KNOCKBACK_X)
    this.setVelocityY(PLAYER.HURT_KNOCKBACK_Y)

    this.scene.cameras.main.flash(80, 120, 0, 0, false)
    EventBus.emit(GameEvents.PLAYER_HP_CHANGED, { hp: this.hp, maxHp: this.maxHp })
    EventBus.emit(GameEvents.PLAYER_DAMAGED, { amount })

    if (this.hp <= 0) this.die()
  }

  private die() {
    if (this.isDead) return
    this.isDead = true
    this.state = PlayerState.DEAD
    this.setTint(0x777777)
    this.setVelocity(0, -180)
    this.setAngularVelocity(0)
    EventBus.emit(GameEvents.PLAYER_DIED)
  }

  update(time: number, delta: number, input: PlayerInput) {
    if (this.isDead) {
      return
    }

    const onGround = this.body!.blocked.down || this.body!.touching.down

    if (onGround && !this.wasOnGround) {
      // landed
    }
    if (onGround) this.coyoteUntil = time + PLAYER.COYOTE_TIME_MS
    this.wasOnGround = onGround

    if (input.jumpDown) this.jumpBufferUntil = time + PLAYER.JUMP_BUFFER_MS

    const inHurtLock = time < this.hurtLockUntil

    // --- Dash trigger ---
    if (input.dashDown && this.dashCooldownRemaining <= 0 && !this.isDashing && !inHurtLock) {
      this.dashTimer = PLAYER.DASH_DURATION_MS
      this.dashCooldownRemaining = PLAYER.DASH_COOLDOWN_MS
      this.dashDirX = input.left ? -1 : input.right ? 1 : this.facing
      this.invulnUntil = Math.max(this.invulnUntil, time + PLAYER.DASH_IFRAME_MS)
    }
    if (this.dashCooldownRemaining > 0) this.dashCooldownRemaining -= delta

    if (this.isDashing) {
      this.dashTimer -= delta
      this.setVelocityX(this.dashDirX * PLAYER.DASH_SPEED)
      this.setVelocityY(0)
      this.state = PlayerState.DASH
    } else if (!inHurtLock) {
      this.handleHorizontalMovement(delta, input, onGround)
      this.handleJump(time, input, onGround)
      this.handleCrouch(input, onGround)
    }

    // Body size follows crouch state
    const crouching = this.state === PlayerState.CROUCH
    const targetH = crouching ? PLAYER.CROUCH_BODY_HEIGHT : PLAYER.BODY_HEIGHT
    if (this.body!.height !== targetH) {
      this.setBodySize(PLAYER.BODY_WIDTH, targetH)
      this.setOffset((this.width - PLAYER.BODY_WIDTH) / 2, this.height - targetH)
    }

    // Facing
    if (input.left && !input.right) this.facing = -1
    else if (input.right && !input.left) this.facing = 1
    this.setFlipX(this.facing === -1)

    this.updateStateAndVisuals(onGround, crouching)
  }

  private handleHorizontalMovement(delta: number, input: PlayerInput, onGround: boolean) {
    const crouching = input.down && onGround
    const speed = PLAYER.MOVE_SPEED * (crouching ? PLAYER.CROUCH_SPEED_MULT : 1)
    const accel = onGround ? PLAYER.GROUND_ACCEL : PLAYER.AIR_ACCEL
    const decel = onGround ? PLAYER.GROUND_DECEL : PLAYER.AIR_DECEL
    const dt = delta / 1000

    let targetVX = 0
    if (input.left && !crouching) targetVX = -speed
    else if (input.right && !crouching) targetVX = speed
    else if (crouching) targetVX = 0

    const vx = this.body!.velocity.x
    if (targetVX !== 0) {
      const dir = Math.sign(targetVX)
      const newVX = vx + dir * accel * dt
      this.setVelocityX(dir > 0 ? Math.min(newVX, targetVX) : Math.max(newVX, targetVX))
    } else {
      if (vx > 0) this.setVelocityX(Math.max(0, vx - decel * dt))
      else if (vx < 0) this.setVelocityX(Math.min(0, vx + decel * dt))
    }
  }

  private handleJump(time: number, input: PlayerInput, onGround: boolean) {
    const canCoyoteJump = time < this.coyoteUntil
    const hasBufferedJump = time < this.jumpBufferUntil

    if (hasBufferedJump && (onGround || canCoyoteJump)) {
      this.setVelocityY(-PLAYER.JUMP_VELOCITY)
      this.jumpBufferUntil = 0
      this.coyoteUntil = 0
    } else if (!input.jumpHeld && this.body!.velocity.y < 0) {
      // Variable jump height: cut upward velocity if the button is released early.
      this.setVelocityY(this.body!.velocity.y * PLAYER.JUMP_CUT_MULTIPLIER)
    }
  }

  private handleCrouch(input: PlayerInput, onGround: boolean) {
    if (input.down && onGround) {
      this.state = PlayerState.CROUCH
    }
  }

  private updateStateAndVisuals(onGround: boolean, crouching: boolean) {
    if (this.isDashing) {
      this.state = PlayerState.DASH
    } else if (this.scene.time.now < this.hurtLockUntil) {
      this.state = PlayerState.HURT
    } else if (!onGround) {
      this.state = this.body!.velocity.y < 0 ? PlayerState.JUMP : PlayerState.FALL
    } else if (crouching) {
      this.state = PlayerState.CROUCH
    } else if (Math.abs(this.body!.velocity.x) > 8) {
      this.state = PlayerState.RUN
    } else {
      this.state = PlayerState.IDLE
    }

    // Swap silhouette for crouch, apply squash/stretch + recoil "juice"
    // since we have no real frame animation for placeholder art yet.
    const wantsCrouchTexture = this.state === PlayerState.CROUCH
    const key = wantsCrouchTexture ? 'player_crouch' : 'player'
    if (this.texture.key !== key) this.setTexture(key)

    // Flash white briefly while invulnerable after being hit
    if (this.isInvulnerable && this.state === PlayerState.HURT) {
      const blink = Math.floor(this.scene.time.now / 60) % 2 === 0
      this.setAlpha(blink ? 1 : 0.35)
    } else {
      this.setAlpha(this.isInvulnerable ? 0.6 : 1)
    }

    let scaleX = 1
    let scaleY = 1
    if (this.state === PlayerState.JUMP) scaleY = 1.06
    if (this.state === PlayerState.FALL) scaleY = 0.96
    if (this.state === PlayerState.DASH) {
      scaleX = 1.2
      scaleY = 0.85
    }
    this.setScale(this.flipX ? -scaleX : scaleX, scaleY)

    // Decay recoil offset visually
    if (this.recoilOffset !== 0) {
      this.recoilOffset *= 0.8
      if (Math.abs(this.recoilOffset) < 0.05) this.recoilOffset = 0
    }
  }

  respawn(x: number, y: number) {
    this.isDead = false
    this.hp = this.maxHp
    this.setPosition(x, y)
    this.setVelocity(0, 0)
    this.clearTint()
    this.setAlpha(1)
    this.state = PlayerState.IDLE
    this.invulnUntil = 0
    this.hurtLockUntil = 0
    EventBus.emit(GameEvents.PLAYER_HP_CHANGED, { hp: this.hp, maxHp: this.maxHp })
  }
}
