// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ionic.service.core', 'firebase', 'ngTagsInput'])

.run(function($rootScope, $ionicPlatform) {
  $ionicPlatform.ready(function() {

    // PUSH NOTIFICATION THINGS
    var push = new Ionic.Push({
      "debug": true
    });
    push.register(function(token) {
      console.log("Device token:",token.token);
      push.saveToken(token);
      $rootScope.deviceToken = token.token;
    });

    
    // Get a reference to the plugin.
    var bgGeo = window.BackgroundGeolocation;


    //This callback will be executed every time a geolocation is recorded in the background.
    var callbackFn = function(location, taskId) {
        var coords = location.coords;
        var lat    = coords.latitude;
        var lng    = coords.longitude;
        console.log('- Location: ', JSON.stringify(location));

        // Must signal completion of your callbackFn.
        bgGeo.finish(taskId);
    };

    // This callback will be executed if a location-error occurs.  Eg: this will be called if user disables location-services.
    var failureFn = function(errorCode) {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
    }

    // Listen to location events & errors.
    bgGeo.on('location', callbackFn, failureFn);

    // Fired whenever state changes from moving->stationary or vice-versa.
    bgGeo.on('motionchange', function(isMoving) {
      console.log('- onMotionChange: ', isMoving);
    });

    // BackgroundGeoLocation is highly configurable.
    bgGeo.configure({
        // Geolocation config
        // desiredAccuracy: 0,
        // distanceFilter: 10,
        // stationaryRadius: 50,
        // locationUpdateInterval: 1000,
        // fastestLocationUpdateInterval: 5000,

        // Activity Recognition config
        // activityType: 'AutomotiveNavigation',
        // activityRecognitionInterval: 5000,
        // stopTimeout: 5,

        // Application config
        debug: true,
        stopOnTerminate: false,
        startOnBoot: true,
    }, function(state) {
        // This callback is executed when the plugin is ready to use.
        console.log('BackgroundGeolocation ready: ', state);
        if (!state.enabled) {
            bgGeo.start();
        }
    });

    // The plugin is typically toggled with some button on your UI.

  

    // OTHER CORDOVA THINGS
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

})

.factory('Auth', function($firebaseAuth) {
  var usersRef = new Firebase("https//gub.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})

.factory("FBRef", function($firebaseArray) {
  var itemsRef = new Firebase("https://gub.firebaseio.com");
  return itemsRef;
})

.controller('LoginCtrl', function($rootScope, $scope, $ionicPlatform, Auth, FBRef) {

  $scope.login = function() {
    Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      // User successfully logged in
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData) {
          // User successfully logged in. We can log to the console
          // since we’re using a popup here
        });
      } else {
        // Another error occurred
        console.log(error);
      }
    });
  };

  $scope.logout = function() {
    Auth.$unauth();
  };

  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("Not logged in yet");
    } else {
      console.log("Logged in as", authData.uid);

      var users_ref = FBRef.child("users");
      var me = users_ref.child(authData.facebook.id);

      $ionicPlatform.ready(function() {
        me.child("deviceToken").set($rootScope.deviceToken);
        console.log("Successfully pushed device token " + $rootScope.deviceToken + " for user " + authData.uid + " to Firebase");
      });
      
    }
    $scope.authData = authData;
  });

})

