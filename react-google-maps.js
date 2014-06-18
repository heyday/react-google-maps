"use strict";

var GoogleMaps = google.maps;
var React = require('react/addons');
var merge = require('react/lib/merge');
var mergeInto = require('react/lib/mergeInto');
var cloneWithProps = require('react/lib/cloneWithProps');

/**
 * Creates an object containing the changes between two objects
 *
 *   Input:  {blue: true, red: null} {red: null}
 *   Output: {blue: undefined, red: null}
 *
 * @param {object} prev
 * @param {object} next
 * @returns {object}
 */
function changed(prev, next) {
	var changed = {};
	var key;

	if (prev === next) {
		return changed;
	}

	for (key in next) {
		if (!prev.hasOwnProperty(key) || prev[key] !== next[key]) {
			changed[key] = next[key];
		}
	}

	for (key in prev) {
		if (!next.hasOwnProperty(key)) {
			changed[key] = undefined;
		}
	}

	return changed;
}

var Map = React.createClass({
	displayName: 'Map',

	propTypes: {
		width: React.PropTypes.number,
		height: React.PropTypes.number,
		style: React.PropTypes.object,

		center: React.PropTypes.instanceOf(GoogleMaps.LatLng ).isRequired,
		zoom: React.PropTypes.number.isRequired,

		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			scrollwheel: false,
			draggable: false,
			keyboardShortcuts: false,
			panControl: false,
			zoomControl: false,
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
			overviewMapControl: false,
			disableDoubleClickZoom: true,
			mapTypeId: GoogleMaps.MapTypeId.ROADMAP
		};
	},

	render: function() {
		var holderStyle = {
			width: this.props.width,
			height: this.props.height
		};

		mergeInto(holderStyle, this.props.style);

		// Loop through each child adding the `this.__node` object
		// to their props, this will allow the children to be injected
		// into this map instance.
		var mapProps = { map: this.__node };
		var children = React.Children
			.map(this.props.children, function(child) {
				return cloneWithProps(child, mapProps);
			});

		return React.DOM.div({
			className: this.props.className,
			style: holderStyle
		}, children);
	},

	componentDidMount: function() {
		this.__node = new GoogleMaps.Map(this.getDOMNode(), this.getMapProps());

		// Bind to single click event
		// TODO: Bind to all events and make this better!
		GoogleMaps.event.addListener(this.__node, 'click', function() {
			if (this.props.onClick) {
				this.props.onClick.apply(null, arguments);
			}
		}.bind(this));

		// Now we have the map created, we need to run the render
		// cycle again to pass down the `map` holder for the
		// components to render into.
		this.forceUpdate();
	},

	componentDidUpdate: function() {
		this.__node.setOptions(this.getMapProps());
	},

	getMapProps: function() {
		return merge(this.props, {
			style: null,
			width: null,
			height: null,
			onClick: null
		});
	}
});

var Marker = React.createClass({
	displayName: 'Marker',

	render: function() {
		// Nothing to render
		return React.DOM.noscript();
	},

	shouldComponentUpdate: function() {
		return false;
	},

	componentDidMount: function() {
		this.__node = new GoogleMaps.Marker(this.props);

		// TODO: Bind to events
	},

	componentWillReceiveProps: function(nextProps) {
		this.__node.setOptions(changed(this.props, nextProps));
	},

	componentWillUnmount: function() {
		this.__node.setMap(null);
		this.__node = null;
	}
});

var GoogleMapsAPI = {
	Map: Map,
	Marker: Marker,
	LatLng: function LatLng(lat, lng, noWrap) { return new GoogleMaps.LatLng(lat, lng, noWrap); }
};

module.exports = GoogleMapsAPI;