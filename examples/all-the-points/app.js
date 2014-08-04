/** @jsx React.DOM */

"use strict";

var React = require('react');
window.React = React;

var GoogleMapWithZooming = require('./GoogleMapWithZooming');

React.renderComponent(<GoogleMapWithZooming key="map" />, document.body);