.controller('DashCtrl', function($scope, $firebaseArray, $ionicPopup, FBRef) {

  //initialize the global variables for this view
  $scope.number = 0;
  $scope.post = {};

  // hardcoding the options of every match mode
  $scope.match_modes = [["Buy", "Sell"], ["Rent", "Lease"], ["Find", "Give"], ["Work", "Hire"], ["Do", "Task"], ["Join", "Recruit"], ["Meet", "Meet"]];
  $scope.match_categories = {
    'Buy': ["Art", "Collectibles", "Electronics", "Fashion", "Entertainment", "Books", "Sporting Goods", "Home and Garden", "Toys and Hobbies", "Deals and Gifts", "Tickets"],
    'Rent' : ["Space","House","Apartment","Condo", "Studio","Vehicle","Electronics"],
    'Find' : ["Art","Collectibles","Electronics","Furniture","Fashion","Entertainment","Books","Sporting Goods","Home and Garden","Toys and Hobbies","Deals and Gifts","Tickets"],
    'Work' : ["Accountant", "Mechanic", "Server", "Writer", "Designer", "Consultant", "Teacher", "salesperson", "Engineer", "Developer", "Researcher", "Laborer"],
    'Do': ["Cleaning","Cooking","painting","yardwork","elder care","babysitting","driving","shopping"],
    'Join' : ["Band","Club","Study Group","Volunteer group","Campaign"],
    'Meet' : ["Meet"],
  };
  for (i in $scope.match_modes) {
    $scope.match_categories[$scope.match_modes[i][1]] = $scope.match_categories[$scope.match_modes[i][0]];
  }

  // initialize some options
  $scope.post.match_mode = "Lease";
  $scope.user = {};
  $scope.post.tags = [];
  $scope.matched_ads = [];

  getData();

  function getData() {
    var ref = new Firebase('https://gub.firebaseio.com/');
    ref.on("value", function(snapshot) {
      $scope.number = snapshot.val();
    }, function (errorObject) {});
  }


  $scope.isCurrentMatch = function(cm) {
    // console.log("called isCurrentMatch\n"+cm);
    return $scope.post.match_mode === cm;
  };


  $scope.setCurrentMatch = function(type) {
    // console.log("calling setCurrentMatch\n"+type);
    $scope.post.match_mode = type;
  };


  $scope.showAlert = function() {
    $ionicPopup.alert({
        title: 'Gub',
        template: 'Post submitted!!'
    });
  };

  $scope.GeneratePostToSubmit = function() {
    var post = {
      user_id: $scope.authData.facebook.id,
      headline: $scope.post.headline,
      description: $scope.post.description || null,
      category: $scope.post.category,
      start_date: ($scope.post.start_date ? $scope.post.start_date.toString() : null),
      end_date: ($scope.post.end_date ? $scope.post.end_date.toString() : null),
      match_mode: $scope.post.match_mode,
      object: $scope.post.object || null,
      tags: $scope.post.tags || null,
      location: {
        latitude: ($scope.user.latitude || null),
        longtitude: ($scope.user.longtitude || null)
      },
    };
    console.log(post);
    return post;
  }


  $scope.pushPost = function(){
    if (!($scope.post.headline && $scope.post.description && $scope.post.category)) {
      $ionicPopup.alert({
          title: 'Gub Error',
          template: 'Please make sure you filled out the headline, the description and the category. '
      });
      return;
    }
    var ad_entry = $scope.GeneratePostToSubmit();
    var ad_id = "";
    // generate the ref in which we should store the ad
    var mm_ref = FBRef.child("taglibrary");
    mm_ref = mm_ref.child(ad_entry.match_mode);

    // add the post on ads
    var ads_ref = FBRef.child("ads");
    var fbarray = $firebaseArray(ads_ref);
    fbarray.$add(ad_entry).then(function(the_ref){
        ad_id = the_ref.key();
        console.log(ad_id);

        // push the ad id to TagLib
        for (t in ad_entry.tags) {
          console.log(t);
          var tl_ref = mm_ref.child(ad_entry.tags[t].text);
          tl_ref.child(ad_id).set({
            tags: ad_entry.tags || null,
            location: {
              latitude: (ad_entry.location.latitude || null),
              longtitude: (ad_entry.location.longtitude || null)
            },
          });
        }

        // push the ad id to UserProfile, to keep track of all ads that he posted
        // record the match_mode, category and tags here for later search
        var user_ref = FBRef.child("users");
        user_ref = user_ref.child($scope.authData.facebook.id);
        user_ref.child("name").set($scope.authData.facebook.displayName);
        user_ref = user_ref.child("postedAds");
        user_ref.child(ad_id).set({
          match_mode : ad_entry.match_mode,
          category : ad_entry.category,
          tags : ad_entry.tags
        });

        $scope.showAlert();
      }, function(error) {
        console.log("Error:", error);
    });
    return ad_entry;
  };

  // given an ad (or any json object) with match_options and tags,
  // return a list of ads that can be matched
  $scope.findMatchForPost = function(post) {

    console.log("Looking for matches for post: ", post);
    var matched_ads = [];

    // find a match of this post
    var target_match_options = "";
    for (i in $scope.match_modes) {
      m = $scope.match_modes[i];
      if (post.match_mode == m[0])  target_match_options = m[1];
      if (post.match_mode == m[1])  target_match_options = m[0];
    }

    if (target_match_options) {
      // do the search in the firebase
      // right now just match all the ads that have one tag in common
      var taglib_ref = FBRef.child("taglibrary");
      taglib_ref = taglib_ref.child(target_match_options);
      var valid_ad_ids = [];
      for (i in post.tags) {
        var ref = taglib_ref.child(post.tags[i].text);
        ref.on("value", function(snapshot) {
          snapshots = snapshot.val();
          // put the id of every valid ad into valid_ad_ids
          for (key in snapshots) {
            // can do any type check here before pushing
            valid_ad_ids.push(key);
          }
          console.log(valid_ad_ids);
        }, function(errorObject) {
          console.log("Error when getting ad ids:", errorObject);
        });
      }
      valid_ad_ids = valid_ad_ids.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
      })


      // for every ad id, retrieve the actual ad
      adsref = FBRef.child("ads");
      for (i in valid_ad_ids) {
        var key = valid_ad_ids[i];
        ref = adsref.child(key);
        ref.on("value", function(snapshot) {
          var ad = snapshot.val();
          matched_ads.push(ad);
        }, function(errorObject) {
          console.log("Error when retrieving the ad:", errorObject);
        });
      }
    }
    return matched_ads;
  };

  // a wrapper we can use to grab matched ads for many ads we posted
  //    and update the $scope.matched_ads accordingly
  $scope.findMatch = function() {
    //$scope.matched_ads = findMatchForPost($scope.post);

    // look into the database and scan every ad that this user have posted
    console.log($scope.authData.facebook.id);
    var user_ref = FBRef.child("users").child($scope.authData.facebook.id).child("postedAds");
    user_ref.on("value", function(snapshot) {
      var all_ads = snapshot.val();
      for (k in all_ads) {
        var matched_ads = $scope.findMatchForPost(all_ads[k]);
        console.log(matched_ads);
        $scope.matched_ads = $scope.matched_ads.concat(matched_ads);
      }
    }, function(errorObject) {
      console.log("Error when getting ad ids:", errorObject);
    });
  };


})

.directive('map', function() {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){

          var zValue = scope.$eval(attrs.zoom);
          var lat = scope.$eval(attrs.lat);
          var lng = scope.$eval(attrs.lng);
          var myLatlng = new google.maps.LatLng(lat,lng),
          mapOptions = {
                zoom: zValue,
                center: myLatlng
            },
          map = new google.maps.Map(element[0],mapOptions);
          marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            draggable:true
          })
          google.maps.event.addListener(marker, 'dragend', function(evt){
            scope.$parent.user.latitude = evt.latLng.lat();
            scope.$parent.user.longitude = evt.latLng.lng();
            scope.$apply();

          });

        }
    };
});
