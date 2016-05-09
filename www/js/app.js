// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'ngTagsInput'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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

.controller('DashCtrl', ['$scope','$firebaseObject','$ionicPopup', function($scope, $firebaseObject, $ionicPopup) {

  //initialize the global variables for this view
  $scope.number = 0;
  $scope.post = {};
  $scope.match_options = [["Buy", "Sell"], ["Rent", "Lease"], ["Find", "Give"], ["Work", "Hire"], ["Do", "Task"], ["Join", "Recruit"], ["Meet", "Meet"]];
  $scope.post.match_toggles = new Array($scope.match_options.length).fill(false);
  $scope.post.current_match = "Lease";
  $scope.user = {};
  $scope.post.tags = [];

  getData();

  function getData() {
    var ref = new Firebase('https://gub.firebaseio.com/');
    ref.on("value", function(snapshot) {
      $scope.number = snapshot.val();
    }, function (errorObject) {});
  }


  $scope.isCurrentMatch = function(cm) {
    console.log("called isCurrentMatch\n"+cm);
    return $scope.post.current_match === cm;
  };


  $scope.setCurrentMatch = function(type) {
    console.log("calling setCurrentMatch\n"+type);
    $scope.post.current_match = type;
  };

  $scope.ToggleMatchOption = function(index) {
    $scope.post.match_toggles[index] = !$scope.post.match_toggles[index];
    for (var i = 0; i < $scope.post.match_toggles.length; i += 1) {
      if (i != index) $scope.post.match_toggles[i] = false;
    }
    console.log($scope.post.match_toggles);
  };

  var firebaseObj = new Firebase('https://gub.firebaseio.com/');
  var fb = $firebaseObject(firebaseObj);

  $scope.showAlert = function() {
    $ionicPopup.alert({
        title: 'Gub',
        template: 'Post submitted!!'
    });
  };


  $scope.pushPost = function(){
    var match = "?";
    //for (var i = 0; i < $scope.post.match_toggles.length; i += 1) {
      //if ($scope.post.match_toggles[i])
    fb.$push({
      headline: $scope.post.headline,
      description: $scope.post.description,
      category: $scope.post.category,
      start_date: $scope.post.start_date,
      end_date: $scope.post.start_date,
      match_option: $scope.post.current_match,
      object: $scope.post.object,
      tags: $scope.post.tags,
      location: {latitude: $scope.user.latitude, longtitude: $scope.user.longitude},
      description: $scope.user.desc
      }).then(function(ref){
        $scope.user = {};
        $scope.showAlert();
      }, function(error) {
        console.log("Error:", error);
    });
  };


}])


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
