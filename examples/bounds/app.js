/** @jsx React.DOM */

"use strict";

var React = require('react');
window.React = React;

var GoogleMapWithZooming = require('./GoogleMapWithZooming');
var directionsService = new google.maps.DirectionsService();
var geocoderService = new google.maps.Geocoder();
var computeDistanceBetween = google.maps.geometry.spherical.computeDistanceBetween;
var interpolateDistance = google.maps.geometry.spherical.interpolate;

function walkPath(path, stepDistance) {
	if (path.length < 2) {
		return path;
	}

	path = path.slice();

	var distanceBetween = computeDistanceBetween(path[0], path[1]);
	if (distanceBetween < stepDistance) {
		path.shift();
		return walkPath(path, stepDistance - distanceBetween);
	}

	path[0] = interpolateDistance(path[0], path[1], stepDistance / distanceBetween);
	return path;
}


var STEP_FPS = 3;
var STEP_DISTANCE_PER_SECOND = 20;
var GEO_ENCODE_INTERVAL = 6000;

var points = [
	{
		name: 'Mary',
		info: 'Delivery to Heyday!',
		origin: '3 Queen\'s Wharf, Wellington, New Zealand',
		destination: '38 hania st, wellington'
	},
	{
		name: 'Bob',
		info: 'Sunday cruising',
		origin: '38 hania st, wellington',
		destination: '27 Miramar Avenue, Miramar, Wellington'
	},
	{
		name: 'Harry',
		info: 'Off to Customhouse Quay',
		origin: '155 Taranaki Street, Wellington',
		destination: 'Cnr Customhouse Quay and Whitmore Street, Wellington'
	},
	{
		name: 'Sally',
		info: 'TO THE HUTT',
		origin: 'Cnr Customhouse Quay and Whitmore Street, Wellington',
		destination: 'Cnr Seaview Road and Parkside Road, Seaview, Wellington'
	}
];

var pathCount = 0;

points.forEach(function(point, i) {
	directionsService.route({
		origin: point.origin,
		destination: point.destination,
		travelMode: google.maps.TravelMode.DRIVING
	}, function(result, status) {
		if (google.maps.DirectionsStatus.OK !== status) {
			console.warn(status, point);
			return;
		}

		console.log('added path', result);
		point.path = result.routes[0].overview_path;
		pathCount++;
	});
});

setInterval(function() {
	var renderPoints = points
		.map(function(point) {
			var position;
			if (point.path) {
				point.path = walkPath(point.path, STEP_DISTANCE_PER_SECOND / STEP_FPS);
				position = point.path[0];
			}

			return {
				position: position,
				name: point.name,
				info: point.info,
				currentAddress: point.currentAddress
			};
		});


	if (pathCount === points.length) {
		render(renderPoints);
	}
}, 1000 / STEP_FPS);

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

setInterval(function() {
	shuffleArray(points.slice())
		.forEach(function(point) {
			if (point.path) {
				geocoderService.geocode({
					location: point.path[0]
				}, function(result, status) {
					if (google.maps.GeocoderStatus.OK !== status) {
						console.warn(status, point);
						return;
					}

					point.currentAddress = result[0].formatted_address;
				});
			}
		});
}, GEO_ENCODE_INTERVAL);

function render(points) {
	React.renderComponent(<GoogleMapWithZooming points={points} key="map" />, document.body);
}

//render();