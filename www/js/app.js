// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ionic.service.core', 'firebase', 'ngTagsInput'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    var push = new Ionic.Push({
      "debug": true
    });
    push.register(function(token) {
      console.log("Device token:",token.token);
      push.saveToken(token);
    });
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

.controller('LoginCtrl', function($scope, Auth) {
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
    'Sell' : ["Art", "Collectibles", "Electronics", "Fashion", "Entertainment", "Books", "Sporting Goods", "Home and Garden", "Toys and Hobbies", "Deals and Gifts", "Tickets"],
    'Rent' : ["Space","House","Apartment","Condo", "Studio","Vehicle","Electronics"],
    'Lease' : ["Space","House","Apartment","Condo", "Studio","Vehicle","Electronics"],
    'Find' : ["Art","Collectibles","Electronics","Furniture","Fashion","Entertainment","Books","Sporting Goods","Home and Garden","Toys and Hobbies","Deals and Gifts","Tickets"],
    'Give' : ["Art","Collectibles","Electronics","Furniture","Fashion","Entertainment","Books","Sporting Goods","Home and Garden","Toys and Hobbies","Deals and Gifts","Tickets"],
    'Work' : ["Accountant", "Mechanic", "Server", "Writer", "Designer", "Consultant", "Teacher", "salesperson", "Engineer", "Developer", "Researcher", "Laborer"],
    'Hire' : ["Accountant", "Mechanic", "Server", "Writer", "Designer", "Consultant", "Teacher", "salesperson", "Engineer", "Developer", "Researcher", "Laborer"],
    'Do': ["Cleaning","Cooking","painting","yardwork","elder care","babysitting","driving","shopping"],
    'Task': ["Cleaning","Cooking","painting","yardwork","elder care","babysitting","driving","shopping"],
    'Join' : ["Band","Club","Study Group","Volunteer group","Campaign"],
    'Recruit' : ["Band","Club","Study Group","Volunteer group","Campaign"],
  };
  $scope.post.current_match = "Lease";
  $scope.user = {};
  $scope.post.tags = [];
  $scope.gotmatch = [];

  getData();

  function getData() {
    var ref = new Firebase('https://gub.firebaseio.com/');
    ref.on("value", function(snapshot) {
      $scope.number = snapshot.val();
    }, function (errorObject) {});
  }


  $scope.isCurrentMatch = function(cm) {
    // console.log("called isCurrentMatch\n"+cm);
    return $scope.post.current_match === cm;
  };


  $scope.setCurrentMatch = function(type) {
    // console.log("calling setCurrentMatch\n"+type);
    $scope.post.current_match = type;
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
      match_mode: $scope.post.current_match,
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
    var post = $scope.GeneratePostToSubmit();
    var ad_id = "";
    // generate the ref in which we should store the ad
    var mm_ref = FBRef.child("taglibrary");
    mm_ref = mm_ref.child(post.match_mode);

    // add the post on ads
    var ads_ref = FBRef.child("ads");
    var fbarray = $firebaseArray(ads_ref);
    fbarray.$add(post).then(function(the_ref){
        ad_id = the_ref.key();
        console.log(ad_id);
        // push the ad label to TagLib
        for (t in post.tags) {
          console.log(t);
          var tl_ref = mm_ref.child(post.tags[t].text);
          tl_ref.child(ad_id).set({
            tags: $scope.post.tags || null,
            location: {
              latitude: ($scope.user.latitude || null),
              longtitude: ($scope.user.longtitude || null)
            },
          });
        }
        $scope.showAlert();
      }, function(error) {
        console.log("Error:", error);
    });
    return post;
  };

  $scope.findMatch = function() {

    var post = $scope.post;
    $scope.gotmatch = [];

    console.log("Looking for matches for post: ", post);
    // find a match of this post
    var target_match_options = "";
    for (i in $scope.match_modes) {
      m = $scope.match_modes[i];
      if (post.current_match == m[0])  target_match_options = m[1];
      if (post.current_match == m[1])  target_match_options = m[0];
    }
    console.log("Looking into match option: ", target_match_options);
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
          console.log("Error:", errorObject);
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
          $scope.gotmatch.push(ad);
          console.log("Got matched ad: ", ad, " with key ", key);
        }, function(errorObject) {
          console.log("Error:", errorObject);
        });
      }
    }



  }


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
