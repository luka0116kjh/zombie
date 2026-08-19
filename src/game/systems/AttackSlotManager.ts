/**
 * Limits how many zombies may be actively attacking the player at once so
 * crowds feel dangerous without producing unreadable, unavoidable damage
 * (CLAUDE.md #13 / #56). Enemies that are denied a slot keep approaching
 * but hold just outside attack range instead of piling on.
 */
export class AttackSlotManager {
  private capacity: number
  private holders = new Set<number>()

  constructor(capacity = 2) {
    this.capacity = capacity
  }

  request(id: number): boolean {
    if (this.holders.has(id)) return true
    if (this.holders.size >= this.capacity) return false
    this.holders.add(id)
    return true
  }

  release(id: number) {
    this.holders.delete(id)
  }

  reset() {
    this.holders.clear()
  }
}
