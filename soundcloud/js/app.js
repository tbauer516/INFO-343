'use strict';

var CLIENT_ID = '4dea91decc70859e3b9f8213aff39870' //application ID for requests

SC.initialize({
  client_id: CLIENT_ID,
  redirect_uri: 'http://students.washington.edu/tbauer16/info343/challenges/soundcloud/callback.html'
  // redirect_uri: 'http://localhost:8000/soundcloud/callback.html'
});

//website we fetch information from
var BASE_URL = 'https://api.soundcloud.com';

var myApp = angular.module('myApp', [])
.config(function($sceProvider) {
	$sceProvider.enabled(false);
})
.controller('MyCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) { 

	// initiate auth popup for login
	$scope.login = function() {
		SC.connect().then(function() {
  			return SC.get('/me');
		}).then(function(me) {			
			$scope.$apply(function() {
				$scope.user = me;
			});
		});
	}

    //function called to fetch tracks based on the scope's query
    $scope.getTracks = function() {	
      	var request = BASE_URL + '/tracks' + '?' +'client_id='+ CLIENT_ID + '&q=' + $scope.query + '&limit=100'; //build the RESTful request
      		$http.get(request) //Angular AJAX call
        .then(function (response) {
          	$scope.tracks = response.data;
        });
	}

	// function to create a timeout for the search to prevent a large
	// number of unneccessary AJAX calls
	var timeoutPromise;
	$scope.search = function(valid) {
		if (valid) {
	  		$timeout.cancel(timeoutPromise);
	  		timeoutPromise = $timeout(function() {
	  			$scope.getTracks();
	  		}, 1000);
  		}
	}

	$scope.currentSong = 0;

	// creates a small player for the song retreived
	$scope.player = function(track, id) {
		$scope.currentSong = track.id;
		var  obj = document.getElementById(id);
		var track_url = track.permalink_url;
		SC.oEmbed(track_url, { element: obj, show_comments: false, maxheight: 150, auto_play: true }).then(function(oEmbed) {
			oEmbed.html = oEmbed.html.replace('auto_play=true', 'auto_play=false');
			track.player = oEmbed;
		});
	}

	$scope.listPopulated = false;
	$scope.songList = [];

	// adds a song to the right side bar for later use
	$scope.addToList = function(track) {
		$scope.listPopulated = true;
		$scope.songList.push(track);
	}

	// gathers if the list on the right contains any elements
	$scope.listSize = function() {
		return $scope.listPopulated;
	}

	// attempts to favorite a song
	// no matter what I tried, I always get a 401 error
	$scope.favorite = function(track) {
		var fav = '/users/' + $scope.user.id + '/favorites/';
		$http.put(BASE_URL + fav + track.id);
	}

	// attempts to follow a user
	// no matter what I tried, I always get a 401 error
	$scope.follow = function(track) {
		var follow = '/users/' + $scope.user.id + '/followings/';
		$http.put(BASE_URL + follow + track.user_id);
	}

	// $scope.favorite = function(track) {
	// 	var fav = '/me/favorites/';
	// 	SC.connect().then(function() {
	//         return SC.get('/me');
	//     }).then(function(me) {
	// 		SC.put(fav + track.id);
	//     });
	// }

	// $scope.follow = function(track) {
	// 	var follow = '/me/followings/';
	// 	SC.connect().then(function() {
	//         return SC.get('/me');
	//     }).then(function(me) {
	// 		SC.put(follow + track.user_id);
	//     });
	// }

}]);