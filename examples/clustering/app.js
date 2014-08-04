/** @jsx React.DOM */

"use strict";

var React = require('react');
window.React = React;

var GoogleMapWithClusteredMarkers = require('./GoogleMapWithClusteredMarkers');

React.renderComponent(<GoogleMapWithClusteredMarkers />, document.body);
