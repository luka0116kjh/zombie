// Plain string-union "enum" instead of a real TS enum: the project's
// erasableSyntaxOnly setting rejects enums because they emit runtime
// code that isn't a pure type erasure.
export const PlayerState = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  JUMP: 'JUMP',
  FALL: 'FALL',
  CROUCH: 'CROUCH',
  DASH: 'DASH',
  HURT: 'HURT',
  DEAD: 'DEAD',
} as const

export type PlayerState = (typeof PlayerState)[keyof typeof PlayerState]
