# Kinetic development log

## Goal and working rules
Build the comprehensive offline-first, evidence-based fitness application in the supplied brief. Keep this file current. Standing rule: keep the welcome tour (dist/tour.js) in sync with the app. Whenever a page is added, renamed or removed, the navigation changes, or a headline feature changes, update the tour steps in the same change and mention it in this log. Research agents use GPT-6.1 Sol with High reasoning.

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
- User authorized a broad polish pass and continued agent reviews. Maintained info.md and a matching info.me copy as requested (info.me removed in 1.6).
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

## 2026-10-09 — Release 1.3 UI and copy overhaul (in progress)
User called the 1.1/1.2 look ugly and the wording obnoxious; full creative freedom. Plan: (1) replace style.css with a new warm-neutral, flat design system (ink buttons, single orange accent, light sidebar, no navy slab, light/dark); (2) strip slogan eyebrows/subtitles and rewrite empty states in plain words; (3) fold fine-print paragraphs behind "About this" toggles; (4) grouped sidebar with shorter names and a mobile bottom tab bar; (5) cache v4. Old stylesheet is recoverable from commit a329319. Status lines follow.
- 1.3 checkpoint: new dist/style.css written (full replacement); copy/markup patch applied to app/journal/training/planning/settings/anatomy/ui (10 page heads simplified, 31 fine-print blocks folded into "About this" toggles, grouped sidebar, mobile tab bar with Today/Train/Body/Calories/More, theme and lock buttons moved to the sidebar foot, orange favicon, cache v4). 29 tests + asset check pass. Browser review of the new look is next; nothing committed yet.
- 1.3 DONE (uncommitted on branch release-1.2-gym-floor; hosted copy still 1.1). Browser-checked on a throwaway localhost journal, then reset: all 11 pages render with the new headings and no horizontal overflow or console errors; light and dark themes; mobile tab bar at ~400 px; desktop sidebar at ~1000 px; workout screen with completed set, rest timer and prefilled loads. Fixes found during review: drawer close button leaked onto desktop, form inputs stretched beside help text, Today now leads with the scheduled workout and calories on narrow screens. 29 tests + asset check pass; package 1.3.0.
- Not checked: muscle-atlas highlight colours in use (recoloured to match the accent), the lock screen, every dialog, real phones.
- Copy rules going forward: page title only (no slogan line above or below), empty states say what is missing and what to do, caveats live behind "About this".

## 2026-10-09 — Release 1.4 welcome tour — DONE (uncommitted)
- New dist/tour.js: seven-step tour (Welcome, Today, Training, Plan, Track, Library, Settings and backups) shown in the shared dialog. Opens once per device on first launch (device pref `tourSeen`, recorded when the tour opens) and any time from Settings → About → "Take the welcome tour". The last step offers "Open Settings".
- Wired in app.js (startup + `start-tour` action), settings.js (button), sw.js (tour.js cached, cache v5), style.css (tour styles), package 1.4.0.
- 30 tests pass (new: tour steps complete and cover the main areas). Browser-checked: auto-opens on a fresh device, Next/Back through all steps, Open Settings, relaunch from Settings, no console errors. A locked journal does not show the tour.
- MAINTENANCE RULE (also in "Goal and working rules" above): update the steps in dist/tour.js whenever pages, navigation names or headline features change, and adjust the tour test in tests/polish.test.js if step titles change.

## 2026-10-09 — Release 1.5 programs, focus mode, goals, photo studio — DONE
User asked for: focus mode, programs that set today's weights, goals with projections, photo studio, a science audit, recommended programs, and automatic equipment substitution that rebalances the session.

