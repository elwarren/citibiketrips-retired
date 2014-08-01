#!/opt/local/bin/node
// return last recorded trip as json object
'use strict';
var config = require('../../citibike/citibike-config.json');
var CitibikeTrips = require('../lib/CitibikeTrips.js');
var ct = new CitibikeTrips(config);

ct.getLastTrip(function(err, result) {
	console.log(JSON.stringify(result, null, 2));
});
