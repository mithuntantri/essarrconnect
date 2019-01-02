// (function() {
    'use strict';

    var origin = 'http://essarrautomotives.com'
    var baseUrl = origin + '/api'
    
    var addedObservers = false;
    
    angular.module('app',['ngRoute'])
    .config(function($routeProvider, $httpProvider)
    {
        $routeProvider
        .when('/', {
            templateUrl  : 'app/views/home.html',
            controller   : 'HomeController',
            controllerAs : 'Home'
        })
        .when("/targets", {
            templateUrl  : 'app/views/targets.html',
            controller   : 'TargetsController',
            controllerAs : 'Targets'
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
                    User.getUserDetails().then((result)=>{
                        if(result.data.status){
                            User.UserDetails = result.data.data
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
                }],
                getTargetDetails: ['$q', 'Dashboard', function($q, Dashboard){
                    let defer = $q.defer()
                    Dashboard.getAllTargets().then((result)=>{
                        if(result.data.status){
                            Dashboard.AllTargets = result.data.data.targets
                            defer.resolve()
                        }else{
                            defer.reject()
                        }
                    })
                    return defer.promise
                }]
            }
        })
        .when('/calendar', {
            templateUrl: "app/views/calendar.html",
            controller: 'CalendarController',
            controllerAs: 'Calendar',
            resolve: {
                getHolidays: ['$q', 'Dashboard', function($q, Dashboard){
                    let deferred = $q.defer()
                    Dashboard.getHolidays().then((result)=>{
                        if(result.data.status){
                            Dashboard.AllHolidays = result.data.data
                            deferred.resolve()
                        }else{
                            deferred.reject()
                        }
                    }).catch(()=>{
                        deferred.reject()
                    })
                    return deferred.promise
                }],
                getLeaves: ['$q', 'Dashboard', function($q, Dashboard){
                    let deferred = $q.defer()
                    Dashboard.getLeaves().then((result)=>{
                        if(result.data.status){
                            Dashboard.AllLeaves = result.data.data
                            deferred.resolve()
                        }else{
                            deferred.reject()
                        }
                    }).catch(()=>{
                        deferred.reject()
                    })
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
            if(obj.status){
                return 'Thread is closed by admin'
            }else if(!obj.user_message_1){
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
    function onDeviceReady() {
          BackgroundGeolocation.configure({
            locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 50,
            distanceFilter: 50,
            notificationTitle: 'Punch Attendance',
            notificationText: 'Enabled',
            debug: false,
            interval: 3600000,
            stopOnTerminate: false,
            startOnBoot: true,
            stopOnStillActivity: false,
            fastestInterval: 3600000,
            notificationsEnabled: false,
            activitiesInterval: 3600000,
            url: `${baseUrl}/user/location`,
            httpHeaders: {
              'X-FOO': 'bar',
              'Authorization': 'JWT ' + localStorage.getItem('token')
            },
            // customize post properties
            postTemplate: {
              lat: '@latitude',
              lon: '@longitude',
              acc: '@accuracy',
              alt: '@altitude',
              speed: '@speed' // you can also add your own properties
            }
          });
 
          BackgroundGeolocation.on('location', function(location) {
            console.log("on location", location)
            // handle your locations here
            // to perform long running operation on iOS
            // you need to create background task
            BackgroundGeolocation.startTask(function(taskKey) {
              // execute long running task
              // eg. ajax post location
              // IMPORTANT: task has to be ended by endTask
              BackgroundGeolocation.endTask(taskKey);
            });
          });
         
  BackgroundGeolocation.on('stationary', function(stationaryLocation) {
    // handle stationary locations here
  });
 
  BackgroundGeolocation.on('error', function(error) {
    console.log('[ERROR] BackgroundGeolocation error:', error.code, error.message);
  });
 
  BackgroundGeolocation.on('start', function() {
    console.log('[INFO] BackgroundGeolocation service has been started');
  });
 
  BackgroundGeolocation.on('stop', function() {
    console.log('[INFO] BackgroundGeolocation service has been stopped');
  });
 
  BackgroundGeolocation.on('authorization', function(status) {
    console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
    if (status !== BackgroundGeolocation.AUTHORIZED) {
      // we need to set delay or otherwise alert may not be shown
      setTimeout(function() {
        var showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
        if (showSetting) {
          return BackgroundGeolocation.showAppSettings();
        }
      }, 1000);
    }
  });
 
  BackgroundGeolocation.on('background', function() {
    console.log('[INFO] App is in background');
    // you can also reconfigure service (changes will be applied immediately)
    BackgroundGeolocation.configure({ debug: false });
  });
 
  BackgroundGeolocation.on('foreground', function() {
    console.log('[INFO] App is in foreground');
    BackgroundGeolocation.configure({ debug: false });
  });
 
  BackgroundGeolocation.on('abort_requested', function() {
    console.log('[INFO] Server responded with 285 Updates Not Required');
 
    // Here we can decide whether we want stop the updates or not.
    // If you've configured the server to return 285, then it means the server does not require further update.
    // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
    // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
  });
 
  BackgroundGeolocation.on('http_authorization', () => {
    console.log('[INFO] App needs to authorize the http requests');
  });
 
  BackgroundGeolocation.checkStatus(function(status) {
    console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
    console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
    console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
 
    // you don't need to check status before start (this is just the example)
    if (!status.isRunning) {
      BackgroundGeolocation.start(); //triggers start on start event
    }
  });
 
  // you can also just start without checking for status
  // BackgroundGeolocation.start();
 
  // Don't forget to remove listeners at some point!
  // BackgroundGeolocation.removeAllListeners();
}
 
document.addEventListener('deviceready', onDeviceReady, false);
// })();