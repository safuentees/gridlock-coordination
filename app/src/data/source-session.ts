import type { Dataset } from "@/domain/schema"
import { parseSourceDataset } from "./import"

// Versioned independently of demo mode and saved coordination reviews.
const SOURCE_SESSION_KEY = "gridlock.source-session.v1"
const BLOCKED_WRITE_MESSAGE = "Source persistence is blocked because saved data could not be read safely. Download the active dataset to keep this session, or use Restore supplied snapshot to clear its saved revision."

export function readSourceSession(): { dataset: Dataset | null; error: string | null; writeBlocked: boolean } {
  let stored: string | null
  try {
    stored = localStorage.getItem(SOURCE_SESSION_KEY)
  } catch {
    return {
      dataset: null,
      error: "Browser storage is unavailable. Source revisions cannot be restored or saved here; download the active dataset to keep it.",
      writeBlocked: true,
    }
  }
  if (stored === null) return { dataset: null, error: null, writeBlocked: false }
  try {
    // Reuse the real-only schema and byte limit for every restored revision.
    return { dataset: parseSourceDataset(stored), error: null, writeBlocked: false }
  } catch {
    return {
      dataset: null,
      error: "The saved source revision failed validation and was preserved. Apply revisions for this tab only, or use Restore supplied snapshot to clear the saved revision.",
      writeBlocked: true,
    }
  }
}

export function saveSourceSession(dataset: Dataset, writeBlocked = false): string | null {
  if (writeBlocked) return BLOCKED_WRITE_MESSAGE

  // Do not rely only on a previous read: malformed data may have appeared in another tab.
  const existing = readSourceSession()
  if (existing.writeBlocked) return existing.error ?? BLOCKED_WRITE_MESSAGE

  let serialized: string
  try {
    const proposed = JSON.stringify(dataset)
    if (typeof proposed !== "string") return "The source revision is invalid and was not stored."
    serialized = JSON.stringify(parseSourceDataset(proposed))
  } catch {
    return "The source revision failed validation or exceeded the import size limit and was not stored. Use a valid source dataset to save a revision."
  }
  try {
    localStorage.setItem(SOURCE_SESSION_KEY, serialized)
    return null
  } catch {
    return "This browser could not save the source revision; storage may be unavailable or full. The active session can continue. Download the active dataset before leaving this tab."
  }
}

export function clearSourceSession(): string | null {
  try {
    // This explicitly requested reset must not remove demo state or saved reviews.
    localStorage.removeItem(SOURCE_SESSION_KEY)
    return null
  } catch {
    return "The saved source revision could not be cleared because browser storage is unavailable. Download the active dataset to keep this session."
  }
}
