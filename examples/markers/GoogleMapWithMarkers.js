/** @jsx React.DOM */
"use strict";

var React = require('react/addons');
var GoogleMaps = require('react-google-maps');
var Map = GoogleMaps.Map;
var Marker = GoogleMaps.Marker;

var GoogleMapWithMarkers = React.createClass({
	getInitialState: function() {
		return {
			center: GoogleMaps.LatLng(-34.397, 150.644),
			zoom: 16,
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
					zoom={this.state.zoom}
					center={this.state.center}
					width={700}
					height={700}
					onClick={this.handleMapClick}>
					{this.state.markers.map(this.renderMarkers)}
				</Map>
			</div>
		);
	},

	renderMarkers: function(state, i) {
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

