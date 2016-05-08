angular.module('starter.controllers', ['ionic', 'firebase', 'ngTagsInput'])

.controller('DashCtrl', ['$scope','$firebase','$ionicPopup', function($scope, $firebase, $ionicPopup) {

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
  var fb = $firebase(firebaseObj);

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

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});'ionic'

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

/*
.controller('MapCtrl', ['$scope','$firebase','$ionicPopup', function($scope,$firebase,$ionicPopup) {
  $scope.user = {test: "test"};
  var firebaseObj = new Firebase('https://gub.firebaseio.com/');
  var fb = $firebase(firebaseObj);
  $scope.showAlert = function() {
    $ionicPopup.alert({
        title: 'Gub',
        template: 'Your location has been saved!!'
    });
  };
  $scope.saveDetails = function(){
    var lat = $scope.user.latitude;
    var lgt = $scope.user.longitude;
    var des = $scope.user.desc;
    fb.$push({latitude: lat, longitude: lgt, description: des
      }).then(function(ref){
        $scope.user = {};
        $scope.showAlert();
      }, function(error) {
        console.log("Error:", error);
    });
  }
}])
*/

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
})

;
