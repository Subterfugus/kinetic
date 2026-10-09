# Kinetic architecture

## Shared model

`dist/data.js` owns stable exercise IDs, qualitative primary/secondary/stabilizer relationships, movement patterns, equipment and 20 muscle groups. Each group references normalized muscle IDs in `assets/muscle-map.json`. The source SVG path IDs map to those muscles. Sessions reference exercises by ID; anatomy and analytics resolve relationships from the same exercise records. Components do not maintain separate exercise-muscle assignments.

## Data and calculations

`store.js` persists a versioned structured journal in IndexedDB. The journal contains profile, calories, complete-day flags, weights, measurements, body-fat readings, photos, sessions, draft, routines, schedule, cardio and wellbeing. A write queue saves validated snapshots. The most recent successful in-memory snapshot supports rollback after failed writes. Browser persistence is still subject to browser/device limits.

`validation.js` validates imports and saves, including dates, identifiers, ranges, completed-set observations and photo URL formats. `science.js` holds pure derived calculations; no derived metric is written back as an observation. Planning recommendations resolve existing records and explicit equipment preferences. All essential computations execute locally.

`vault.js` uses Web Crypto AES-GCM-256, PBKDF2/SHA-256 with 310,000 iterations, random salt and fresh IVs. The unlocked key exists in memory. A locked journal persists an encrypted envelope. Photos are part of the same journal envelope. Backups carry a versioned full journal/envelope and are validated after decryption. CSV is a separate readable export with formula-like cells escaped.

## Presentation and offline use

`app.js` coordinates routes, persistence and forms. Feature modules own journal, training, planning, settings/evidence and anatomy workflows; `ui.js` provides common dialogs and inspectable SVG charts. `style.css` defines responsive layouts and themes.

`sw.js` caches a finite same-origin allowlist covering the shell, modules, evidence and anatomical assets. Requests are answered from the cache first and refreshed from the network in the background. Device preferences (rest-timer behaviour, last backup date) live in localStorage and the running rest timer in sessionStorage, outside the validated journal. No external dependency or data service is needed. The source bibliography remains readable offline; opening original publications is optional online work. A new browser/origin needs its first successful app load before offline use.

Sites hosts static `dist/` privately. Personal records do not leave the browser. The optional local server binds only to loopback. Journals are isolated by origin, so moving from localhost to the private hosted URL requires a backup restore.
