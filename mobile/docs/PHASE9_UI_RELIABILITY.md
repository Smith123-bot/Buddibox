# Phase 9 — UI polish and software reliability (19 October 2026)

**Later change:** [Phase 10 partial level expansion](PHASE10_EXPANSION_STATUS.md) raises Maze to 100 distinct routes; Phase 9 test totals below remain historical.

**Scope:** existing Expo/React Native application only. Phase 8 inventory and Phase 7 Android release-readiness audit remain the source for features, content counts and release blockers. No Git operation, EAS/native build, device test, dependency change, new game or storage migration in this phase.

## Baseline and final checks

| Gate | Before changes | After changes |
|---|---|---|
| TypeScript / ESLint | Passed / passed | Passed / passed |
| Jest | 69 tests, 22 suites passed | **70 tests, 22 suites passed** |
| Android-targeted offline Expo JS export | Phase 8 passed, not rerun before edits | **Passed**, Hermes JS bundle ~2.7 MB, six scene images |

The export is **not** an APK/AAB or native Android test. No APK or AAB exists here.

## Inspection and changes

- Reviewed tab/stack routes, selectors, play screens, shared components and design tokens, loading/errors, offline content, progress and preferences. Existing `ScreenContainer` uses a scrollable safe-area view, with a stack-header-aware top inset; actual Android status/navigation-bar and predictive-back behavior still require a device. Shared buttons have minimum 48 dp height and use the existing palette and spacing. The MazeBoard caps cells to 480 dp on tablets; WordGrid uses 48 dp horizontal-scroll cells. These are code-level properties, not physical layout measurements.
- **UI polish:** The three play screens' TIME/SCORE/WORDS or MOVES metric rows now wrap when width or scaled text exceeds a single line. This uses existing spacing tokens without changing gameplay or other screens. Actual small-phone, tablet, Hindi and 200%-text rendering must be checked on Android; static review cannot certify no clipping. Native restart confirmation dialogs have Cancel/Restart actions; their sizing and system-back dismissal need hardware verification.
- **Reproducible reliability defect fixed:** Difference `tap` previously classified NaN or infinite normalized coordinates as an incorrect guess: comparisons with NaN all fail. It now ignores non-finite coordinates and returns the original session, like an out-of-bounds tap. A regression case covers NaN and both infinity signs. Normal misses, duplicate finds and score rules are unchanged.
- **Storage failure coverage added:** A regression test exercises rejected `setItem` in all three existing game stores followed by a successful retry; no new save file is created on a rejected write. Existing tests also cover missing saves, invalid/future-version JSON read protection, read I/O errors, valid legacy records, session resume, serialized writes, deduplicated completion, and persistent achievement grants. No save key, record format, user progress, game art or word content was changed. As before, malformed v1 records may be dropped by sanitization; fully corrupt/future-version game saves block writes instead of silently resetting. A repair/export UI needs design and safe migration planning, not a speculative reset.
- **Performance:** No optimization was introduced without device profiling. The game screens still tick visible timer state every 500 ms even when paused/ready, which may cause avoidable rerenders; document and profile on Android before restructuring hooks. Local scene PNGs remain small (~5–7 KB each in the JS export) and are bundled; do not reduce quality blindly. No dependencies added.

## Known limitations / release blockers

The Phase 7 blockers still apply: no signed/installable Android APK or AAB, no native manifest/API-level verification, no hardware testing, no verified Hindi glyph shaping/matras/conjuncts or Hindi-speaker editorial sign-off, no TalkBack or large-font layout certification, no independent image target/physical tap QA, no process-death/offline install/upgrade save verification. AsyncStorage is nontransactional; cross-key achievement writes can be retried on focus but power-loss/OS-backup recovery is unproven. Achievement-store malformed JSON currently falls back to empty grants, while game stores protect unreadable saves; do not treat that fallback as a safe general recovery design. No in-app export/repair flow is available. Review security advisories, package ownership, EAS project linkage/signing and privacy/store requirements before release.

**Recommended next step, not started:** after a separately authorized cloud build and Android installation, perform a documented hardware QA pass across narrow phones/tablets, Hindi shaping, TalkBack and enlarged text, full three-game runs, offline usage, system back, process death, and signed upgrade preserving local progress. Triage measured defects before any further optimization or release sign-off.
