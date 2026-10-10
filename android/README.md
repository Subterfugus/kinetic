# Kinetic for Android

`android/` is a [Capacitor](https://capacitorjs.com) shell around the web app in `dist/`. The APK carries every file in `dist/`, so it runs without a connection from the first launch. Journal records stay in the app's own storage on the phone.

## Install on a phone

1. On the phone, open the repository's **Releases** page on GitHub and download `Kinetic-<version>.apk` from the newest release.
2. Open the downloaded file. Android asks to allow installs from your browser or Files app the first time; allow it for that app.
3. Tap **Install**, then **Open**.

Updating works the same way: install the newer APK over the old one. Your journal is kept as long as both APKs were signed with the same key (see **Signing** below).

Uninstalling the app deletes the journal on that phone. Export a full backup from **Settings** first. Backups and CSV exports open Android's save dialog, so you choose where the file goes (Downloads, Drive, and so on).

## What differs from the browser version

- **Camera**: the photo studio asks for camera permission the first time **Take photo** is used.
- **Saving files**: backups and CSV exports use Android's save dialog instead of a browser download.
- **Back button**: closes an open dialog, focus mode or the menu first, then goes back through pages, then leaves the app.
- **Screen stays on** in focus mode during a workout, as in the browser.
- **No Android cloud backup**: Android's automatic backup is turned off so records never leave the phone. Use Kinetic's own backup to move to a new phone.
- **Offline**: no service worker is needed. Settings → Offline says the app files are on the device.
- Evidence source links open in the phone's browser.

## Build it yourself

Requires Node.js 22, JDK 21 and the Android SDK (Android Studio installs it).

```sh
npm ci
npm run android:apk        # APK at android/app/build/outputs/apk/release/app-release.apk
```

`npm run android:sync` copies `dist/` into the Android project; run it after changing the web app if you build from Android Studio (`npx cap open android`).

The Android version number comes from `package.json` (1.5.0 becomes versionCode 10500).

## Releases from GitHub

`.github/workflows/android.yml` builds the APK on every pull request (download it from the run's **Artifacts**).

Releases publish themselves: when a push to `main` carries a `package.json` version that has no GitHub Release yet, the workflow creates the release `v<version>` on that commit and attaches the APK twice, as `Kinetic-<version>.apk` and as `Kinetic.apk` (the fixed name the README's download button uses). To ship a new version, bump `version` in `package.json` and merge. Pushes that keep the same version build the APK but publish nothing. Pushing a matching tag by hand, such as `v1.5.0`, still works too.

## Signing

Android only installs an update over an existing app when both were signed with the same key. Without a key the workflow signs each build with a throwaway key, which installs fine on a fresh phone but cannot update an earlier install; the phone says the app is not installed, and the only way forward is to uninstall, which deletes the journal.

To give every release the same key, create one once and add four repository secrets (**Settings → Secrets and variables → Actions**):

```sh
keytool -genkeypair -v -keystore kinetic.jks -alias kinetic -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 kinetic.jks    # value for KINETIC_KEYSTORE_BASE64
```

| Secret | Value |
| --- | --- |
| `KINETIC_KEYSTORE_BASE64` | the base64 text of `kinetic.jks` |
| `KINETIC_KEYSTORE_PASSWORD` | the keystore password |
| `KINETIC_KEY_ALIAS` | `kinetic` |
| `KINETIC_KEY_PASSWORD` | the key password |

Keep `kinetic.jks` and its passwords somewhere safe outside the repository. If the key is lost, the next release cannot update existing installs.
