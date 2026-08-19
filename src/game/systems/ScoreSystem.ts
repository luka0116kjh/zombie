import { COMBO } from '../config/balance'
import { EventBus, GameEvents } from '../utils/events'

const HIGH_SCORE_KEY = 'deadline_outbreak_highscore'

/**
 * Tracks score + kill combo for the current run and persists the best
 * score locally. No backend, ever (CLAUDE.md #20).
 */
export class ScoreSystem {
  score = 0
  combo = 0
  private comboExpiresAt = 0

  constructor() {
    EventBus.emit(GameEvents.SCORE_CHANGED, { score: this.score })
    EventBus.emit(GameEvents.COMBO_CHANGED, { combo: this.combo })
  }

  addKill(baseScore: number, time: number) {
    this.combo += 1
    this.comboExpiresAt = time + COMBO.TIMEOUT_MS
    const multiplier = 1 + (this.combo - 1) * 0.1
    const gained = Math.round(baseScore * multiplier)
    this.score += gained

    EventBus.emit(GameEvents.SCORE_CHANGED, { score: this.score, gained })
    EventBus.emit(GameEvents.COMBO_CHANGED, { combo: this.combo })
    return gained
  }

  update(time: number) {
    if (this.combo > 0 && time > this.comboExpiresAt) {
      this.combo = 0
      EventBus.emit(GameEvents.COMBO_CHANGED, { combo: this.combo })
    }
  }

  reset() {
    this.score = 0
    this.combo = 0
    EventBus.emit(GameEvents.SCORE_CHANGED, { score: this.score })
    EventBus.emit(GameEvents.COMBO_CHANGED, { combo: this.combo })
  }

  static getHighScore(): number {
    try {
      return Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0)
    } catch {
      return 0
    }
  }

  saveIfHighScore(): boolean {
    try {
      const best = ScoreSystem.getHighScore()
      if (this.score > best) {
        localStorage.setItem(HIGH_SCORE_KEY, String(this.score))
        return true
      }
    } catch {
      // LocalStorage unavailable (private browsing, quota, etc.) — never
      // let a save failure crash the game.
      console.warn('[SaveManager] could not persist high score')
    }
    return false
  }
}
