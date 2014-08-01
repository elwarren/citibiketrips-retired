// tests for each function in CitibikeTrips.js
// TODO rewrite tests to run offline by passing in cached pages instead of taxing citibikenyc.com website
'use strict';
var config = require('../etc/example-config.json');

var mocha = require('mocha');

describe('CitibikeTrips', function() {
	this.timeout(10000);
	var CitibikeTrips = require('../lib/CitibikeTrips');

	it('should initialize class without error', function() {
		var bt = new CitibikeTrips(config);

		describe('#getToken()', function() {
			it('should get session token without error', function(done) {
				this.timeout(10000);
				var token = bt.getToken(done);
			});
		});
		//
		// these are commented out because they will fail without a login/password
		//
		// describe('#login()', function() {
		// 	it('should login without error', function(done) {
		// 		this.timeout(10000);
		// 		bt.login(done);
		// 	});
		// });
		// describe('#getTripPage()', function() {
		// 	it('should get trip page without error', function(done) {
		// 		this.timeout(10000);
		// 		bt.getTripPage(1, function(err, res) {
		// 			done(err);
		// 		});
		// 	});
		// });
		// describe('#getRecentTrips()', function() {
		// 	// TODO this calls login internally, should reset token for proper test
		// 	it('should get recent trips without error', function(done) {
		// 		this.timeout(10000);
		// 		var btb = new CitibikeTrips(config);
		// 		btb.getRecentTrips(function(err, res) {
		// 			done(err);
		// 		});
		// 	});
		// });
		// describe('#getAllTrips()', function() {
		// 	// grabs 10 pages and needs more time
		// 	it('should get all trips without error', function(done) {
		// 		this.timeout(60000);
		// 		var btc = new CitibikeTrips(config);
		// 		btc.getAllTrips(done);
		// 	});
		// });
	});
});