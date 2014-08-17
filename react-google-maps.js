"use strict";

var GoogleMaps = google.maps;
var React = require('react');
var merge = require('react/lib/merge');
var mergeInto = require('react/lib/mergeInto');
var cloneWithProps = require('react/lib/cloneWithProps');

/**
 * Creates an object containing the changes between two objects
 *
 *   Input:  {blue: true, red: null} {red: null}
 *   Output: {blue: undefined}
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

/**
 * Get zoom level to fit in
 *
 * @see http://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
 *
 * @param bounds
 * @param mapWidth
 * @param mapHeight
 * @returns {number}
 */
function zoomLevelToFitBounds(bounds, mapWidth, mapHeight) {
	var worldWidth = 256;
	var worldHeight = 256;
	var ZOOM_MAX = 21;

	function latRad(lat) {
		var sin = Math.sin(lat * Math.PI / 180);
		var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
		return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
	}

	function zoom(mapPx, worldPx, fraction) {
		return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
	}

	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();

	var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

	var lngDiff = ne.lng() - sw.lng();
	var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

	var latZoom = zoom(mapHeight, worldHeight, latFraction);
	var lngZoom = zoom(mapWidth, worldWidth, lngFraction);

	return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

function mapValidComponents(children, func, context) {
	var index = 0;

	return React.Children.map(children, function (child) {
		if (React.isValidComponent(child)) {
			var lastIndex = index;
			index++;
			return func.call(context, child, lastIndex);
		}

		return child;
	});
}

var Map = React.createClass({
	displayName: 'Map',

	propTypes: {
		width: React.PropTypes.number,
		height: React.PropTypes.number,
		style: React.PropTypes.object,

		bounds: React.PropTypes.instanceOf(GoogleMaps.LatLngBounds),
		center: React.PropTypes.instanceOf(GoogleMaps.LatLng),
		zoom: React.PropTypes.number,

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
		var children = null,
			mapProps = null,
			holderStyle = {
				width: this.props.width,
				height: this.props.height
			};

		mergeInto(holderStyle, this.props.style);

		// Check if there is an instance of a Google Map first
		// Loop through each child adding the `this.__node` object
		// to their props, this will allow the children to be injected
		// into this map instance.
		if ( this.__node ) {
			mapProps = { map: this.__node };
			children = mapValidComponents(this.props.children, function(child) {
				return cloneWithProps(child, mapProps);
			}, this);
		}

		return React.DOM.div({
			className: this.props.className,
			style: holderStyle
		}, children );
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
			onClick: null,
			bounds: null,
			zoom: this.props.zoom != null ?
				this.props.zoom : zoomLevelToFitBounds(this.props.bounds, this.props.width, this.props.height),
			center: this.props.center || this.props.bounds.getCenter()
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
		GoogleMaps.event.addListener(this.__node, 'click', function() {
			if (this.props.onClick) {
				this.props.onClick.apply(null, arguments);
			}
		}.bind(this));

	},

	componentWillReceiveProps: function(nextProps) {
		this.__node.setOptions(changed(this.props, nextProps));
	},

	componentWillUnmount: function() {
		this.__node.setMap(null);
		this.__node = null;
	}
});

var Rectangle = React.createClass({
	displayName: 'Rectangle',

	render: function() {
		// Nothing to render
		return React.DOM.noscript();
	},

	shouldComponentUpdate: function() {
		return false;
	},

	componentDidMount: function() {
		this.__node = new GoogleMaps.Rectangle(this.props);

		// TODO: Bind to events
		GoogleMaps.event.addListener(this.__node, 'click', function() {
			if (this.props.onClick) {
				this.props.onClick.apply(null, arguments);
			}
		}.bind(this));

	},

	componentWillReceiveProps: function(nextProps) {
		this.__node.setOptions(changed(this.props, nextProps));
	},

	componentWillUnmount: function() {
		this.__node.setMap(null);
		this.__node = null;
	}
});

var Polyline = React.createClass({
	displayName: 'Polyline',

	render: function() {
		// Nothing to render
		return React.DOM.noscript();
	},

	shouldComponentUpdate: function() {
		return false;
	},

	componentDidMount: function() {
		this.__node = new GoogleMaps.Polyline(this.props);

		// TODO: Bind to events
		GoogleMaps.event.addListener(this.__node, 'click', function() {
			if (this.props.onClick) {
				this.props.onClick.apply(null, arguments);
			}
		}.bind(this));

	},

	componentWillReceiveProps: function(nextProps) {
		this.__node.setOptions(changed(this.props, nextProps));
	},

	componentWillUnmount: function() {
		this.__node.setMap(null);
		this.__node = null;
	}
});

var Circle = React.createClass({
	displayName: 'Circle',

	render: function() {
		// Nothing to render
		return React.DOM.noscript();
	},

	shouldComponentUpdate: function() {
		return false;
	},

	componentDidMount: function() {
		this.__node = new GoogleMaps.Circle(this.props);

		// TODO: Bind to events
		GoogleMaps.event.addListener(this.__node, 'click', function() {
			if (this.props.onClick) {
				this.props.onClick.apply(null, arguments);
			}
		}.bind(this));

	},

	componentWillReceiveProps: function(nextProps) {
		this.__node.setOptions(changed(this.props, nextProps));
	},

	componentWillUnmount: function() {
		this.__node.setMap(null);
		this.__node = null;
	}
});


function ReactOverlayView(props) {
	this.props = props;
	this.setMap(props.map);
}

ReactOverlayView.prototype = new GoogleMaps.OverlayView();

ReactOverlayView.prototype.onAdd = function() {
	this._containerElement = document.createElement('div');
	this.getPanes()[this.props.mapPane]
		.appendChild(this._containerElement);
};

ReactOverlayView.prototype.draw = function() {
	var props = merge(this.props);
	if (this.props.position) {
		var point = this.getProjection()
			.fromLatLngToDivPixel(this.props.position);

		props.style = merge({
			left: point.x,
			top: point.y
		}, this.props.style);
	}

	React.renderComponent(
		React.DOM.div(props),
		this._containerElement
	)
};

ReactOverlayView.prototype.onRemove = function() {
	React.unmountComponentAtNode(this._containerElement);
	this._containerElement.parentNode
		.removeChild(this._containerElement);
	this._containerElement = null;
};


var OverlayView = React.createClass({
	displayName: 'OverlayView',

	propTypes: {
		mapPane: React.PropTypes.oneOf(['overlayLayer'])
	},

	getDefaultProps: function() {
		return {
			mapPane: 'overlayLayer'
		};
	},

	render: function() {
		// Nothing to render
		return React.DOM.noscript();
	},

	shouldComponentUpdate: function() {
		return false;
	},

	componentDidMount: function() {
		this.__node = new ReactOverlayView(this.props);

		// TODO: Bind to events
		GoogleMaps.event.addListener(this.__node, 'click', function() {
			if (this.props.onClick) {
				this.props.onClick.apply(null, arguments);
			}
		}.bind(this));

	},

	componentWillReceiveProps: function(nextProps) {
		var changes = changed(this.props, nextProps);

		this.__node.props = this.props;

		if (changes.mapPane) {
			// Unmount then, mount again onto the correct map pane
			this.__node.setMap(null);
			this.__node.setMap(this.props.map);
		}
	},

	componentWillUnmount: function() {
		this.__node.setMap(null);
		this.__node = null;
	}
});

var GoogleMapsAPI = {
	Map: Map,
	Marker: Marker,
	Rectangle: Rectangle,
	Polyline: Polyline,
	Circle: Circle,
	OverlayView: OverlayView,
	LatLng: function LatLng(lat, lng, noWrap) { return new GoogleMaps.LatLng(lat, lng, noWrap); },
	LatLngBounds: function LatLngBounds(sw, ne) { return new GoogleMaps.LatLngBounds(sw, ne); }
};

module.exports = GoogleMapsAPI;