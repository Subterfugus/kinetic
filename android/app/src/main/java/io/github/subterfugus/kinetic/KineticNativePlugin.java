package io.github.subterfugus.kinetic;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.view.Window;
import android.view.WindowManager;
import androidx.activity.result.ActivityResult;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Native pieces the web journal cannot do inside an Android WebView. Called from dist/native.js. */
@CapacitorPlugin(name = "KineticNative")
public class KineticNativePlugin extends Plugin {

    // Matches --bg in dist/style.css for the light and dark themes.
    private static final int LIGHT_BG = Color.parseColor("#f4f2ee");
    private static final int DARK_BG = Color.parseColor("#121110");

    private boolean dark = false;

    /** WebView cannot download blob: links, so backups and CSV exports go through Android's "Save as" picker. */
    @PluginMethod
    public void saveFile(PluginCall call) {
        String name = call.getString("name", "kinetic-export");
        String type = call.getString("type", "application/octet-stream");
        if (call.getString("data") == null) {
            call.reject("Nothing to save.");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(type.split(";")[0].trim());
        intent.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, intent, "saveFileResult");
    }

    @ActivityCallback
    private void saveFileResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Uri uri = result.getData() == null ? null : result.getData().getData();
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            JSObject out = new JSObject();
            out.put("saved", false);
            call.resolve(out);
            return;
        }
        String data = call.getString("data", "");
        new Thread(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(uri, "w")) {
                if (stream == null) throw new java.io.IOException("Android could not open the chosen file.");
                stream.write(data.getBytes(StandardCharsets.UTF_8));
                JSObject out = new JSObject();
                out.put("saved", true);
                call.resolve(out);
            } catch (Exception e) {
                call.reject("The file could not be saved: " + e.getMessage(), e);
            }
        }).start();
    }

    /** Keeps the screen on during a workout; Android WebView has no Screen Wake Lock API. */
    @PluginMethod
    public void keepAwake(PluginCall call) {
        boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getBridge().executeOnMainThread(() -> {
            Window window = getActivity().getWindow();
            if (on) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            call.resolve();
        });
    }

    /** Paints the system bar areas with the journal's theme background and picks readable icons. */
    @PluginMethod
    public void setTheme(PluginCall call) {
        dark = Boolean.TRUE.equals(call.getBoolean("dark", false));
        getBridge().executeOnMainThread(() -> {
            applyTheme();
            call.resolve();
        });
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);
        // Capacitor's SystemBars resets the bars on rotation or theme changes; reapply after it runs.
        getActivity().getWindow().getDecorView().post(this::applyTheme);
    }

    private void applyTheme() {
        Window window = getActivity().getWindow();
        window.getDecorView().setBackgroundColor(dark ? DARK_BG : LIGHT_BG);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(!dark);
        controller.setAppearanceLightNavigationBars(!dark);
    }
}
