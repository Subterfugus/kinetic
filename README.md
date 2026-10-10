# Kinetic

A device-local fitness journal with 108 curated exercises, an interactive muscle atlas, strength and cardio logging, a focus mode for one set at a time, recommended training programs that adapt to your equipment, goals, body tracking, progress photos, a literal calorie counter, planning, analytics, and offline scientific references.

## Open the app

Use the private hosted link supplied with this delivery. Open it once online and wait for **Settings → Offline** to confirm caching. Core features then work without a connection. Source links still require internet.

For a fully local copy, install Node.js from its official website if it is not already installed. Extract the complete folder and double-click **Start-Kinetic.cmd** on Windows, or run `npm start` in this folder. Open **http://127.0.0.1:4173** in your browser. Keep the server window open while first loading the app. Opening `index.html` directly is not supported because modules, storage and offline caching require an HTTP origin.

## Get started

On a new, empty journal, a short setup asks for your units, equipment and training days, then offers the recommended program. Run it again, or take the welcome tour, from **Settings → About**. The **+** button in the corner of every page logs calories, weight, a set, a walk or run, or sleep.

1. Set your optional profile, units, equipment and goal in Settings. Energy estimates require the published equation inputs; the calorie target is separately editable. The equipment list decides which exercises programs and substitutions can use.
2. Start a workout, choose exercises, and mark completed sets. Focus mode opens when a workout starts and shows one set at a time, with plates per side for barbell lifts; it can be switched off with the option on the Training page. Loads are prefilled from your last session of each movement, and completing a set starts the rest timer (both the automatic start and the beep can be switched off in the workout). A unilateral set row represents a completed left/right pair. Keep load conventions consistent.
3. Plan a program. Plan recommends one of seven programs from your training days, goal and experience, and shows each session adjusted to your equipment: an exercise you cannot use is replaced by the closest available substitute, and sets are added where a muscle would otherwise lose work. Starting a program fills each session's load targets when you begin it. In a workout, Swap changes one exercise, and Equipment today changes the current workout only. Recovery weeks are suggested when lifts stall and start only when you choose them.
4. Explore Muscle atlas. The same exercise relationships drive highlights, workout history and muscle-group set counts.
5. Log calories manually, with optional grams of protein. Set an optional daily protein target to see a protein meter next to the calorie meter. Mark a day complete when its intake is fully recorded; incomplete days are excluded from intake averages and maintenance calibration.
6. Add weigh-ins, measurements, method-identified body-fat readings, photos, cardio, or optional wellbeing records. The photo tab of the Body page takes photos with a ghost of the previous photo of the same view, a timer, a before-and-after slider and a time-lapse. Track → Goals holds lift, body-weight, run-time and weekly-habit goals, with progress and a projection range.
7. Export a full backup regularly; Overview reminds you when this device has no backup from the last 14 days. Restore validates a backup before replacing the journal.

## Privacy and backups

Records and photos stay in IndexedDB on the current browser and origin. No health records are sent to a server, and no analytics or external data API is used. The photo studio uses the camera only while its dialog is open. The private host serves the app files; it does not synchronize journals. Localhost and the hosted URL have separate journals. To move between browsers, devices or origins, export and restore a full backup.

The optional passphrase vault encrypts the journal and photos at rest. There is no passphrase recovery service. An unlocked browser session can read its records. Full backups are encrypted when the vault is enabled; CSV exports remain readable. Browser clearing, device loss and storage eviction can remove records, so downloaded backups are essential. The app asks the browser to protect its storage from automatic eviction; Settings shows whether that was granted. Timer, sound, backup-reminder, focus-mode and bar-weight preferences are stored per device and are not part of the journal or its backups. Programs and goals are part of the journal and its backups.

## Scientific interpretation and scope

The app labels population equations, observational trends and product heuristics. Muscle counts represent recorded set exposure, not measured activation or biological recovery; program volume is a planned count that uses the same primary and secondary convention. Body-fat and energy values retain uncertainty. Goal projections are ranges based on recent trends, not confidence intervals or promised dates. Progression suggestions require qualifying records and are never applied automatically; program load targets are filled into a workout when it starts and can be changed before logging. Programs are general templates for generally healthy adults and do not account for injuries or medical conditions. Their rules, values and certainty are listed in `scientific-methodology.md`.

Front/back anatomy preserves licensed source geometry. The lateral view uses a historical, partly dissected reference with label points; it is not a complete segmented side model. Wearable integrations, a bespoke 3D model and clinical injury rehabilitation are outside this release. The local planner exposes preferences/limitations but does not interpret injuries. There are no food databases, nutrition services or fabricated journal records.

See `scientific-methodology.md`, `asset-provenance.md`, `verification.md`, `architecture.md`, and `info.md` for methods, sources, testing, architecture and the change log.

## Development

Current release: 1.6.0.

Native JavaScript modules; no runtime package dependencies or build step. `dist/` is the complete static application. Node.js is used only for the local server and checks.

Run `npm test` (74 tests) for scientific, program, goal, validation and encryption behavior; `npm run check` for exercise/anatomy/source/offline-asset integrity. The service worker serves cached files first and refreshes them in the background, so a changed file appears on the second load. After changing cached assets, bump the service-worker cache version and verify offline behavior.
