/** @jsx React.DOM */

"use strict";

var React = require('react');
window.React = React;

var GoogleMapWithMarkers = require('./GoogleMapWithMarkers');

React.renderComponent(<GoogleMapWithMarkers />, document.body);
