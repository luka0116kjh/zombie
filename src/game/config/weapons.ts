export interface WeaponConfig {
  id: string
  name: string
  damage: number
  fireRateMs: number
  projectileSpeed: number
  magazineSize: number // Infinity = no reload needed
  spread: number // degrees, +/- half-angle
  recoil: number // px, visual kickback of the player sprite
  knockback: number // px/s applied to whatever the bullet hits
  screenShakeIntensity: number
  screenShakeDurationMs: number
  bulletLifeMs: number
  tint: number
}

// Data-driven weapon table. Milestone 1 ships the pistol only; later
// milestones add entries here rather than bespoke per-weapon systems.
export const WEAPONS: Record<string, WeaponConfig> = {
  pistol: {
    id: 'pistol',
    name: 'Pistol',
    damage: 12,
    fireRateMs: 240,
    projectileSpeed: 920,
    magazineSize: Infinity,
    spread: 1.2,
    recoil: 5,
    knockback: 70,
    screenShakeIntensity: 0.0015,
    screenShakeDurationMs: 40,
    bulletLifeMs: 900,
    tint: 0xfff3b0,
  },
}

export const DEFAULT_WEAPON_ID = 'pistol'
