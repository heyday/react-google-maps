/** @jsx React.DOM */
"use strict";

var React = require('react/addons');
var GoogleMaps = require('react-google-maps');
var Map = GoogleMaps.Map;
var Marker = GoogleMaps.Marker;
var Rectangle = GoogleMaps.Rectangle;
var clusterLatLngPoints = require('./clusterLatLngPoints');

function extractLatLng(marker) {
	return marker.position;
}

var GoogleMapWithMarkers = React.createClass({
	getInitialState: function() {
		return {
			center: GoogleMaps.LatLng(-34.397, 150.644),
			zoom: 13,
			markers: [
				{position: GoogleMaps.LatLng(-34.397, 150.644)}
			]
		};
	},

	render: function() {
		return (
			<div>
				<button onClick={this.handleZoomOut}>Zoom out!</button>
				<button onClick={this.handleZoomIn}>Zoom in!</button>
				<Map
					ref="map"
					zoom={this.state.zoom}
					center={this.state.center}
					width={700}
					height={700}
					onClick={this.handleMapClick}>
					{this.refs.map ? clusterLatLngPoints(this.refs.map.__node, this.state.markers, extractLatLng).map(this.renderCluster) : []}
				</Map>
			</div>
		);
	},

	renderCluster: function(cluster, i) {
		var points = cluster.getPoints();

		if (points.length === 1) {
			return this.renderMarker(points[0], i);
		}

		return (
			<Rectangle bounds={cluster.getBounds()} key={i} onClick={this.handleClusterClick.bind(null, cluster)} />
			);
//
//		var overlayStyles = {
//			position: 'absolute',
//			backgroundColor: 'red'
//		};
//
//		return (
//			<OverlayView styles={overlayStyles} position={cluster.getCenter()} key={i}>
//				<h1>points.length</h1>
//			</OverlayView>
//			);
	},

	renderMarker: function(state, i) {
		return (
			<Marker position={state.position} key={i} />
			);
	},

	handleZoomOut: function() {
		this.setState({zoom: Math.max(0, this.state.zoom - 1)});
	},

	handleZoomIn: function() {
		this.setState({zoom: Math.min(16, this.state.zoom + 1)});
	},

	handleClusterClick: function(cluster) {
		this.setState({
			zoom: Math.min(16, this.state.zoom + 1),
			center: cluster.getCenter()
		});
	},

	handleMapClick: function(mapEvent) {
		var marker = {
			position: mapEvent.latLng
		};

		var markers = React.addons
			.update(this.state.markers, {$push: [marker]});

		this.setState({markers: markers});
	}
});

module.exports = GoogleMapWithMarkers;

