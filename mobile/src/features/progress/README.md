# Unified progress and achievement rules

## Implemented architecture

The three existing version-1 AsyncStorage records remain in their **original keys**: `buddhibox.difference.v1`, `buddhibox.maze.v1`, `buddhibox.word.v1`. There is no destructive migration or replacement of game save modules. Each game now optionally appends a validated completion `history` event **in the same write as its level record**: run ID, stable level ID, score, elapsed active milliseconds, device completion timestamp, hints and (when applicable) misses/moves. Old v1 saves without `history` still load: their cleared levels, attempts, best score and best time are preserved. No timestamp or hint count is synthesized for historical clears. Malformed history events are discarded without discarding a valid level record; malformed JSON and unsupported game-save versions now block loads/writes to prevent silent overwrite, pending a user-facing recovery workflow. Completion history and per-game writes are serialized in-process; AsyncStorage is not an ACID database and app-level multi-key updates are not atomic.

`model.ts` aggregates only known level IDs across actual shipped games. **Distinct completed levels** count records with clears > 0 once per stable ID; **total clears** sum completed attempts; **attempts** sum stored attempts; **games played** counts games with attempts or clears; **unlocked** derives each track from completed predecessors (Word Search has separate English/Hindi tracks). A **best score** is the maximum valid per-level best among completed levels, not a sum. **Recent activity** sorts valid dated run events descending by device-local completion timestamp, with deterministic tie-breaking. **Recorded hints/misses/moves** count events actually recorded since this phase, not invented historical totals. Dated Word Search completions prove all target words in that run were found. Achievements use *distinct* completed Word Search puzzle records to count proved target words, including legacy completed puzzles; current boards contain three targets each. Older saves can show completion totals while recent activity remains empty. Device clock changes can affect date ordering; no fraud-resistant clock is claimed.

`useUnifiedProgress.ts` loads all three existing stores on screen focus and uses pure aggregation. Screens share that model rather than duplicating calculations. Home continues valid saved sessions and highlights the most recent persisted achievement; Profile and Progress show only actual records. `achievementProgress.ts` uses a separate version-1 key `buddhibox.achievements.v1`. Reconciliation on Home/Progress/Profile focus evaluates pure predicates and writes **only newly unlocked IDs** with a first-observed local timestamp. If the game save succeeds and achievement write fails, it is retried on the next focus. Existing grant dates are not changed by replay/restart. If old records already meet a threshold, the grant time is the first observation after this update, *not* a fabricated historical win date. Corrupted grant JSON falls back to an empty grant set; a storage I/O failure shows an achievement-saving warning on Progress. There is no server, account or sync.

## Achievements

| Stable ID | Condition |
|---|---|
| `FIRST_WIN` | Clear one distinct level in any game. |
| `PUZZLE_EXPLORER` | Clear five distinct levels across games. |
| `MAZE_MASTER` | Clear five distinct Maze Escape routes. |
| `WORD_FINDER` | Prove fifteen target words by completing distinct Word Search puzzles. |
| `DIFFERENCE_DETECTIVE` | Clear three distinct Find the Difference scenes. |
| `NO_HINTS` | Complete at least one *recorded* run with exactly zero hints. Legacy clears without hint metadata never qualify. |

Each badge shows current/target progress. `DAILY_PLAYER` is **not registered**: older saves lack dates, device clock/timezone behavior needs design and testing. **Daily Challenge is deferred** for the same reasons; no screen, streak, date-based reward or fake daily data is shown. Nickname editing, cloud backup and leaderboards are not implemented.

## Adding an achievement safely

1. Give it a unique stable ID in the `AchievementId` union and the whitelist in `sanitizeGrants` (migrate if IDs ever change). Add title, description, explicit threshold and pure predicate in `achievements.ts`.
2. Use only validated stored evidence. If a new metric was not recorded by older saves, do not infer it as zero; gate on new run events. Avoid changing existing thresholds without a product migration decision.
3. Test below/at/above threshold, corrupt storage, duplicate evaluation, restart and interaction with legacy records. Run `cd mobile && npm run check` and an Android-targeted bundle. Device/airplane-mode checks remain required for release.

## Known limits

The prior blueprint proposed SQLite, but the actual application uses AsyncStorage. This phase preserves that architecture rather than silently claiming transactions. A device uninstall may erase local data. Concurrent processes, interrupted writes, OS backup, clocks/timezones, and physical Android layout/performance are not yet verified. Hindi font rendering and drag word selection remain open from Phase 5.
