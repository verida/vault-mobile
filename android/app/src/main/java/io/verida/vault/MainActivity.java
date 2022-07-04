package io.verida.vault;
import expo.modules.ReactActivityDelegateWrapper;

import android.os.Build;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import expo.modules.splashscreen.singletons.SplashScreen;
import expo.modules.splashscreen.SplashScreenImageResizeMode;

public class MainActivity extends ReactActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.AppTheme);
        super.onCreate(savedInstanceState);
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

    // @Override
    // protected ReactActivityDelegate createReactActivityDelegate() {
    //     return new ReactActivityDelegate(this, getMainComponentName()) {
    //         @Override
    //         protected ReactRootView createRootView() {
    //             return new RNGestureHandlerEnabledRootView(MainActivity.this);
    //         }
    //     };
    // }

//    /**
//    * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
//    * you can specify the rendered you wish to use (Fabric or the older renderer).
//    */
//    @Override
//    protected ReactActivityDelegate createReactActivityDelegate() {
//        return new ReactActivityDelegateWrapper(this, new MainActivityDelegate(this, getMainComponentName()) {
//            @Override
//            protected ReactRootView createRootView() {
//                return new RNGestureHandlerEnabledRootView(MainActivity.this);
//            }
//        });
//    }
//
//    public static class MainActivityDelegate extends ReactActivityDelegate {
//        public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
//            super(activity, mainComponentName);
//        }
//
//        @Override
//        protected ReactRootView createRootView() {
//            ReactRootView reactRootView = new ReactRootView(getContext());
//            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
//            reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
//            return reactRootView;
//        }
//    }


    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegateWrapper(this,
                new ReactActivityDelegate(this, getMainComponentName())
        );
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
