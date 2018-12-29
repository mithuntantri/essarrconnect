// (function() {
    'use strict';

    var origin = 'https://tidy-kangaroo-88.localtunnel.me'
    var baseUrl = origin + '/api'
    var addedObservers = false
    
    angular.module('app',['ngRoute'])
    .config(function($routeProvider, $httpProvider)
    {
        $routeProvider
        .when('/', {
            templateUrl  : 'app/views/home.html',
            controller   : 'HomeController',
            controllerAs : 'Home'
        })
        .when("/chat", {
            templateUrl  : 'app/views/chat.html',
            controller   : 'ChatController',
            controllerAs : 'Chat'
        })
        .when("/dashboard", {
            templateUrl  : 'app/views/dashboard.html',
            controller   : 'DashboardController',
            controllerAs : 'Dashboard',
            resolve: {
                getUserDetails: ['$q', 'User', function($q, User){
                    let deferred = $q.defer()
                    User.getAdminDetails().then((result)=>{
                        if(result.data.status){
                            User.AdminDetails = result.data.data
                            deferred.resolve()
                        }else{
                            deferred.reject()
                        }
                    }).catch(()=>{
                        deferred.reject()
                    })
                    return deferred.promise
                }],
                updateDeviceInfo: ['$q', 'Dashboard', function($q, Dashboard){
                    console.log("updateDeviceInfo")
                    let deferred = $q.defer()
                    let userId = localStorage.getItem('OS_userId')
                    let pushToken = localStorage.getItem('OS_pushToken')
                    console.log(userId, pushToken)
                    if(userId && pushToken){
                        Dashboard.updateDeviceInfo({userId: userId, pushToken: pushToken}).then((result)=>{
                            if(result.data.status){
                                deferred.resolve()
                            }else{
                                deferred.reject()
                            }
                        }).catch(()=>{
                            deferred.reject()
                        })
                    }else{
                        deferred.resolve()
                    }
                    return deferred.promise
                }]
            }
        })
        .otherwise ({ redirectTo: '/' });

        $httpProvider.interceptors.push('tokenInterceptor');
    })
    .run(function($rootScope, $nativeDrawer, Dashboard){
        document.addEventListener("deviceready", function () {
            StatusBar.backgroundColorByHexString('#fff');
            StatusBar.styleDefault();
            console.info("Cordova initialized with success");

             var iosSettings = {};
        iosSettings["kOSSettingsKeyAutoPrompt"] = false;
        iosSettings["kOSSettingsKeyInAppLaunchURL"] = true;

        window.plugins.OneSignal
          .startInit("467217fe-4a6f-4548-92d2-843c3cfe443a")
          .handleNotificationReceived(function(jsonData) {
            alert("Notification received: \n" + JSON.stringify(jsonData));
            console.log('Did I receive a notification: ' + JSON.stringify(jsonData));
          })
          .handleNotificationOpened(function(jsonData) {
            alert("Notification opened: \n" + JSON.stringify(jsonData));
            console.log('didOpenRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
          })
          .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.InAppAlert)
          .iOSSettings(iosSettings)
          .endInit();

        if (addedObservers == false) {
            registerForPushNotification()
            addedObservers = true;

            window.plugins.OneSignal.getPermissionSubscriptionState(function(permission){
                if(permission.subscriptionStatus.subscribed == false){
                    registerForPushNotification()
                }
            })

            window.plugins.OneSignal.addEmailSubscriptionObserver(function(stateChanges) {
                console.log("Email subscription state changed: \n" + JSON.stringify(stateChanges, null, 2));
            });

            window.plugins.OneSignal.addSubscriptionObserver(function(stateChanges) {
                console.log("Push subscription state changed: " + JSON.stringify(stateChanges, null, 2));

                window.plugins.OneSignal.getIds(function(onesignal){
                    console.log(onesignal)
                    localStorage.setItem('OS_userId', onesignal.userId)
                    localStorage.setItem('OS_pushToken', onesignal.pushToken)
                    Dashboard.updateDeviceInfo(onesignal)
                })
            });

            window.plugins.OneSignal.addPermissionObserver(function(stateChanges) {
                console.log("Push permission state changed: " + JSON.stringify(stateChanges, null, 2));
            });
        }

function registerForPushNotification() {
    console.log("Register button pressed");
    window.plugins.OneSignal.registerForPushNotifications();
    // Only works if user previously subscribed and you used setSubscription(false) below
    window.plugins.OneSignal.setSubscription(true);
}

function getIds() {
    window.plugins.OneSignal.getIds(function(ids) {
        document.getElementById("OneSignalUserId").innerHTML = "UserId: " + ids.userId;
        document.getElementById("OneSignalPushToken").innerHTML = "PushToken: " + ids.pushToken;
        console.log('getIds: ' + JSON.stringify(ids));
        alert("userId = " + ids.userId + "\npushToken = " + ids.pushToken);
    });
}

function sendTags() {
    window.plugins.OneSignal.sendTags({PhoneGapKey: "PhoneGapValue", key2: "value2"});
    alert("Tags Sent");
}

function getTags() {
    window.plugins.OneSignal.getTags(function(tags) {
        alert('Tags Received: ' + JSON.stringify(tags));
    });
}

function deleteTags() {
    window.plugins.OneSignal.deleteTags(["PhoneGapKey", "key2"]);
    alert("Tags deleted");
}

function promptLocation() {
    window.plugins.OneSignal.promptLocation();
    // iOS - add CoreLocation.framework and add to plist: NSLocationUsageDescription and NSLocationWhenInUseUsageDescription
    // android - add one of the following Android Permissions:
    // <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    // <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
}

function syncHashedEmail() {
    window.plugins.OneSignal.syncHashedEmail("example@google.com");
    alert("Email synced");
}

function postNotification() {
    window.plugins.OneSignal.getIds(function(ids) {
        var notificationObj = { contents: {en: "message body"},
                          include_player_ids: [ids.userId]};
        window.plugins.OneSignal.postNotification(notificationObj,
            function(successResponse) {
                console.log("Notification Post Success:", successResponse);
            },
            function (failedResponse) {
                console.log("Notification Post Failed: ", failedResponse);
                alert("Notification Post Failed:\n" + JSON.stringify(failedResponse, null, 2));
            }
        );
    });
}

function setSubscription() {
    window.plugins.OneSignal.setSubscription(false);
}

function setEmail() {
    console.log("Setting email: " + document.getElementById("email").value);
    window.plugins.OneSignal.setEmail(document.getElementById("email").value, function() {
        console.log("Successfully set email");
    }, function(error) {
        alert("Encountered an error setting email: \n" + JSON.stringify(error, null, 2));
    });
}

function logoutEmail() {
    console.log("Logging out of email");
    window.plugins.OneSignal.logoutEmail(function(successResponse) {
        console.log("Successfully logged out of email");
    }, function(error) {
        alert("Failed to log out of email with error: \n" + JSON.stringify(error, null, 2));
    });
}
        }, false);
    })
  .filter('getPlaceholder', ()=>{
        return((obj)=>{
            if(!obj.user_message_1){
                return 'Start a thread'
            }else if(!obj.admin_message_1){
                return 'Waiting for admin reply'
            }else if(!obj.user_message_2){
                return 'Write a reply'
            }else{
                return 'Thread is closed for reply'
            }
        })
    })

// })();