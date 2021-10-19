#import <Foundation/Foundation.h>
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

#import <UMCore/UMAppDelegateWrapper.h>
#import <UserNotifications/UNUserNotificationCenter.h>

@interface AppDelegate : UMAppDelegateWrapper <RCTBridgeDelegate, UNUserNotificationCenterDelegate>

@end
