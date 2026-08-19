// Centralized tuning constants. Nothing gameplay-affecting should be a
// magic number scattered inside entity/system code — it belongs here so
// balance passes touch one file.

export const PLAYER = {
  MAX_HP: 100,

  // Horizontal movement
  MOVE_SPEED: 210,
  CROUCH_SPEED_MULT: 0.45,
  GROUND_ACCEL: 2600,
  GROUND_DECEL: 3400,
  AIR_ACCEL: 1500,
  AIR_DECEL: 900,

  // Vertical movement
  GRAVITY: 1500,
  MAX_FALL_SPEED: 920,
  JUMP_VELOCITY: 540,
  JUMP_CUT_MULTIPLIER: 0.42, // releasing jump early trims upward velocity
  COYOTE_TIME_MS: 100,
  JUMP_BUFFER_MS: 140,

  // Dash / dodge
  DASH_SPEED: 640,
  DASH_DURATION_MS: 160,
  DASH_COOLDOWN_MS: 1000,
  DASH_IFRAME_MS: 150,

  // Combat
  HURT_INVULN_MS: 900,
  HURT_KNOCKBACK_X: 200,
  HURT_KNOCKBACK_Y: -160,
  FIRE_BUFFER_MS: 90,

  BODY_WIDTH: 20,
  BODY_HEIGHT: 40,
  CROUCH_BODY_HEIGHT: 26,
} as const

export const WALKER = {
  HP: 30,
  MOVE_SPEED: 48,
  DAMAGE: 10,
  ATTACK_RANGE: 30,
  ATTACK_COOLDOWN_MS: 950,
  ATTACK_WINDUP_MS: 300,
  DETECT_RANGE: 360,
  LOSE_INTEREST_RANGE: 560,
  SCORE: 100,
  KNOCKBACK: 110,
  STAGGER_MS: 180,
} as const

export const RUNNER = {
  HP: 18,
  MOVE_SPEED: 150,
  DAMAGE: 8,
  ATTACK_RANGE: 26,
  ATTACK_COOLDOWN_MS: 650,
  ATTACK_WINDUP_MS: 160,
  DETECT_RANGE: 420,
  LOSE_INTEREST_RANGE: 620,
  SCORE: 150,
  KNOCKBACK: 90,
  STAGGER_MS: 120,
} as const

// Heavy infected — reuses the generic Zombie AI (no charge/ground-slam
// yet, see CLAUDE.md #12) but hits much harder and soaks far more
// damage than a Walker/Runner. Deliberately tougher than anything else
// in this vertical slice since there's no real boss encounter yet.
export const BRUTE = {
  HP: 140,
  MOVE_SPEED: 34,
  DAMAGE: 22,
  ATTACK_RANGE: 42,
  ATTACK_COOLDOWN_MS: 1300,
  ATTACK_WINDUP_MS: 480, // slow, heavily telegraphed swing — stays fair even though it hits hard
  DETECT_RANGE: 420,
  LOSE_INTEREST_RANGE: 720,
  SCORE: 800,
  KNOCKBACK: 60,
  STAGGER_MS: 90, // resists stagger compared to Walker/Runner
} as const

export const COMBO = {
  TIMEOUT_MS: 2500,
} as const

export const RANDOM_SPAWN = {
  INTERVAL_MS: 5000,
  COUNT_PER_WAVE: 3,
  MAX_ACTIVE_ZOMBIES: 24, // hard cap so an endless timer can't snowball into a performance problem
  MIN_DISTANCE_FROM_PLAYER: 520, // off-screen (half viewport + margin) — never spawn on top of the player (CLAUDE.md #56)
  MAX_DISTANCE_FROM_PLAYER: 900,
  RUNNER_CHANCE: 0.3,
} as const

export const BRUTE_SPAWN = {
  INITIAL_COUNT: 5,
  INTERVAL_MS: 5000,
  COUNT_PER_WAVE: 5,
  MAX_ACTIVE_BRUTES: 20, // cap kept generous but bounded — still a hard fight, never a physics/perf meltdown
  MIN_DISTANCE_FROM_PLAYER: 560,
  MAX_DISTANCE_FROM_PLAYER: 1100,
} as const

export const CAMERA = {
  LERP_X: 0.09,
  LERP_Y: 0.12,
  LOOKAHEAD_X: 90,
  LOOKAHEAD_LERP: 0.06,
  DEADZONE_W: 60,
  DEADZONE_H: 40,
} as const

export const HITSTOP_MS = {
  PISTOL_HIT: 10,
  KILL: 35,
} as const
