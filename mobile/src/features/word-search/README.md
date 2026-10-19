# Word Search content and gameplay

**Status:** 5 English and 5 Hindi deterministic, structurally validated bundled boards. Android glyph shaping and real-device playability are *not yet verified*. Read [feasibility](FEASIBILITY.md) before claiming Hindi release readiness.

## Architecture and representation

`content/puzzles.json` is the build output of `mobile/tools/build-word-content.cjs` (Node 22 / ICU 78.2). Each puzzle stores stable ID (`en-001`, `hi-001`), language, difficulty, grid size, seed, content version, active-time par, hint limit, token grid, and targets (`id`, display word, ordered grapheme tokens and explicit row/column path). NFC display words are split into selectable units **only at build time**; each React Native cell displays one precomputed token. Runtime never uses UTF-16 indexing, `Array.from(word)` or Hermes `Intl.Segmenter`. The UI and matching engine both consume the same compiled token arrays.

Builder uses bounded seeded placement across horizontal, vertical and diagonal forward paths, respecting overlapping token equality. It fills empty cells with language-appropriate single tokens and rejects incidental duplicate occurrences in all eight readable directions. Runtime matching permits selecting either endpoint first (reverse selection of a forward placement), but does not place words backwards independently. `validatePuzzle` checks token/path integrity, bounds, duplicate IDs and unambiguous occurrences. Jest corpus additionally checks every shipped word/cell against build-time `Intl.Segmenter`, matras and conjunct examples, NFC and safe rejection of corrupted cells. This proves structural correctness for shipped vocabulary, not display shaping on Android.

## Input, scoring and saves

Tap one cell then the other endpoint. Horizontal, vertical and 45-degree diagonal paths are allowed; invalid or repeated selections do not score. **Drag selection is not implemented**: nested horizontal board scrolling and cell responders need device-specific gesture testing first. The grid has 48 dp cells and can scroll horizontally on narrow screens. A hint outlines the first cell of one undiscovered target and never finds it automatically; two hints per attempt. Score: `max(0, 100 × found words + max(0, 200 − floor(200 × activeSeconds / parSeconds)) on completion − 50 × hints)`. Timer stops during pause/background and checkpoints every 5 seconds while active. Restart resets the current attempt but not saved bests.

AsyncStorage key `buddhibox.word.v1` isolates records and a resumable session from the other two games. English and Hindi unlock tracks are independent; chosen puzzle language is persisted. Writes to this key are serialized within the app and completion is deduplicated by run ID. AsyncStorage is **not a transactional database**; OS backup, cross-install migration, sudden power loss and multi-process writes remain unverified.

## Add a puzzle

1. Edit the correct language array in `mobile/tools/build-word-content.cjs` with a real, editorially checked word list, title and size. Do not edit generated JSON by hand.
2. Use an environment with Node 22 / ICU 78.2. Run `node mobile/tools/build-word-content.cjs` from the repository root. The generator aborts after 80 placement attempts per board instead of shipping an invalid one.
3. Run `cd mobile && npm run check`; inspect emitted grapheme tokens and every board for vocabulary, visual clarity, incidental near-words and difficulty. Add independent native Android Hindi-font and accessibility playtesting before release.
4. Stable released IDs and seeds must not be repurposed without a save-migration plan. Validate changed content against saved sessions and prior app versions.

**Not implemented:** drag, arbitrary user-entered words, full Hindi UI localization, audio. Six shared achievements are implemented in `../progress/achievements.ts`; Word Search completions contribute to them. **Blocked pending hardware:** verification of Android font shaping, conjunct/matra clipping, TalkBack and large-font usability. No licensed font was downloaded or bundled in this phase.
