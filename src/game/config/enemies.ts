import { WALKER, RUNNER, BRUTE } from './balance'

export interface EnemyConfig {
  id: string
  textureKey: string
  hp: number
  moveSpeed: number
  damage: number
  attackRange: number
  attackCooldownMs: number
  attackWindupMs: number
  detectRange: number
  loseInterestRange: number
  score: number
  knockback: number
  staggerMs: number
  bodyWidth: number
  bodyHeight: number
}

// Data-driven enemy table, same shape/spirit as WEAPONS — new zombie
// types are added here, not as bespoke duplicated classes.
export const ENEMIES: Record<string, EnemyConfig> = {
  walker: {
    id: 'walker',
    textureKey: 'walker',
    hp: WALKER.HP,
    moveSpeed: WALKER.MOVE_SPEED,
    damage: WALKER.DAMAGE,
    attackRange: WALKER.ATTACK_RANGE,
    attackCooldownMs: WALKER.ATTACK_COOLDOWN_MS,
    attackWindupMs: WALKER.ATTACK_WINDUP_MS,
    detectRange: WALKER.DETECT_RANGE,
    loseInterestRange: WALKER.LOSE_INTEREST_RANGE,
    score: WALKER.SCORE,
    knockback: WALKER.KNOCKBACK,
    staggerMs: WALKER.STAGGER_MS,
    bodyWidth: 18,
    bodyHeight: 34,
  },
  runner: {
    id: 'runner',
    textureKey: 'runner',
    hp: RUNNER.HP,
    moveSpeed: RUNNER.MOVE_SPEED,
    damage: RUNNER.DAMAGE,
    attackRange: RUNNER.ATTACK_RANGE,
    attackCooldownMs: RUNNER.ATTACK_COOLDOWN_MS,
    attackWindupMs: RUNNER.ATTACK_WINDUP_MS,
    detectRange: RUNNER.DETECT_RANGE,
    loseInterestRange: RUNNER.LOSE_INTEREST_RANGE,
    score: RUNNER.SCORE,
    knockback: RUNNER.KNOCKBACK,
    staggerMs: RUNNER.STAGGER_MS,
    bodyWidth: 16,
    bodyHeight: 32,
  },
  brute: {
    id: 'brute',
    textureKey: 'brute',
    hp: BRUTE.HP,
    moveSpeed: BRUTE.MOVE_SPEED,
    damage: BRUTE.DAMAGE,
    attackRange: BRUTE.ATTACK_RANGE,
    attackCooldownMs: BRUTE.ATTACK_COOLDOWN_MS,
    attackWindupMs: BRUTE.ATTACK_WINDUP_MS,
    detectRange: BRUTE.DETECT_RANGE,
    loseInterestRange: BRUTE.LOSE_INTEREST_RANGE,
    score: BRUTE.SCORE,
    knockback: BRUTE.KNOCKBACK,
    staggerMs: BRUTE.STAGGER_MS,
    bodyWidth: 30,
    bodyHeight: 52,
  },
}
