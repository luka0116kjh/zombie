import Phaser from 'phaser'
import { Bullet } from '../entities/projectiles/Bullet'
import { WEAPONS, DEFAULT_WEAPON_ID, type WeaponConfig } from '../config/weapons'
import { DEPTH } from '../config/gameConfig'
import { CameraController } from './CameraController'
import { Player } from '../entities/player/Player'
import { EventBus, GameEvents } from '../utils/events'

const POOL_SIZE = 40

/**
 * Data-driven weapon system. Owns the pooled bullet group and turns a
 * WeaponConfig + player facing into an actual shot: bullet(s), muzzle
 * flash, shell casing, recoil and screen shake. Adding a new weapon later
 * means adding a WEAPONS entry, not a bespoke firing code path.
 */
export class WeaponSystem {
  bullets: Phaser.Physics.Arcade.Group
  private scene: Phaser.Scene
  private camera: CameraController
  private weaponId = DEFAULT_WEAPON_ID
  private lastFireTime = -99999
  private muzzleFlash: Phaser.GameObjects.Image
  private ammo: Record<string, number> = {}

  constructor(scene: Phaser.Scene, camera: CameraController) {
    this.scene = scene
    this.camera = camera

    this.bullets = scene.physics.add.group({
      classType: Bullet,
      maxSize: POOL_SIZE,
      runChildUpdate: true,
    })

    this.muzzleFlash = scene.add.image(0, 0, 'muzzle_flash')
    this.muzzleFlash.setVisible(false)
    this.muzzleFlash.setDepth(DEPTH.FX)

    for (const id of Object.keys(WEAPONS)) {
      this.ammo[id] = WEAPONS[id].magazineSize
    }

    EventBus.emit(GameEvents.WEAPON_CHANGED, { id: this.weaponId, name: this.config.name })
    this.emitAmmo()
  }

  get config(): WeaponConfig {
    return WEAPONS[this.weaponId]
  }

  private emitAmmo() {
    EventBus.emit(GameEvents.AMMO_CHANGED, { current: this.ammo[this.weaponId], max: this.config.magazineSize })
  }

  tryFire(time: number, player: Player): boolean {
    if (player.isDead || player.isDashing) return false
    const cfg = this.config
    if (time - this.lastFireTime < cfg.fireRateMs) return false
    if (this.ammo[this.weaponId] <= 0) return false

    this.lastFireTime = time
    if (Number.isFinite(this.ammo[this.weaponId])) {
      this.ammo[this.weaponId] -= 1
      this.emitAmmo()
    }

    const { x, y } = player.getMuzzlePosition()
    const dirX = player.facing

    const spreadRad = Phaser.Math.DegToRad(Phaser.Math.FloatBetween(-cfg.spread, cfg.spread))
    const baseAngle = dirX > 0 ? 0 : Math.PI
    const angle = baseAngle + spreadRad

    const bullet = this.bullets.get(x, y) as Bullet | null
    if (bullet) {
      bullet.fire({
        x,
        y,
        dirX: Math.cos(angle) >= 0 ? 1 : -1,
        speed: cfg.projectileSpeed,
        damage: cfg.damage,
        knockback: cfg.knockback,
        lifeMs: cfg.bulletLifeMs,
        tint: cfg.tint,
        textureKey: 'bullet_pistol',
      })
    }

    player.applyRecoil(cfg.recoil)
    this.playMuzzleFlash(x, y, dirX)
    this.camera.shake(cfg.screenShakeIntensity, cfg.screenShakeDurationMs)
    this.spawnShellCasing(player.x, player.y, dirX)

    return true
  }

  private playMuzzleFlash(x: number, y: number, dirX: 1 | -1) {
    this.muzzleFlash.setPosition(x + dirX * 4, y)
    this.muzzleFlash.setFlipX(dirX < 0)
    this.muzzleFlash.setVisible(true)
    this.muzzleFlash.setAlpha(1)
    this.muzzleFlash.setScale(Phaser.Math.FloatBetween(0.85, 1.1))
    this.scene.tweens.add({
      targets: this.muzzleFlash,
      alpha: 0,
      duration: 55,
      onComplete: () => this.muzzleFlash.setVisible(false),
    })
  }

  private spawnShellCasing(x: number, y: number, dirX: 1 | -1) {
    const casing = this.scene.add.image(x - dirX * 6, y - 18, 'shell_casing')
    casing.setDepth(DEPTH.FX)
    this.scene.tweens.add({
      targets: casing,
      x: casing.x - dirX * Phaser.Math.Between(10, 18),
      y: casing.y + Phaser.Math.Between(14, 22),
      angle: Phaser.Math.Between(-180, 180),
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => casing.destroy(),
    })
  }
}
