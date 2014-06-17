/** @jsx React.DOM */
"use strict";

var React = require('react');
var GoogleMaps = require('react-google-maps');
var Map = GoogleMaps.Map;
var Marker = GoogleMaps.Marker;

var GoogleMapWithMarkers = React.createClass({
  /**
   * Initialize state members.
   */
  getInitialState: function() {
    return {
			center: GoogleMaps.LatLng(-34.397, 150.644),
			markers: [
				{ position: GoogleMaps.LatLng(-34.397, 150.644) }
			]
		};
  },

  /**
   * This is the "main" method for any component. The React API allows you to
   * describe the structure of your UI component at *any* point in time.
   */
  render: function() {
    return (
      <Map
				center={this.state.center}
        width={700}
        height={700}>
				{this.state.markers.map(this.renderMarkers)}
      </Map>
    );
  },

	renderMarkers: function(state, i) {
		return (
			<Marker position={state.position} key={i} />
			);
	}
});

module.exports = GoogleMapWithMarkers;

