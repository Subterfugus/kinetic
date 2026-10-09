# Kinetic development log

## Goal and working rules
Build the comprehensive offline-first, evidence-based fitness application in the supplied brief. Keep this file current. Research agents use GPT-6.1 Sol with High reasoning.

## 2026-10-08 — Foundation
- Read the entire supplied specification before implementation.
- Selected a static, locally executable progressive web application: native JavaScript modules, IndexedDB, locally bundled assets and evidence, no remote data APIs.
- Sites provides private hosting of the application shell; personal health records remain device-local as explicitly requested.
- Research in progress: verified scientific equations/guidelines and properly licensed exercise/anatomy assets.
- Unified model uses stable muscle-group and exercise IDs. Sessions reference exercise IDs. Anatomy and analytics resolve the same relationships from the library.
- Design: precise blue/ink training journal, clear empty states, responsive navigation, accessible forms and light/dark themes.
- User records start empty. No synthetic history or fabricated chart results.

## Planned verification
Scientific calculation tests; validation and backup tests; primary workflows in browser; desktop/mobile layout; offline reload and persistence; licensed asset and evidence integrity.

## 2026-10-08 — Core implementation
- User revised exercise scope: quality over hundreds/thousands. Implemented 63 curated movements with authored instructions, conservative safety/ROM notes, qualitative anatomical roles, equipment filters and substitutions.
- User granted creative freedom to adjust excessive scope. Selected interactive licensed front/back SVG anatomy and an explicitly labeled historical lateral reference; omitted wearable integrations and bespoke 3D.
- Added 20 shared muscle groups and preserved 139 original anatomical paths. No activation percentages or invented anatomical shapes.
- Bundled 18 research references plus 3 anatomy references, formula/claim limitations and offline source summaries. Included 2026 ACSM guidance.
- Added calorie CRUD, complete-day intake status, weight smoothing, body measurements, method-identified composition readings, local progress photos, cardio and optional wellbeing.
- Added workout drafts, sets/load/reps/time/distance/RPE/RIR/warmups, timers, routines, schedule, duplication/editing, set-based analytics, records and conservative progression checks.
- Added local equipment-aware planning, configurable-period insights, CSV/full JSON backups and validated restoration.
- Added optional AES-GCM/PBKDF2 journal encryption and a passphrase lock; records are never uploaded.
- Added local service-worker app-shell caching, light/dark themes and responsive navigation.
- First preview served successfully and shown in the app. Primary browser verification is in progress.

## Status
Implementation, scientific audit and release verification are complete. Private publication and downloadable packaging are being finalized; deployment outcome is recorded in the accompanying delivery log.

## 2026-10-08 — Audit and release verification
- Corrected maximum-effort single handling and suppressed estimates/progression for assistance and non-comparable resistance conventions.
- Corrected lateral deltoid panel to show all three related groups; documented unilateral paired-set logging.
- Refined charts to use actual elapsed dates and mobile navigation focus/closing behavior.
- 22 automated scientific, validation and encryption tests passed. Asset checks passed for 63 exercises, 20 groups, 139 paths and 21 references.
- Browser verified calorie add/edit/completion, weight persistence, workout completion and records, shared atlas metrics, cardio energy/pace, routines/schedule, backup export/restore, composition and photo imports.
- Verified displayed RMR/TDEE against numerical test results.
- Stopped the isolated QA server and verified offline reload, anatomy, saved session statistics and scientific-reference search.
- Verified desktop and 375-pixel mobile layout. Tested WebMCP staging and rejection of unexpected input.
- Added local launcher, README, architecture, final methodology and verification documentation. Source remains free of sample health records.

## 2026-10-08 — Delivery
- Private deployment succeeded: https://kinetic-fitness-journal.wigglypearl2.chatgpt.site
- Pushed source commit: 1bdac1e9a09820434abbf63f7b41d727e9bb62b5.
- Packaged kinetic-offline.zip directly from that committed source, including the local launcher, app, tests and documentation.
- Hosting packaging required Git Bash on PATH and GNU tar's force-local option for Windows drive paths. Credentials were renewed in session memory and were never written into project files or shell arguments.
- Verified the delivered local server renders the app without browser errors; verified the dark theme in the isolated QA journal.
- Created kinetic-preview.jpg from the empty journal's anatomy interface. Test records remain confined to a separate QA browser origin and are absent from application source and downloadable package.
- Task-owned preview servers were stopped after verification. The published application remains available, and the downloaded launcher can start a local copy when needed.
- Scope adjustments: 63 curated exercises; licensed interactive 2D front/back atlas with labeled historical lateral reference; manual cardio; no wearable integration, bespoke 3D model or clinical rehabilitation recommendations.
- Final outcome: implementation, research, verification, private publishing and local packaging complete.


