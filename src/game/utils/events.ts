import Phaser from 'phaser'

// Centralized event names so cross-scene / cross-system communication
// never relies on magic strings scattered through the codebase.
export const GameEvents = {
  PLAYER_HP_CHANGED: 'PLAYER_HP_CHANGED',
  PLAYER_DAMAGED: 'PLAYER_DAMAGED',
  PLAYER_DIED: 'PLAYER_DIED',
  ENEMY_KILLED: 'ENEMY_KILLED',
  COMBO_CHANGED: 'COMBO_CHANGED',
  WEAPON_CHANGED: 'WEAPON_CHANGED',
  AMMO_CHANGED: 'AMMO_CHANGED',
  SCORE_CHANGED: 'SCORE_CHANGED',
  LEVEL_COMPLETED: 'LEVEL_COMPLETED',
  GAME_RESTART: 'GAME_RESTART',
  GAME_PAUSE_TOGGLED: 'GAME_PAUSE_TOGGLED',
} as const

// A single shared emitter used for GameScene <-> UIScene communication.
// Scenes come and go; this bus outlives any one of them.
export const EventBus = new Phaser.Events.EventEmitter()
