// index.js

// set up
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

// express modules
// var path = require('path');
var morgan = require('morgan');
var Firebase = require("firebase");

// express config
// app.use(express.static(path.join(__dirname, '/public')));     // static files location (e.g. /public/img will be /img for users)
// app.set('views', path.join(__dirname, '/public/views'));
// app.set('view engine', 'html');
// app.engine('html', require('ejs').renderFile);
// app.use(morgan('dev'));

// routing
// require('./app/routes.js')(app);


// GUB SERVER INITIALIZATION

// var config = {
//   //apiKey: "apiKey",
//   authDomain: "gub.firebaseapp.com",
//   databaseURL: "https://gub.firebaseio.com"
// };
//
// Firebase.initializeApp(config);
// console.log("app initialized");
// var FBRef = Firebase.database().ref();

var FBRef = new Firebase("https://gub.firebaseio.com");

$scope = {};
$scope.match_modes = [["Buy", "Sell"], ["Rent", "Lease"], ["Find", "Give"], ["Work", "Hire"], ["Do", "Task"], ["Join", "Recruit"], ["Meet", "Meet"]];

  // given an ad (or any json object) with match_mode, location and tags,
  // return a list of ads that can be matched
  $scope.findMatchForPost = function(user_id, post_id, post) {

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
      for (i in post.tags) {
        var ref = taglib_ref.child(post.tags[i].text);
        ref.on("value", function(snapshot) {
          snapshots = snapshot.val();
          // put the id of every valid ad into valid_ad_ids
          for (key in snapshots) {
            // can do any type check here before pushing
            if (snapshots[key].user_id != user_id) {
              if (nearInLocation(snapshots[key].location, post["location"]))
                $scope.updateThisMatch(user_id, post_id, key);
            }
          }
        },
        function(errorObject) {
          console.log("Error when getting ad ids:", errorObject);
        });
      }
    }
  };

  // a wrapper we can use to grab matched ads for many ads we posted
  //    and update the $scope.matched_ads accordingly
  $scope.findMatchForUser = function(user_id) {
    //$scope.matched_ads = findMatchForPost($scope.post);

    var matched_ads = [];
    // look into the database and scan every ad that this user have posted
    var user_ref = FBRef.child("users").child(user_id).child("postedAds");
    user_ref.on("value", function(snapshot) {
      var all_ads = snapshot.val();
      for (ad_id1 in all_ads) {
        var matched_ads = $scope.findMatchForPost(user_id, ad_id1, all_ads[ad_id1]);
        // update the match table with ad_id1 and every ad in matched_ads
        for (k in matched_ads) {
          var ad_id2 = matched_ads[k];
          // $scope.updateThisMatch(user_id, ad_id1, ad_id2);
        }
      }
    }, function(errorObject) {
      console.log("Error when getting ad ids:", errorObject);
    });
  };

  // given the args, put ad_id2: {matched_to: ad_id1} under matches/user_id1
  // user_id1 posted the ad_id1, and ad_id2 is the ad that matched to ad_id1
  $scope.updateThisMatch = function(user_id1, ad_id1, ad_id2) {
    var ref = FBRef.child("matches").child(user_id1);
    ref.child(ad_id2).set({
      matched_to : ad_id1
    });

  }

  $scope.updateAllMatches = function() {
    //$scope.clearAllMatches();

    var user_ids = [];
    var ref = FBRef.child("users");
    ref.on("value", function(snapshot) {
      snapshots = snapshot.val();
      for (key in snapshots) {
        $scope.findMatchForUser(key);
      }
    }, function(errorObject) {
      console.log("Error when getting user ids:", errorObject);
    });
    console.log("Matching completed. ");
  }

  // for debug purposes, write this to clear every matches that have been done
  $scope.clearAllMatches = function() {
    console.log("Warning: GOING TO CLEAR ALL THE MATCHES. ")
    FBRef.child("matches").set(null);
  }

  // right now we match everything as long as they are not too far away
  var nearInLocation = function(loc1, loc2) {
    if (loc1 != null && loc2 != null) {
      var dist = Math.pow((loc1.longitude - loc2.longitude), 2);
      dist += Math.pow((loc1.latitude - loc2.latitude), 2);
      dist = Math.sqrt(dist);
      if (dist > 100) {   // some random distance
        return false;
      }
    }
    return true;
  }



app.listen(port);
console.log("APP LISTENING: PORT " + port);

$scope.updateAllMatches();

console.log("All matches updated");
