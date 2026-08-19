// Internal design resolution. Chosen larger than the classic 320x180 /
// 480x270 pixel-art targets so HUD text stays crisp without a second
// render pass, while still scaling cleanly to 1920x1080 / 1366x768 / 1280x720.
export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540

export const DEPTH = {
  BG_SKY: -50,
  BG_FAR: -40,
  BG_MID: -30,
  BG_NEAR: -20,
  PROPS_BACK: -5,
  GROUND: 0,
  PICKUPS: 5,
  ENEMIES: 10,
  PLAYER: 15,
  PROJECTILES: 18,
  FX: 25,
  PROPS_FRONT: 30,
  UI: 100,
} as const

export const PHYSICS_GROUPS = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  PLAYER_BULLET: 'playerBullet',
  ENEMY_PROJECTILE: 'enemyProjectile',
  PLATFORM: 'platform',
  DESTRUCTIBLE: 'destructible',
  PICKUP: 'pickup',
  HAZARD: 'hazard',
} as const
