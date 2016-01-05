'use strict';

$(function() {

	// main map object reference centered on US.
	var map = L.map('map-container').setView([39.47, -97.91], 4);

	// uses mapbox tile layer for the map background.
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'tbauer516.cifo53zbmgx6ts4m7130rcxwi',
	    accessToken: 'pk.eyJ1IjoidGJhdWVyNTE2IiwiYSI6ImNpZm81NDBxODRiaW5zaWtxMXBpbDhlb3MifQ.9k3rGZvcs_T6ooPDwpaKNQ'
	}).addTo(map);

	//gets the deadspin JSON file and uses the callback function
	// parseData once the data loads.
	$.getJSON('data/data.min.json').then(parseData);

	// function that parses the JSON file and populates the map
	// with circles, which are added to layer groups and finally
	// add a map control structure.
	function parseData(data) {
		var races = {
			"Unknown": L.layerGroup()
		};
		for (var i = 0; i < data.length; i++) {
			var tempToAdd = races["Unknown"];
			if ("race" in data[i]["victim"]) {
				var raceName = data[i]["victim"]["race"];
				if (races[raceName] == undefined) {
					races[raceName] = L.layerGroup();
				}
				tempToAdd = races[raceName];
			}
			// sets default color to green if the victim has no known gender
			var colr = 'green';
			if ("gender" in data[i]["victim"]) {
				var gender = data[i]["victim"]["gender"];
				if (gender == 'Female') {
					colr = 'red';
				} else if (gender == 'Male') {
					colr = 'blue';
				}
			}
			var circle = L.circle([data[i].lat, data[i].lng], 50000, {
					color: colr,
					className: data[i]["outcome"],
					fillOpacity: 0.2,
					opacity: 0.2,
					weight: 2,
					fillRule: 'nonzero'});
			var message = 'OUTCOME: ' + data[i]["outcome"]
				+ '<br>' + 'GENDER: '
				+ data[i]["victim"]["gender"]
				+ '<br>' + 'VICTIM\'S WEAPON: '
				+ data[i]["weapon"]
				+ '<br>' + data[i]["summary"]
				+ '<br>' + '<a href=\"' + data[i]["sourceUrl"]
				+ '\">Link</a>';
			
			circle.bindPopup(message);
			tempToAdd.addLayer(circle);
		}
		L.control.layers(null, races).addTo(map);
	};

	// adds listeners for the layer add and remove to update
	// the data that is displayed on the side of the page.
	map.on('overlayadd', updateStats);
	map.on('overlayremove', updateStats);
	// calls the update method once to set up the initial
	// state of the map with zero circles displayed.
	updateStats();

	// function to update the stats on the right of the map.
	function updateStats() {
		var total = 0;
		var mkill = 0;
		var mhit = 0;
		var fkill = 0;
		var fhit = 0;
		// gets and iterates through each circle on the map
		map.eachLayer(function(circle) {
			// error checking to make sure that the attributes
			// are not attempted to be read on the tile object
			// or the other overlay objects.
			if (!(circle.options == undefined)
				&& !(circle.options.className == undefined)) {
				total++;

				// next set of ifs increment counters based on
				// which dot is selected.
				if (circle.options.color == 'blue') {
					if (circle.options.className == 'Killed') {
						mkill++;
					} else {
						mhit++;
					}
				} else if (circle.options.color == 'red') {
					if (circle.options.className == 'Killed') {
						fkill++;
					} else {
						fhit++;
					}
				}
			}
		});
		// updates total count on the page
		$('#cTotal').text(total);
		// calculates the percentages of killed vs total
		var mresult = 100 * mkill / (mkill + mhit);
		var fresult = 100 * fkill / (fkill + fhit);
		// more error checking to make sure NaN is not displayed
		if (isNaN(mresult)) {
			mresult = 0.00;
		}
		if (isNaN(fresult)) {
			fresult = 0.00;
		}
		// finally updates the page with the percentages calculated.
		$('#mkill').text(mresult.toFixed(2) + '%');
		$('#fkill').text(fresult.toFixed(2) + '%');
	}
});