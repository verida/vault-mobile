#import <Foundation/Foundation.h>
#import <Expo/Expo.h>
#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>
#import <UserNotifications/UNUserNotificationCenter.h>

@interface AppDelegate : RCTAppDelegate<UNUserNotificationCenterDelegate> //EXAppDelegateWrapper <RCTAppDelegate, UNUserNotificationCenterDelegate>

@end
