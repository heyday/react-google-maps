/** @jsx React.DOM */
"use strict";

var React = require('react/addons');
var GoogleMaps = require('react-google-maps');
var Map = GoogleMaps.Map;
var Marker = GoogleMaps.Marker;

var POINT_RADIUS = 500;

var GoogleMapWithZooming = React.createClass({
	getInitialState: function() {
		return {
			activePoint: null
//			points: [
//				{
//					title: 'Point 1',
//					position: GoogleMaps.LatLng(-34.397, 150.644)
//				},
//				{
//					title: 'Point 2',
//					position: GoogleMaps.LatLng(25.774252, -80.190262)
//				},
//				{
//					title: 'Point 3',
//					position: GoogleMaps.LatLng(18.466465, -66.118292)
//				},
//				{
//					title: 'Point 4',
//					position: GoogleMaps.LatLng(32.321384, -64.75737)
//				}
//			]
		};
	},

	render: function() {
		var slideBarStyle = {
			width: 300,
			float: 'left'
		};

		var showAll = this.renderControlPoint({name: 'Show all'}, null);
		return (
			<div>
				<div style={slideBarStyle}>
					<ul>
						{showAll}
						{this.props.points.map(this.renderControlPoint)}
					</ul>
				</div>

				<Map
					bounds={this.state.activePoint == null ?
						this.getPointerBounds() : this.getActivePointBounds()}
					width={700}
					height={700}
					onClick={this.handleMapClick}>
					{this.props.points.map(this.renderMarkers)}
				</Map>
			</div>
		);
	},

	renderControlPoint: function(point, i) {
		var style = {
			backgroundColor: this.state.activePoint === i ? 'lightblue' : 'inherit',
			cursor: 'pointer'
		};

		return (
			<li style={style} onClick={this.handleActivatePoint.bind(null, i)} key={i}>
				<p>{point.name} <small>- {point.info}</small><br />{point.currentAddress}</p>
			</li>
			);
	},

	renderMarkers: function(state, i) {
		return (
			<Marker position={state.position} title={state.name} key={i} />
			);
	},

	handleActivatePoint: function(activePoint) {
		this.setState({activePoint: activePoint});
	},

	getPointerBounds: function() {
		if (!this.props.points.length) {
			return new google.maps.LatLngBounds(
				GoogleMaps.LatLng(-34.397, 150.644),
				GoogleMaps.LatLng(25.774252, -80.190262)
			);
		}

		return this.props.points
			.reduce(function(bounds, point) {
				return point.position ? bounds.extend(point.position) : bounds;
			}, new google.maps.LatLngBounds());
	},

	getActivePointBounds: function() {
		var radiusToThePowerOfTwo = Math.pow( POINT_RADIUS, 2 );
		var boundsDistanceFromCenterToCorner = Math.floor( Math.sqrt( radiusToThePowerOfTwo + radiusToThePowerOfTwo ) );
		var center = this.props.points[ this.state.activePoint ].position;

		return new google.maps.LatLngBounds(
			google.maps.geometry.spherical.computeOffset( center, boundsDistanceFromCenterToCorner, -135 ),
			google.maps.geometry.spherical.computeOffset( center, boundsDistanceFromCenterToCorner, 45 )
		);
	}
});

module.exports = GoogleMapWithZooming;

