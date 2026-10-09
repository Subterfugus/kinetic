# Verification record

Verified October 8, 2026. Browser QA used a separate localhost origin with explicitly authored disposable records. The delivery contains no sample journal or seeded personal data.

## Automated

- 22 tests passed: published equation coefficients/domains, effort-gated Epley, assistance semantics, gross/net MET energy, heart-rate methods, calendar-based smoothing/slope, complete-day handling, stable-weight maintenance calibration, timeline limits, composition, shared bench-press relationships, frequency/warm-up exclusions, records/progression, equipment substitutions, correlations, backup validation, and encrypted round-trip/wrong-passphrase/tamper rejection.
- Integrity passed: 63 movements, 20 groups, 139 mapped anatomical paths, 21 references and all offline assets.
- JavaScript syntax checks passed.

## Browser workflows

- Desktop and 375-pixel mobile layouts; navigation opens/closes and hides inactive mobile navigation from keyboard focus.
- Exercise search, technique details and equipment-aware substitutions.
- Calorie creation/editing, target/remaining values and complete-day status.
- Weigh-in persistence after reload; displayed RMR 1,780 and maintenance 2,492 kcal/day matched age 30, height 180 cm, mass 80 kg and male coefficient with factor 1.4.
- Bench session with one warm-up and two completed work sets: chest primary 2, triceps secondary 2, one training day; the warm-up was excluded. Performance showed 60 kg best load and 80 kg qualifying estimated 1RM.
- Atlas front/back/lateral selection and shared session history; lateral deltoid panel reports distinct anterior/lateral/posterior groups.
- Walking: 30 minutes, 3 km, 4.8 MET, 80 kg → 6 km/h, 10 min/km, gross 192 and net 152 kcal; no target calorie addition.
- Equipment-aware routine saved and scheduled; unavailable pulling equipment is explicitly identified.
- Full backup downloaded, parsed and restored with validation confirmation.
- Body-fat 20% paired with 80 kg → estimated fat mass 16 kg and non-fat mass 64 kg, with unknown uncertainty visible.
- Photo input rejected an image over 10 MB and accepted a small QA screenshot; resulting photo saved locally.
- WebMCP staging tool opened the real calorie dialog; unexpected input was rejected and opened no dialog.
- Stopped the QA server, then reloaded the app successfully from service-worker cache. Atlas geometry, saved session statistics, reference search and full Mifflin summary remained available.

## Limits of verification

This is release verification, not an independent security penetration test, clinical validation or a systematic review of all exercise biomechanics. Passphrase changes were tested at the cryptographic function level, rather than entering credentials through browser automation. The host's private access is enforced by Sites; the journal's isolation is implemented locally. Browser storage can still be lost, so backups are part of the normal workflow.
