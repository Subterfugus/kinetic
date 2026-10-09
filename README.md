# Kinetic

A device-local fitness journal with 63 curated exercises, an interactive muscle atlas, strength and cardio logging, body tracking, a literal calorie counter, planning, analytics, and offline scientific references.

## Open the app

Use the private hosted link supplied with this delivery. Open it once online and wait for **Settings → Offline** to confirm caching. Core features then work without a connection. Source links still require internet.

For a fully local copy, install Node.js from its official website if it is not already installed. Extract the complete folder and double-click **Start-Kinetic.cmd** on Windows, or run `npm start` in this folder. Open **http://127.0.0.1:4173** in your browser. Keep the server window open while first loading the app. Opening `index.html` directly is not supported because modules, storage and offline caching require an HTTP origin.

## Get started

A short welcome tour opens the first time the app runs on a device. Reopen it any time from **Settings → About → Take the welcome tour**.

1. Set your optional profile, units, equipment and goal in Settings. Energy estimates require the published equation inputs; the calorie target is separately editable.
2. Start a workout, choose exercises, and mark completed sets. Loads are prefilled from your last session of each movement, and completing a set starts the rest timer (both the automatic start and the beep can be switched off in the workout). A unilateral set row represents a completed left/right pair. Keep load conventions consistent.
3. Explore Muscle atlas. The same exercise relationships drive highlights, workout history and muscle-group set counts.
4. Log calories manually. Mark a day complete when its intake is fully recorded; incomplete days are excluded from intake averages and maintenance calibration.
5. Add weigh-ins, measurements, method-identified body-fat readings, photos, cardio, or optional wellbeing records.
6. Export a full backup regularly; Overview reminds you when this device has no backup from the last 14 days. Restore validates a backup before replacing the journal.

## Privacy and backups

Records and photos stay in IndexedDB on the current browser and origin. No health records are sent to a server, and no analytics or external data API is used. The private host serves the app files; it does not synchronize journals. Localhost and the hosted URL have separate journals. To move between browsers, devices or origins, export and restore a full backup.

The optional passphrase vault encrypts the journal and photos at rest. There is no passphrase recovery service. An unlocked browser session can read its records. Full backups are encrypted when the vault is enabled; CSV exports remain readable. Browser clearing, device loss and storage eviction can remove records, so downloaded backups are essential. The app asks the browser to protect its storage from automatic eviction; Settings shows whether that was granted. Timer, sound and backup-reminder preferences are stored per device and are not part of the journal or its backups.

## Scientific interpretation and scope

The app labels population equations, observational trends and product heuristics. Muscle counts represent recorded set exposure, not measured activation or biological recovery. Body-fat and energy values retain uncertainty. Short-range goal scenarios are illustrative, not confidence intervals or promised dates. Progression suggestions require qualifying records and are never applied automatically.

Front/back anatomy preserves licensed source geometry. The lateral view uses a historical, partly dissected reference with label points; it is not a complete segmented side model. Wearable integrations, a bespoke 3D model and clinical injury rehabilitation are outside this release. The local planner exposes preferences/limitations but does not interpret injuries. There are no food databases, nutrition services or fabricated journal records.

See `scientific-methodology.md`, `asset-provenance.md`, `verification.md`, `architecture.md`, and `info.md` for methods, sources, testing, architecture and the change log.

## Development

Native JavaScript modules; no runtime package dependencies or build step. `dist/` is the complete static application. Node.js is used only for the local server and checks.

Run `npm test` for scientific, validation and encryption tests; `npm run check` for exercise/anatomy/source/offline-asset integrity. The service worker serves cached files first and refreshes them in the background, so a changed file appears on the second load. After changing cached assets, bump the service-worker cache version and verify offline behavior.