## 2026-10-08 — Polish pass in progress
- User authorized a broad polish pass and continued agent reviews. Maintained info.md and a matching info.me copy as requested.
- GPT-6.1 Sol / High agents audited scientific/data behavior and usability without changing Site files.
- Corrected custom MET preservation, session-edit duration, repetition-target progression and missing-performance observations.
- Timed/static movements no longer start with phantom repetitions. Dynamic core movements retain repetition tracking.
- Replaced wide workout tables with responsive set cards, reachable completion controls, expandable effort/details and a mobile finish bar.
- Draft edits use validated clones; invalid inputs never poison saved state. Completed-set effort and measurement checks run before completion.
- Added dialog names, field helper associations, focused entry fields, focus restoration and an accessible mobile navigation drawer.
- Preserved exact canonical values when unchanged converted inputs are submitted; allowed arbitrary precision for imperial edits.
- Added chart readouts and complete/partial-day legends; data tables expose raw and smoothed series.
- Refined spacing, typography, cards, themes and anatomical presentation. No user records or fake history added.
- Verification and updated private publication are in progress.

## 2026-10-08 — Polish verification complete
- 28 automated tests passed, including six targeted regressions for issues found by the audit agents.
- Asset integrity remained valid: 63 movements, 20 groups, 139 original paths, 21 references and every offline asset.
- Verified timed-set rejection/completion, invalid input recovery, unchanged imperial profile and weigh-in saves, custom MET preservation, raw chart inspection and mobile drawer focus.
- Follow-up scientific audit confirmed the core corrections; remaining swap/routine target issues were resolved.
- Preserved historical session duration and recorded start during edits. Updated methods and release documentation accordingly.
- Static cache version advanced to v2. No schema reset or record deletion is required.
- Preparing the updated private release and local download.

## 2026-10-08 — Final offline verification
- Stopped the isolated QA server and successfully reloaded the updated Training page from its offline cache, retaining both saved QA sessions.
- Rechecked the unusual Yepes robotics citation against its published equation 4: it correctly documents the Epley formula. Clarified its visible link as Formula documentation rather than implying general validation.
- Private publication and updated offline archive follow this verified source state.

## 2026-10-08 — Release 1.2 "gym-floor" pass (Claude Code, in progress)
User granted full creative freedom after a code review. Usage budget is tight, so this log is updated after each step; anything not marked DONE is not started.
Planned, in order:
1. Workout logging: prefill loads from the last session, "Last time" line and progression hint inside the workout, auto rest timer with sound/vibration that survives reload, elapsed time, screen wake lock.
2. Data safety: request persistent browser storage, backup reminder with last-backup date (device-local preference in localStorage; no journal schema change).
3. Offline: cache-first service worker with background refresh (cache v3).
4. Small wins: recent-entry quick picks for calories, maintenance-estimate shortcut for the calorie target, imperial cardio distances, performance pages default to exercises actually trained.
Deliberately deferred (larger/riskier): moving photos out of the main journal record, compressing side-reference.png (11.6 MB), onboarding flow, mobile bottom tab bar, custom exercises, CSV import.

### 1.2 status checkpoint — code applied, browser verification pending
DONE in code (28 existing tests + asset check still pass, all modules pass `node --check`):
- science.js: `lastSets()` (most recent working sets for an exercise).
- training.js: `itemFor(...,previous)` prefills loads; `withHistory()`; "Last time" line and "Ready to progress" hint in each exercise card; elapsed time in the live banner; auto-rest and beep preference checkboxes; completing a set calls `C.startRest`.
- app.js: device prefs in localStorage key `kinetic-device-prefs` (autoRest, restSound, lastBackup, backupSnooze); rest timer end stored in sessionStorage `kinetic-rest`, +30s button, beep/vibration, auto-dismiss 20 s after zero; screen wake lock while a workout is open on Training; `navigator.storage.persist()` requested after the first save; backup nudge on Overview (5+ records, no backup in 14 days, 7-day snooze); calorie "Log again" quick picks; `C.recentExercise()`; mile conversion helpers; "updated, reload" toast on service-worker change.
- journal.js: maintenance-estimate "Use as target" shortcut; cardio distances/pace/speed in miles for imperial; energy line uses the display weight unit.
- planning.js: Insights default exercise and pace unit. settings.js: last-backup and eviction-protection rows; export records the backup date.
- sw.js: cache-first with background refresh, cache `kinetic-shell-v3`.
- style.css: appended rules for the new elements.
TODO: new regression tests, browser check, README/architecture/verification notes, version bump to 1.2.0, commit (not pushed/deployed unless the user asks).

### 1.2 verification — DONE (not committed, not deployed)
- 29 automated tests pass (new: load prefill from most recent working sets); asset check passes; package version 1.2.0.
- Browser check on a throwaway localhost journal (imperial units, two seeded bench sessions, then reset to empty): routine start prefilled 132.28 lb on all three sets; "Last time" and "Ready to progress ~135.6 lb" lines rendered; ticking a set started the 5 s rest timer, which reached "Rest complete" with the +30s button; elapsed time shown; calorie "Log again" pick filled 450 / Oats and saved; Overview showed the backup nudge at 5 records; cardio row showed 3.11 mi · 6.2 mph · 9.66 min/mi; Settings showed last-backup and eviction-protection rows; Insights defaulted to bench press; no console errors; 375 px layout intact.
- Not exercised in a browser: beep/vibration output, wake lock, the persistent-storage grant itself (browser decides), service-worker update toast, offline reload under cache v3.
- The hosted copy at chatgpt.site is still 1.1; redeploying and committing are left to the user.
Next candidates: photos out of the main journal record, compress side-reference.png, onboarding, mobile tab bar, custom exercises, CSV import.
