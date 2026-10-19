# BuddhiBox

**Think Smart. Play Sharp.** Native Android puzzle app under development. Product scope and release gates: [blueprint](BUDDHIBOX_BLUEPRINT.md). Expo + React Native + TypeScript application: [`mobile/`](mobile/).

Feature/integration inventory: [Phase 8 audit](mobile/docs/PHASE8_FEATURE_AUDIT.md). Level-expansion status (partial): [Phase 10](mobile/docs/PHASE10_EXPANSION_STATUS.md). Earlier software QA: [Phase 9 UI/reliability review](mobile/docs/PHASE9_UI_RELIABILITY.md). Android audit and build prerequisites: [release-readiness report](mobile/docs/ANDROID_RELEASE_READINESS.md). **No Android APK/AAB has been built or tested in this workspace.**

## Run

```sh
cd mobile
npm ci
npm run check
npm start
```

Use Expo Go for supported module preview, or an Android development build/device for native verification. `EXPO_OFFLINE=1 npx expo export --platform android` validates Android JS bundling but **does not produce an APK**. No Android installation, touch-coordinate verification on device, or signed build has been performed in this workspace. The provisional app ID and custom BuddhiBox icon/splash require release review.

## Current scope

- Home, Games, Progress, Profile, Settings and About use Expo Router; only functional settings are shown (local haptics preference).
- **Find the Difference**: three original illustrated image pairs, each with five actual pixel-verified changes; level selection/unlocking, correct and incorrect taps, two hints per attempt, active timer, score, pause/restart, local progress, session resume and results. See [content QA register](mobile/assets/games/find-the-difference/CONTENT.md). Physical-device gameplay and independent visual validation remain untested.
- **Maze Escape**: 100 distinct deterministic, BFS-validated routes (eight original plus 92 new), D-pad movement, pause/resume, next-step hints, timer, scoring, local saves and unlocking. See [maze pack notes](mobile/src/features/maze/CONTENT.md). Android-device usability and difficulty calibration have not yet been verified.
- **Word Search**: 5 English and 5 Hindi deterministic boards, tap endpoints, word highlighting, hints, timer, scoring, independent language unlock tracks and local saves. [Unicode feasibility](mobile/src/features/word-search/FEASIBILITY.md) and [content/gameplay notes](mobile/src/features/word-search/README.md) document checks and hardware limitations. Hindi display shaping is not yet Android-verified; drag is not implemented.
- **Unified progress and achievements**: real per-game counts, unlocked content, recorded recent completions, and six locally persisted achievements. [Calculation, thresholds and legacy-save behavior](mobile/src/features/progress/README.md). Daily Challenge is deferred; sound is not implemented. No fake progress is displayed.

Stored game progress is local AsyncStorage data. It is version-validated and writes are serialized within the running app, but AsyncStorage is not a transactional database. Corrupt or future-version game saves are now blocked from silent overwrite; in-app repair/export, OS backup/uninstall recovery and device upgrade testing remain outstanding.
