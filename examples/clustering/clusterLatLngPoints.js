"use strict";

/**
 * @param {google.maps.Map} map
 * @param {google.maps.LatLng} latlng
 * @param {int} z
 * @return {google.maps.Point}
 */
var latlngToPoint = function(map, latlng){
	var normalizedPoint = map.getProjection().fromLatLngToPoint(latlng); // returns x,y normalized to 0~255
	var scale = Math.pow(2, map.getZoom());
	var pixelCoordinate = new google.maps.Point(normalizedPoint.x * scale, normalizedPoint.y * scale);
	return pixelCoordinate;
};
/**
 * @param {google.maps.Map} map
 * @param {google.maps.Point} point
 * @param {int} z
 * @return {google.maps.LatLng}
 */
var pointToLatlng = function(map, point){
	var scale = Math.pow(2, map.getZoom());
	var normalizedPoint = new google.maps.Point(point.x / scale, point.y / scale);
	var latlng = map.getProjection().fromPointToLatLng(normalizedPoint);
	return latlng;
};

function Cluster(map, pixelSize) {
	this._pixelSize = 100;
	this._map = map;
	this._projection = map.getProjection();
	this._bounds = new google.maps.LatLngBounds();
	this._points = [];
}

Cluster.prototype.extend = function(latlng, point) {
	if (!this._points.length) {

//		// Turn the bounds into latlng.
//		var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
//			bounds.getNorthEast().lng());
//		var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
//			bounds.getSouthWest().lng());
//
//		// Convert the points to pixels and the extend out by the grid size.
//		var trPix = projection.fromLatLngToDivPixel(tr);
//		trPix.x += this.gridSize_;
//		trPix.y -= this.gridSize_;
//
//		var blPix = projection.fromLatLngToDivPixel(bl);
//		blPix.x -= this.gridSize_;
//		blPix.y += this.gridSize_;
//
//		// Convert the pixel points back to LatLng
//		var ne = this._projection.fromDivPixelToLatLng(trPix);
//		var sw = this._projection.fromDivPixelToLatLng(blPix);
//
//		// Extend the bounds to contain the new bounds.
//		this._bounds.extend(ne);
//		this._bounds.extend(sw);


		// Convert the points to pixels and the extend out by the grid size.
		var pixelOffset = latlngToPoint(this._map, latlng);
		var trPix = new google.maps.Point(
			pixelOffset.x + this._pixelSize,
			pixelOffset.y - this._pixelSize
		);
		var blPix = new google.maps.Point(
			pixelOffset.x - this._pixelSize,
			pixelOffset.y + this._pixelSize
		);


		// Convert the pixel points back to LatLng
		var ne = pointToLatlng(this._map, trPix);
		var sw = pointToLatlng(this._map, blPix);

		// Extend the bounds to contain the new bounds.
		this._bounds = new google.maps.LatLngBounds(sw, ne);
//		new google.maps.Rectangle({map: this._map, bounds: this._bounds});
	}

	this._points.push(point);
};

Cluster.prototype.contains = function(latlng) {
	console.log(this._bounds.contains(latlng));
	return this._bounds.contains(latlng);
};

Cluster.prototype.getPoints = function() {
	return this._points;
};

Cluster.prototype.getCenter = function() {
	return this._bounds.getCenter();
};

Cluster.prototype.getBounds = function() {
	return this._bounds;
};


function clusterLatLngPoints(map, points, extractLatLng) {
	var clusters = [];
	var foundCluster;
	var pointLatLng;

	if (!map) {
		return [];
	}

	for (var i = 0; i < points.length; i++) {
		foundCluster = null;
		pointLatLng = extractLatLng(points[i]);

		for (var ii = 0; ii < clusters.length; ii++) {
			if (clusters[ii].contains(pointLatLng)) {
				foundCluster = clusters[ii];
				break;
			}
		}

		if (foundCluster == null) {
			// create cluster
			foundCluster = new Cluster(map);
			clusters.push(foundCluster);
		}

		foundCluster.extend(pointLatLng, points[i]);
	}

	return clusters;
}

module.exports = clusterLatLngPoints;