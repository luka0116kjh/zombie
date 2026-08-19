// See PlayerState.ts for why this is a string-union object instead of a
// TS `enum` (erasableSyntaxOnly).
export const EnemyState = {
  SPAWN: 'SPAWN',
  IDLE: 'IDLE',
  PATROL: 'PATROL',
  CHASE: 'CHASE',
  ATTACK: 'ATTACK',
  STAGGER: 'STAGGER',
  DEAD: 'DEAD',
} as const

export type EnemyState = (typeof EnemyState)[keyof typeof EnemyState]