Science (agents: 3 Sonnet research/audit, 1 Haiku DOI check, 1 Sonnet for evidence.json)
- Rules adopted: fractional sets (secondary muscle = 0.5), weekly sets 6–10 beginner / 10–16 intermediate / cap 20, double progression, reactive (not scheduled) recovery weeks at half the sets, rest 2–3 min compounds / 1–2 min isolations, 1–3 reps in reserve, split chosen by schedule.
- Deliberately NOT built: 5/3/1-style percent waves (no trial shows them beating simpler progression) and scheduled deload weeks (the one trial, Coleman 2024, found no benefit).
- Practical defaults with no trial behind them (labelled as such in the app/docs): load increment sizes, the stall rule, monthly strength ceilings in goal pace warnings, photo protocol advice.
- Audit fixes: the old `epley_formula2019` source was an unrelated robotics paper → replaced with `lesuer1997`; overhead presses gained `traps` as secondary; old `alternatives()` could suggest hinges for squats → tightened, and the UI now uses the ranked `substitutes()`.
- evidence.json: 22 sources added (41 + 3 anatomy), every DOI checked against Crossref, summaries written from PubMed abstracts. Caveats recorded in the entries: riegel1981 and lesuer1997 abstracts not read; schoenfeld2021 claims partly unverified from the abstract.

Code
- New: dist/programs.js (pure engine), dist/program-view.js (Plan/Today program screens, swap dialog, "Equipment today"), dist/focus.js (focus mode), dist/goals.js (Goals page, written by an agent), dist/photos.js (photo studio, written by an agent), tests/programs.test.js (23), tests/goals.test.js (8).
- data.js: 45 exercises added (108). store.js: root keys `goals`, `program`. validation.js: validates both, optional draft fields (range, targetLoad, targetRir, rest, why, covers, program) and photo `pose`.
- app.js: Goals nav entry, action dispatch for program/goal/photo, prefs `focusAuto` and `bar`, `C.restEnd`, `C.stopRest`, goal sync after each save. training.js: Focus mode and Equipment today buttons, per-exercise rest, target line, program advances on finish. planning.js: program section on top, three new evidence principles, old "Starter routine" card only for the mobility goal. anatomy.js: ranked substitutes in the exercise dialog. sw.js cache v6. package 1.5.0.
- Welcome tour updated (Training, Plan, Track, Library steps) per the standing rule.
- A Sonnet review agent found 12 issues; fixed: invalid numbers leaking into the draft, double-tap logging two sets, finish from focus mode, swaps wiping completed sets, recovery-week targets on swapped exercises, keyboard focus/inert, camera stream leak, missing error message on browse-swap, timed exercises dropped silently. Not fixed: every photo's Delete button has the same accessible name.

Verified in the browser pane: recommended program adapted to dumbbells + bodyweight, starting it, a full workout in focus mode, swap mid-workout, Equipment today (summary dialog), program advancing with new targets, Today card, creating a lift goal, photo studio page and camera-unavailable fallback, ranked substitutes, new sources, no console errors. 61 tests + asset check pass.
NOT verified: the camera itself (blocked in the pane), ghost overlay, compare slider and time-lapse with real photos, recovery-week flow, weight/run/habit goals with real history, imperial units in focus mode, plate line on a real barbell lift, phones, the lock screen with the new features, offline reload on cache v6.
Ideas not done: custom exercises, photos out of the main journal record, 11.6 MB side-reference.png, quick-log bar, macros, GPS, device sync.
- Second audit (Sonnet agent) of the 45 new exercises and the 7 templates, applied: chin-up biceps → secondary; back extension → glutes/hamstrings primary; sliding leg curl glutes → stabilizer; machine/band overhead press aligned with the other presses; two-arm dumbbell row no longer flagged unilateral; safety cues on skull crusher and band exercises. Templates: calves and rear delts added where under 4 sets/week, chest raised in the 5- and 6-day programs, 5-day program no longer repeats the bench session, compounds moved ahead of isolations, face pull treated as a small exercise (90 s rest). Regional tags dropped where the trials do not support them (band good morning, skull crusher, seated calf raise as "soleus"), and gap messages now say "in one small trial".
- Goals review (Sonnet agent): 8 defects fixed in dist/goals.js (direction of lift/run goals, weight goals created before any data, time parsing, imperial edit drift, hidden fields now disabled, form validation in one `buildGoal`, hardening against bad imports, clearer wording). 71 tests pass. Browser-checked after the fixes: creating weight, run and habit goals and editing a lift goal all save.

