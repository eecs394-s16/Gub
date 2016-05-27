// index.js

// set up
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

// express modules
// var path = require('path');
var morgan = require('morgan');
var Firebase = require("firebase");
var request = require("request");

// express config
// app.use(express.static(path.join(__dirname, '/public')));     // static files location (e.g. /public/img will be /img for users)
// app.set('views', path.join(__dirname, '/public/views'));
// app.set('view engine', 'html');
// app.engine('html', require('ejs').renderFile);
// app.use(morgan('dev'));

// routing
// require('./app/routes.js')(app);


// GUB SERVER INITIALIZATION


var FBRef = new Firebase("https://gub.firebaseio.com");
var global = {};
global.match_modes = [["Buy", "Sell"], ["Rent", "Lease"], ["Find", "Give"], ["Work", "Hire"], ["Do", "Task"], ["Join", "Recruit"], ["Meet", "Meet"]];


sendNotifToUser = function(user_id1, user_id2) {
  // send notification to the user user_id1, saying it's matched with ad_id2

  // just don't want to bother everybody every time I test this
  if (global.turn_off_notif) {
    return;
  }

  FBRef.child("users").child(user_id1).on("value", function(snapshot) {
    var user1 = snapshot.val();
    var device_id1 = user1.deviceToken;
    if (device_id1 == null) {
      console.log("User ", user_id1, " has no device token");
    }
    var options = {
      'url' : 'https://gcm-http.googleapis.com/gcm/send',
      'method' : "POST",
      'headers' : {
        'Authorization': 'key=AIzaSyBMUXhP_jdUVOOC8Rsdc6BG6lfSZwc4jUs',
        'Content-Type': 'application/json',
      },
      'json' : {
        'registration_ids' : [device_id1],
        'data' : {
          'title' : "Notif from Gub",
          'body' : "You are matched with another user",
          'target_user_id' : user_id2
        }
      }
    }
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
      } else {
        console.log(error);
      }
    });
  },
  function(errorObject) {
    console.log("Error when getting user profile:", errorObject);
  });
}

  // given the args, put ad_id2: {matched_to: ad_id1} under matches/user_id1
  // user_id1 posted the ad_id1, and ad_id2 is the ad that matched to ad_id1
  var updateThisMatch = function(user_id1, user_id2, ad_id1, ad_id2) {
    var ref = FBRef.child("matches").child(user_id1);
    ref.child(ad_id2).child("matched_to").set(ad_id1);
    sendNotifToUser(user_id1, user_id2);
  }

  // given an ad (or any json object) with match_mode, location and tags,
  // return a list of ads that can be matched
  var findMatchForPost = function(user_id, post_id, post) {

    var matched_ads = [];

    // find a match of this post
    var target_match_options = "";
    for (i in global.match_modes) {
      m = global.match_modes[i];
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
            var the_ad = snapshots[key];

            // can do any type check here before the match
            var make_match = the_ad.user_id != user_id;
            make_match = make_match && nearInLocation(the_ad.location, post["location"]);

            if (make_match) {
              updateThisMatch(user_id, the_ad.user_id, post_id, key);
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
  //    and update the var matched_ads accordingly
  var findMatchForUser = function(user_id) {
    //var matched_ads = findMatchForPost(var post);

    // look into the database and scan every ad that this user have posted
    var user_ref = FBRef.child("users").child(user_id).child("postedAds");
    user_ref.on("value", function(snapshot) {
      var all_ads = snapshot.val();
      for (ad_id1 in all_ads) {
        findMatchForPost(user_id, ad_id1, all_ads[ad_id1]);
      }
    }, function(errorObject) {
      console.log("Error when getting ad ids:", errorObject);
    });
  };

  var updateAllMatches = function() {
    //clearAllMatches();

    var user_ids = [];
    var ref = FBRef.child("users");
    ref.on("value", function(snapshot) {
      snapshots = snapshot.val();
      for (key in snapshots) {
        findMatchForUser(key);
      }
    }, function(errorObject) {
      console.log("Error when getting user ids:", errorObject);
    });
    console.log("Matching completed. ");
  }

  // for debug purposes, write this to clear every matches that have been done
  var clearAllMatches = function() {
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


// GUB SERVER EXECUTION

//sendNotif();

global.turn_off_notif = true;

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    var str = d.toString().trim();
    if (str == "clear") {
      clearAllMatches();
    } else if (str == "match") {
      updateAllMatches();
    } else {
      console.log("Command not found :(");
    }
    console.log("Enter next command: ");
  });

console.log("Enter next command: ");
