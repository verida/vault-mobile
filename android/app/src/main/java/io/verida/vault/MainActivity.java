package io.verida.vault;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.graphics.Color;
import android.view.Window;
// import android.view.WindowInsetsController;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import expo.modules.splashscreen.singletons.SplashScreen;
import expo.modules.splashscreen.SplashScreenImageResizeMode;

public class MainActivity extends ReactActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.AppTheme);


        // Set the status bar and navigation bar to transparent and
        // allow drawing underneath them

        Window w = getWindow();
        w.setStatusBarColor(Color.TRANSPARENT);
        w.setNavigationBarColor(Color.TRANSPARENT);

        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            w.setDecorFitsSystemWindows(false);
            // Note: This will be deprecated in Vanilla Ice Cream as this will
            // be the default behaviour. Same for the setXxxColor to transparent
        }

        super.onCreate(null);

        // get the root view and activate touch filtering to prevent tap jacking
        View v = findViewById(android.R.id.content);
        v.setFilterTouchesWhenObscured(true);

        SplashScreen.show(this, SplashScreenImageResizeMode.COVER, ReactRootView.class, false);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "main";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
     * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
                this,
                getMainComponentName(),
                // If you opted-in for the New Architecture, we enable the Fabric Renderer.
                DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }
    /**
     * Align the back button behavior with Android S
     * where moving root activities to background instead of finishing activities.
     * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
     */
    @Override
    public void invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            if (!moveTaskToBack(false)) {
                // For non-root activities, use the default implementation to finish them.
                super.invokeDefaultOnBackPressed();
            }
            return;
        }

        // Use the default back button implementation on Android S
        // because it's doing more than {@link Activity#moveTaskToBack} in fact.
        super.invokeDefaultOnBackPressed();
    }
}
