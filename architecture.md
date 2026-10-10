# Kinetic architecture

## Shared model

`dist/data.js` owns stable exercise IDs, qualitative primary/secondary/stabilizer relationships, movement patterns, equipment and 20 muscle groups. Each group references normalized muscle IDs in `assets/muscle-map.json`. The source SVG path IDs map to those muscles. Sessions reference exercises by ID; anatomy and analytics resolve relationships from the same exercise records. Components do not maintain separate exercise-muscle assignments.

The library holds 108 exercises: 100 strength, 5 cardio and 3 mobility. `data.js` still exports the older `alternatives()` helper. Its only call is in a Swap branch of `training.js` that `programAction` in `program-view.js` handles first, so swaps use the ranked `substitutes()` in `programs.js`.

## Data and calculations

`store.js` persists a versioned structured journal in IndexedDB. The journal contains profile, calories, complete-day flags, weights, measurements, body-fat readings, photos, sessions, draft, routines, schedule, cardio, wellbeing, goals and the active program. A write queue saves validated snapshots. The most recent successful in-memory snapshot supports rollback after failed writes. Browser persistence is still subject to browser/device limits.

`validation.js` validates imports and saves, including dates, identifiers, ranges, completed-set observations, photo URL formats and photo `pose` (`front`, `side`, `back` or empty), goal records, the active program and draft program references. Backups from earlier versions restore with empty `goals` and no `program`, because `validateState` merges the input over `initialState()`. `science.js` holds pure derived calculations; no derived metric is written back as an observation. Planning recommendations resolve existing records and explicit equipment preferences. All essential computations execute locally.

`programs.js` is the pure program engine. It has no DOM code and imports only `data.js` and `science.js`. It holds the seven templates, `recommend`, `buildProgram`, `adaptItems` and `compensate` (equipment substitution and muscle compensation), `similarity` and `substitutes` (ranked replacements), `nextTarget` (double progression), `stalled` and `stalledLifts` (recovery-week suggestions), `plates` (plates per side) and `regionalGaps`. Its rules and sources are in `scientific-methodology.md`, section "Programming rules (1.5)".

`goals.js` holds the goal calculations: `goalStatus`, `project` (steady and slowing pace ranges), `paceCheck`, `habitWeeks`, `habitStreak` and `runSeries`. `buildGoal` turns submitted form data into a goal record, and `parseTime` reads mm:ss or minute times. `syncGoals` marks reached goals after a save completes, never during rendering.

`vault.js` uses Web Crypto AES-GCM-256, PBKDF2/SHA-256 with 310,000 iterations, random salt and fresh IVs. The unlocked key exists in memory. A locked journal persists an encrypted envelope. Photos are part of the same journal envelope. Backups carry a versioned full journal/envelope and are validated after decryption. CSV is a separate readable export with formula-like cells escaped.

Journal state added in 1.5:

- `goals`: records with `id`, `date`, `type` (`lift`, `weight`, `run` or `habit`), `target`, `start`, `deadline`, `achieved` and `note`. Lift goals add `exerciseId` and `reps` (1 to 10). Run goals add `activity` and `distance`. For habit goals, `target` is the number of workouts per week.
- `program`: `null`, or `{templateId, startedAt, next, completed, deloadUntil}`. `next` is the index of the next session in the template's week, `completed` counts finished program sessions, and `deloadUntil` is the completed-session count at which a recovery week ends, or null.
- Draft exercises may carry the optional fields `range` (two integers), `targetLoad`, `targetRir`, `rest` (seconds) and `why` (the note shown under the exercise). Validation also accepts `covers`, and the engine uses it only to write `why`; it is not stored on the draft item.
- Draft `program` (optional): `templateId`, `day`, `week` and `deload`, recording which program session the workout came from.
- Photos: `pose` is `front`, `side`, `back`, or an empty string for a photo saved without a view.

## Presentation and offline use

`app.js` coordinates routes, persistence and forms. Feature modules own journal, training, planning, settings/evidence and anatomy workflows; `ui.js` provides common dialogs and inspectable SVG charts. `style.css` defines responsive layouts and themes.

The 1.5 modules are:

- `program-view.js`: the Plan program screens, starting a program workout, the Swap and Equipment today dialogs, and the adjustment notices.
- `focus.js`: the full-screen, one-set-at-a-time view of the unfinished workout. It edits the same draft as the Training page, and `app.js` calls `refreshFocus()` after every render.
- `goals.js`: the Goals page and the goal summary card on Today.
- `photos.js`: the photo tab of the Body page, with the camera and ghost overlay, timer, comparison slider and time-lapse. The camera is requested only while the capture dialog is open, and its stream stops when the dialog closes. Captures are cropped to 3:4, scaled to at most 1200 pixels on the long side and saved as JPEG at quality 0.85. Each photo is held in the journal as a data URL, limited by validation to 6,000,000 characters.

The 1.6 modules are:

- `setup.js`: the first-run setup (units, equipment, training days, then the recommended program). `app.js` opens it instead of the welcome tour when the journal is empty and the tour has never been shown on this device. Settings → About can open it again.
- `quicklog.js`: the floating **+** button and its chooser. It reuses the calorie, weigh-in, activity and recovery dialogs and the workout exercise picker. It is hidden during a live workout on Training.

Calorie entries can carry an optional `protein` amount in grams, and the profile has an optional `proteinTarget`. Both are validated, included in backups, and older backups without them still restore. Exercise search (`matchesQuery` and `searchExercises` in `data.js`) is shared by the Exercises page and the workout picker.

The 1.7 modules are:

- `figure.js`: the reusable muscle map. `buildFigureDefs()` parses the two licensed SVGs once into hidden `<defs>`, tagging each mapped path with `fill:var(--g-<group>)`. Each figure is two `<use>` clones whose colours come from CSS custom properties, so a page can show many maps cheaply. `muscleLoad()` turns exercises and sets into fractional sets per group.
- `suggest.js`: the pure suggested-workout engine. `workouts.js` draws its card on Training and Today and starts the session through `itemFromSlot()` from `program-view.js`, so load targets come from history exactly as in programs.

Import relationships:

- `programs.js` is imported by `validation.js`, `training.js`, `anatomy.js`, `focus.js`, `goals.js` and `program-view.js`.
- `program-view.js` is imported by `planning.js` and `journal.js`. `goals.js` and `photos.js` are imported by `journal.js` and `app.js`. `focus.js` is imported by `app.js`, `training.js` and `program-view.js`.
- `training.js` and `focus.js` import each other. Focus mode reuses `newSet` and `trainingAction` from `training.js`, and `training.js` opens focus mode when a workout starts.

`sw.js` caches a finite same-origin allowlist covering the shell, modules, evidence and anatomical assets. The current cache is `kinetic-shell-v6`, and its list includes every 1.5 module. Requests are answered from the cache first and refreshed from the network in the background. No external dependency or data service is needed. The source bibliography remains readable offline; opening original publications is optional online work. A new browser/origin needs its first successful app load before offline use.

Device preferences live in localStorage under `kinetic-device-prefs`: rest timer behaviour (`autoRest`, `restSound`), last backup date and snooze, `tourSeen`, `focusAuto` (open focus mode when a workout starts; on by default, set on the Training page) and `bar` (the bar weight chosen in focus mode, kept separately for each unit system; `null` uses 20 kg or 45 lb). The running rest timer lives in sessionStorage. None of these are part of the validated journal or its backups.

Sites hosts static `dist/` privately. Personal records do not leave the browser. The optional local server binds only to loopback. Journals are isolated by origin, so moving from localhost to the private hosted URL requires a backup restore.