## 2026-10-10 — Android app (Capacitor shell)
User asked for a working Android app downloadable from GitHub. Defaults chosen: Capacitor 8.5.3 shell around dist/, sideloadable APK built by GitHub Actions and attached to the Release for a `v*` tag; no Play Store.
- android/: generated by `npx cap add android`, app id `io.github.subterfugus.kinetic`. Version follows package.json. Kinetic icon and launch screen replace the Capacitor defaults. Android cloud backup and device transfer are off so records never leave the phone. CAMERA permission for the photo studio (Capacitor grants getUserMedia once Android allows it).
- KineticNativePlugin.java: `saveFile` (Android "Save as" picker; WebView cannot download blob: links), `keepAwake` (WebView has no Screen Wake Lock API), `setTheme` (system bar colour follows light/dark). MainActivity: hardware back closes dialog → focus mode → menu → previous page → exit.
- dist/native.js: the JS side of those bridges, inert in browsers. settings.js `download()` is now async and returns false when the save dialog is cancelled (no "last backup" date recorded then). app.js skips the service worker inside the app. Offline buttons hidden in the app. sw.js caches native.js, cache v7.
- Welcome tour: Settings step now says "only on this device" instead of "only in this browser", which is true for both.
- Signing: without the KINETIC_KEYSTORE_* secrets the APK is signed with a throwaway CI key, so it cannot update an earlier install. Waiting on the user's decision. See android/README.md.
- Verified: 71 tests + asset check; browser with a simulated native bridge (backup and CSV go to saveFile, back closes dialogs, wake lock calls keepAwake, no console errors). The APK itself is built only in CI (this environment cannot reach Google's Android SDK). NOT verified on a real phone.

## 2026-10-10 — Release 1.6 setup, quick log, protein — DONE (draft PR)
Brady picked these from an ideas list: first-run setup, show the program on Today and Train, a quick-log button, exercise search, protein meter, photo Delete labels, delete info.me, redeploy.
- New dist/setup.js: on an empty journal the first launch shows a 4-step setup (units, equipment, days, then "Start this program") instead of the tour. Device pref `tourSeen` is set when it opens. Settings → About → "Run first-time setup".
- New dist/quicklog.js: floating + (above the mobile tab bar) with Calories, Weight, A set, A walk or run, Sleep. Hidden during a live workout on Training.
- Today and Training show a "Recommended program" card when no program is running (not for the mobility goal); with a program running, Today no longer says "Nothing scheduled today".
- Exercise search: the Exercises page already had a search box. It now matches words in any order across name, aliases, muscles, equipment and pattern, expands gym shorthand (db, bb, ohp, rdl, lats, glutes, biceps…), ranks name and main-muscle matches first, and the workout picker uses the same search.
- Protein: optional grams per calorie entry (also in "Log again" picks and CSV), optional `profile.proteinTarget`, meter on Calories (always) and Today (when a target is set or protein logged), "Use 1.6 g/kg" shortcut citing new source morton2018.
- Photo Delete buttons are labelled "Delete front photo from <date>". info.me removed (info.md is the only log now). Tour updated per the standing rule. Cache v7, package 1.6.0, 74 tests.
- Redeploy not done: deploy after the PR is merged; the hosting credentials are not in this repository.

## 2026-10-10 — Release 1.7 suggested workouts and the muscle map everywhere — DONE (draft PR, stacked on 1.6)
Brady asked for science-based suggested workouts, a graphic of every muscle a workout hits, the muscle map as a much bigger part of the app ("a lot of the gimmick"), and Settings figures such as goal weight in the chosen unit.
- dist/figure.js: shared muscle map (front + back) built from the licensed SVGs via <defs>/<use> and CSS variables. Shown on Today ("Muscles this week", full width under the metrics), the workout in progress ("Muscles in this workout"), suggested workouts, Today/Training program card, each Plan program day, the exercise dialog, session history dialog and focus mode.
- dist/suggest.js + dist/workouts.js: suggested workout on Training (full card with focus chips and "Different exercises") and Today (compact, when no program is running). Rules in scientific-methodology.md items 31–32.
- Navigation: Muscle atlas moved to the top group; the mobile tab bar is now Today, Train, Muscles, Calories, More (Body moved to More; weight is still on the + button and Today).
- Units: switching units in the Settings profile converts and relabels the weight, target weight and height already typed, and saves them in that unit (previously the labels and numbers stayed in the old unit until you saved). Weight error messages and the target notice now use the chosen unit.
- Tour: new "Muscle atlas" step; Today, Training and Library steps updated. Cache v8, package 1.7.0, 76 tests.
- Side view removed (Brady: the lateral plate looked completely different and worse). muscle_mapper only ships front/back views (checked the repo; Figma and Wikimedia are blocked from this environment). Deleted side-reference.png (11.6 MB) and side-landmarks.json; the atlas offers Front and Back. Cache v10. A matching side view can be added if Brady exports one from the Figma file.

## 2026-10-10 — Update checker — DONE (draft PR)
Brady asked for the app to check for updates automatically but never update itself.
- dist/updates.js: once a day when online (and on "Check now" in Settings → Updates), asks `api.github.com/repos/Subterfugus/kinetic/releases/latest`. A newer tag shows a dismissible notice above every page with "What's new" (release notes as plain text) and a button: the APK download on Android, the release page on the web. Failures are silent; a 404 means no release. Nothing is downloaded or installed by the app.
- `APP_VERSION` in dist/updates.js must equal package.json (tested). Bump both when releasing; the tag check in the Android workflow already ties the tag to package.json.
- Device prefs: updateCheck (on by default), updateCheckedAt, updateLatest, updateDismissed. Settings has the switch; the tour's Settings step mentions it. Cache v11, 81 tests.
- Limitation: GitHub only answers anonymous requests for public repositories. While the repository is private, the check finds nothing.

## 2026-10-10 — Release 1.8 rep-range preference and more exercises — DONE (PR)
Brady asked for a "prefer lower/higher reps" option in general and per exercise, more exercises so people without a given machine still have options (e.g. dumbbell shoulder press), all based on modern research.
- programs.js: REP_PREFS, repPreference (per-exercise beats general), preferredReps (fixed ranges per kind of exercise, so applying twice is stable), applyRepPreference. Applied in buildProgram, adaptItems, compensate (new optional profile argument), suggestWorkout and program swaps. Heavy main lifts (!) and strength-goal compounds in suggestions keep their range.
- Profile: repPreference ('balanced'|'lower'|'higher') and repPrefs {exerciseId: pref}. Validated; old backups load with the defaults. Settings → Training has the general select; each strength exercise's page has "Your rep range".
- data.js: 84 new exercises (192 total) filling equipment gaps for every pattern; unilateral regex extended (machine and seated variants excluded). New regional tags in `emphasis`.
- evidence.json: schoenfeld2017load, morton2016, lopez2021, currier2023, lasevicius2018 plus an implementation note. Methodology items 33–34.
- Tour: Library and Settings steps mention the new exercises and the rep preference. Cache v12, package 1.8.0, tests/release18.test.js.

## 2026-10-10 — Effort-aware progression and progressing routines — DONE (PR)
Brady asked whether workouts progress automatically and scientifically. Programs and suggestions already used double progression; saved routines only copied last time's loads and logged RIR was ignored.
- programs.js nextTarget: logged RIR (all sets rated, hardest set ≥ EASY=3 reps beyond target) gives +2 reps or two load steps (when ≤10% of load); such sessions don't count toward a reset.
- training.js progressed(): routines run nextTarget with a one-rep range [reps,reps] and prefill load, reps and a note.
- evidence: helms2018, graham2021, implementation note. Methodology item 35. tests/progression.test.js.

## 1.9.0 · calorie target follows Settings, bug sweep (2026-10-10)
Brady reported that changing height, weight and similar Settings didn't change the calorie target. The target was a stored number (default 2000) that only changed when typed.
- `profile.calorieMode` is `auto` (default) or `manual`. `syncCalorieTarget` (dist/science.js) runs before every save, on load, unlock and restore, and sets `calorieTarget` from `calorieGoal(state)` when automatic. Typing a number on the Calories page makes it manual ("Custom" pill); "Switch to automatic" returns. Older journals: a typed target stays manual, the 2000 default or an accepted maintenance estimate becomes automatic (validation.js `legacyCalorieMode`).
- `currentWeight(state)`: Settings weight if edited on or after the newest weigh-in (`profile.weightDate`), else the 7-day mean of weigh-ins. Calories, Body energy estimates and protein suggestion all use it.
- Goal rules and sources: scientific-methodology.md item 33. New sources murphy2022 and helms2023.
- Sweep fixes: chart axes use round tick values and readable text on phones (charts kept a fixed 220 px box and shrank the drawing); weigh-in and cardio lists show 10 with "Show all"; plural fixes ("1 activity", "1 session", "1 set"); a 1RM hint when no set qualifies; plain wording for the formula's sex input; Settings no longer mentions a hosted app; About counts groups from data. Cache v13.
- Known and left alone: Training's 1RM estimate only uses sets to failure (science.e1rm) while Goals counts reps in reserve (programs.estimate1rm). Flagged to the rep-preference work.
- Muscle atlas zoom on phones (Brady: couldn't zoom the muscle map). The stage had `touch-action:none` and only +/− buttons. Now: two-finger pinch zooms around the fingers (up to 4×), double-tap zooms in or out, ctrl+wheel (trackpad pinch) on desktop, and at normal size a vertical swipe scrolls the page (`touch-action:pan-y`, switched to `none` once zoomed). anatomy.js `zoomAt`.
- Brady (2026-10-10): progression changes must be a suggestion popup, never automatic. dist/steps.js: holdBack() starts program and suggested items at last time's load/reps and stores the target in item.suggest; routines attach item.suggest directly; offerSteps() shows one "Ready to step up?" popup at workout start (Use ticked / Keep last time's). Recovery weeks were already user-started.
- One 1RM estimate: science.e1rm now adds logged RIR (unrated = 0), ≤12 total; programs.estimate1rm delegates to it, so Training and Goals agree.
- Merged main 1.9.0; package 1.10.0, cache v14 (steps.js added), tour Training step mentions the popup.


## 1.11.0 · Progress page with graphs over time (2026-10-10)
Brady asked for proper graphs over time of bodyweight, weight lifted, weight lifted per exercise and similar.
- New page `#progress` (Track → Progress, dist/progress.js). Range buttons: 4 weeks, 3 months (default), 6 months, 1 year, all time (`ui.progressDays`, 0 = all).
- Tiles: workouts, total weight lifted (load × reps of completed working sets on reps-load exercises), hard sets (completed non-warm-up sets of strength exercises), bodyweight change (7-day average, start to end). Finite ranges compare with the previous period of the same length.
- Charts: bodyweight (weigh-ins as dots, 7-day average line, regression rate badge when ≥5 weigh-ins over ≥14 days); weight lifted per week; workouts and hard sets per week; per exercise heaviest set, estimated 1RM and weight lifted per day (two workouts on one day merge into one point); weekly sets per muscle (primary 1, secondary ½) with a shaded 6–10 (beginner) or 10–16 band from pelland2026/schoenfeld2017. Bins switch from weeks to calendar months past ~14 months; the muscle chart then shows the last 52 weeks.
- 1RM uses `science.e1rm` (Epley with reps in reserve), the same estimate as Training and Goals.
- `timeChart` in progress.js is separate from `ui.chart`: multi-series, real date axis, a cursor that follows tap/drag (touch-action pan-y keeps vertical scrolling), arrow keys/Home/End for keyboard, data table for screen readers. It picks a 360-wide viewBox on screens under 600 px so text stays readable.
- Tour Track step lists Progress. Cache v15, package 1.11.0 (1.10.0 is the rep-preference release), tests/progress.test.js.
