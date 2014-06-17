"use strict";

var GoogleMaps = google.maps;

var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
var ReactBrowserComponentMixin = require('react/lib/ReactBrowserComponentMixin');
var ReactComponent = require('react/lib/ReactComponent');
var ReactMount = require('react/lib/ReactMount');
var ReactMultiChild = require('react/lib/ReactMultiChild');
var ReactDOMComponent = require('react/lib/ReactDOMComponent');
var ReactUpdates = require('react/lib/ReactUpdates');

var ReactComponentMixin = ReactComponent.Mixin;

var mixInto = require('react/lib/mixInto');
var merge = require('react/lib/merge');

// Used for comparison during mounting to avoid a lot of null checks
var BLANK_PROPS = {};

function createComponent(name) {
	var ReactGoogleMapComponent = function() {};
	ReactGoogleMapComponent.displayName = name;
	for (var i = 1, l = arguments.length; i < l; i++) {
		mixInto(ReactGoogleMapComponent, arguments[i]);
	}
	var ConvenienceConstructor = function(props, children) {
		var instance = new ReactGoogleMapComponent();
		// Children can be either an array or more than one argument
		instance.construct.apply(instance, arguments);
		return instance;
	};
	ConvenienceConstructor.type = ReactGoogleMapComponent;
	ReactGoogleMapComponent.prototype.type = ReactGoogleMapComponent;
	return ConvenienceConstructor;
}

// ContainerMixin for components that can hold Map nodes

var ContainerMixin = merge(ReactMultiChild.Mixin, {

	/**
	 * Moves a child component to the supplied index.
	 *
	 * @param {ReactComponent} child Component to move.
	 * @param {number} toIndex Destination index of the element.
	 * @protected
	 */
	moveChild: function(child, toIndex) {
		// No need to move things around
		return;
	},

	/**
	 * Creates a child component.
	 *
	 * @param {ReactComponent} child Component to create.
	 * @param {object} childNode ART node to insert.
	 * @protected
	 */
	createChild: function(child, childNode) {
		child._mountImage = childNode;
		childNode.setMap(this.node);
	},

	/**
	 * Removes a child component.
	 *
	 * @param {ReactComponent} child Child to remove.
	 * @protected
	 */
	removeChild: function(child) {
		child._mountImage.setMap(null);
		child._mountImage = null;
	},

	/**
	 * Override to bypass batch updating because it is not necessary.
	 *
	 * @param {?object} nextChildren.
	 * @param {ReactReconcileTransaction} transaction
	 * @internal
	 * @override {ReactMultiChild.Mixin.updateChildren}
	 */
	updateChildren: function(nextChildren, transaction) {
		this._mostRecentlyPlacedChild = null;
		this._updateChildren(nextChildren, transaction);
	},

	// Shorthands

	mountAndInjectChildren: function(children, transaction) {
		var mountedImages = this.mountChildren(
			children,
			transaction
		);
		// Each mount image corresponds to one of the flattened children
		var i = 0;
		for (var key in this._renderedChildren) {
			if (this._renderedChildren.hasOwnProperty(key)) {
				var child = this._renderedChildren[key];
				child._mountImage = mountedImages[i];
				mountedImages[i].setMap(this.node);
				i++;
			}
		}
	}

});

// Google Map - Root of all components

var GoogleMap = createComponent(
	'GoogleMap',
	ReactDOMComponent.Mixin,
	ReactComponentMixin,
	ContainerMixin,
	ReactBrowserComponentMixin, {

		mountComponent: function(rootID, transaction, mountDepth) {
			ReactComponentMixin.mountComponent.call(
				this,
				rootID,
				transaction,
				mountDepth
			);
			transaction.getReactMountReady().enqueue(this, this.componentDidMount);
			// Temporary placeholder
			var idMarkup = DOMPropertyOperations.createMarkupForID(rootID);
			return '<div ' + idMarkup + '></div>';
		},

		componentDidMount: function() {
			this.node = new GoogleMaps.Map(this.getDOMNode(), {
				center: this.props.center
			});

			var transaction = ReactComponent.ReactReconcileTransaction.getPooled();
			transaction.perform(
				this.mountAndInjectChildren,
				this,
				this.props.children,
				transaction
			);
			ReactComponent.ReactReconcileTransaction.release(transaction);
		},

		receiveComponent: function(nextComponent, transaction) {
			var props = nextComponent.props;
			var node = this.node;

			this._updateDOMProperties(props);

			this.updateChildren(props.children, transaction);

			this.props = props;
		},

		unmountComponent: function() {
			ReactComponentMixin.unmountComponent.call(this);
			this.unmountChildren();
		}
	});

var OverlayMixin = merge(ReactComponentMixin, {
	applyNodeProps: function(oldProps, props) {
		this.node.setOptions(props);
	},

	mountComponentIntoNode: function(rootID, container) {
		throw new Error(
			'You cannot render a google map overlay component standalone. ' +
				'You need to wrap it in a GoogleMap.'
		);
	}

});

var Marker = createComponent('Marker', OverlayMixin, {
	mountComponent: function() {
		ReactComponentMixin.mountComponent.apply(this, arguments);
		this.node = new GoogleMaps.Marker({});
		this.applyNodeProps(BLANK_PROPS, this.props);
		return this.node;
	},

	receiveComponent: function(nextComponent, transaction) {
		var props = nextComponent.props;
		this.applyNodeProps(this.props, props);
		this.props = props;
	}
});

var GoogleMapsAPI = {
	Map: GoogleMap,
	Marker: Marker,
	LatLng: function LatLng(lat, lng, noWrap) { return new GoogleMaps.LatLng(lat, lng, noWrap); }
};

module.exports = GoogleMapsAPI;