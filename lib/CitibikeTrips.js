// grab trips from citibike and return json
// set debug to higher values for increased verbosity
// 1: show connect status codes
// 2: show generated data in json
// 3: show html source of retrieved pages

'use strict';
// requires
// TODO set timezone or let end user do it?
// var time = require('time');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');

function CitibikeTrips(config) {
    this.user = config.citibikenyc.user || null;
    this.pass = config.citibikenyc.pass || null;
    this.toke = config.toke || null;
    this.debug = config.debug || false;
    this.trips = {};
    this.pages = [];
    this.urls = {};
    this.urls.login = 'https://www.citibikenyc.com/login';
    this.urls.trips = 'https://www.citibikenyc.com/member/trips';
    this.reqOpts = {};
    this.reqOpts.jar = true;
    this.reqOpts.url = '';
    this.reqOpts.headers = {};
    this.reqOpts.headers['User-Agent'] = config.ua;
    this.reqOpts.headers['Referer'] = 'https://www.citibikenyc.com/member/profile';
    this.debug > 1 && console.log(Date() + ' ' + JSON.stringify(this));
    if (!config.citibikenyc.user || !config.citibikenyc.pass) {
        throw 'Error! config needs username and password at minimum';
    }
}

CitibikeTrips.prototype.getToken = function getTokenF(callback) {
    // connect to citibike website and get session token
    // Must set self=this, else goes out of scope in request
    var self = this;
    var opts = self.reqOpts;
    opts.url = self.urls.login;
    opts.method = 'GET';
    self.debug > 1 && console.log(Date() + ' ' + 'REQ opts [' + JSON.stringify(opts) + ']');
    request(opts, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var $ = cheerio.load(body.toString());
            self.toke = $('input[name=ci_csrf_token]').val();
            self.debug && console.log(Date() + ' ' + 'REQ ' + response.statusCode + ' ' + self.toke);
            callback(null);
            return self.toke;
        } else {
            if (response.statusCode) {
                self.debug && console.error(Date() + ' ' + 'REQ ' + response.statusCode + ' getToken Fail');
            } else {
                self.debug && console.error(Date() + ' ' + 'REQ getToken Fail err:[' + error + ']');
            }
            return callback(error);
        }
    });
};

CitibikeTrips.prototype.login = function loginF(callback) {
    // now login with token
    var self = this;
    var opts = self.reqOpts;
    opts.url = self.urls.login;
    opts.method = 'POST';
    opts.form = {
        subscriberUsername: self.user,
        subscriberPassword: self.pass,
        ci_csrf_token: self.toke
    };

    self.debug > 1 && console.log(Date() + ' ' + 'REQ opts [' + JSON.stringify(opts) + ']');

    request(opts, function(error, response) {
        if (!error && response.statusCode === 302) {
            // accept redirect from /login to /member/profile
            self.debug && console.log(Date() + ' ' + 'REQ ' + response.statusCode + ' Login Success');
            return callback(null);
        } else {
            // anything else is error, for now
            self.debug && console.error(Date() + ' ' + 'REQ ' + response.statusCode + ' Login Failed');
            return callback(error);
        }
    });
};

CitibikeTrips.prototype.getTripPage = function getTripPageF(pageNum, callback) {
    // we should already be logged in, now grab trips and return json object
    if (pageNum instanceof Object) {
        callback = pageNum;
        pageNum = 1;
    }
    var self = this;
    var opts = self.reqOpts;
    opts.url = self.urls.trips + '/' + pageNum;
    opts.method = 'GET';

    self.debug > 1 && console.log(Date() + ' ' + 'REQ opts [' + JSON.stringify(opts) + ']');

    if (!self.toke) {
        return callback('need token to get trips');
    }

    request(opts, function(error, response, body) {
        var timeNow = Date.now();
        var trip = {};

        if (!error && response.statusCode === 200) {
            // crank up verbosity to dump entire html page to stdout
            self.debug > 2 && console.log(Date() + ' ' + 'BODY trips [' + body.toString() + ']');
            // use cheerio to find tripTable then iterate each tr row
            // each tr contains data elements, so we don't need to parse td
            // TODO would be nice to parse td so we don't have to lookup station names
            var $ = cheerio.load(body.toString());
            $('tr[class=trip]').each(function(i, e) {
                // save data
                trip[$(e).attr('id')] = $(e).data();
                // manipulate data
                trip[$(e).attr('id')].id = parseInt($(e).attr('id').substring(5), 10);
                trip[$(e).attr('id')].endDate = new Date(1000 * trip[$(e).attr('id')].endTimestamp);
                trip[$(e).attr('id')].startDate = new Date(1000 * trip[$(e).attr('id')].startTimestamp);
                // HACK just truncating to integer, not that it matters.  I'm either over my trip limit or 40seconds away and not going to make it...
                trip[$(e).attr('id')].durationMins = parseInt((trip[$(e).attr('id')].durationSeconds / 60), 10);
                // durationSeconds is zero for open trip, so we need to calculate duration from (now - start)
                trip[$(e).attr('id')].nowSecs = parseInt((timeNow / 1000) - trip[$(e).attr('id')].startTimestamp, 10);
                trip[$(e).attr('id')].nowMins = parseInt(trip[$(e).attr('id')].nowSecs / 60, 10);

                if (trip[$(e).attr('id')].endStationId === 'Station Id - null : null') {
                    trip[$(e).attr('id')].isOpen = true;
                } else {
                    trip[$(e).attr('id')].isOpen = false;
                }

            });

            // only build last page the first time we run
            if (!self.lastPage) {
                // TODO hoisting
                var a = [];
                // TODO is this async? need to check but seems to work
                $('nav[class=pagination] > a').each(function(i, e) {
                    a.push($(e).attr('data-ci-pagination-page'));
                });
                self.lastPage = Math.max.apply(Math, a);
                self.debug > 1 && console.log(Date() + ' ' + 'LASTPAGE ' + self.lastPage);
            }

            self.debug && console.log(Date() + ' ' + 'REQ ' + response.statusCode + ' Page ' + pageNum + ' done');
            self.debug > 1 && console.log(Date() + ' ' + JSON.stringify(trip, null, 2));

            // merge trips from local hash into class hash in this/self. we know data so no deep copy needed
            for (var tripId in trip) {
                self.trips[tripId] = {};
                for (var key in trip[tripId]) {
                    self.trips[tripId][key] = trip[tripId][key];
                }
            }

            return callback(null);
        } else {
            self.debug && console.error(Date() + ' ' + 'REQ ' + response.statusCode + ' error: ');
            self.debug > 2 && console.log(Date() + ' ' + body);
            return callback(error);
        }
    });
};

CitibikeTrips.prototype.getRecentTrips = function getRecentTripsF(callback) {
    // collect trips from first page and store them in self.trips
    var self = this;
    async.series([

        function(cb) {
            self.getToken(cb);
        },
        function(cb) {
            self.login(cb);
        },
        function(cb) {
            // TODO trip pages are by month, if this is null we might want to check page 2, depends on if last day of month was yesterday
            self.getTripPage(1, cb);
        }
    ], function(err, result) {
        if (err) {
            self.debug && console.error(Date() + ' ' + 'ASYNC error[' + JSON.stringify(err, null, 2) + ']');
            return callback(err);
        }
        return callback(null);
    });
};

CitibikeTrips.prototype.getAllTrips = function getAllTripsF(callback) {
    // collect trips from first to last page
    var self = this;
    async.series([

        function(cb) {
            self.getToken(cb);
        },
        function(cb) {
            self.login(cb);
        },
        function(cb) {
            self.getTripPage(1, cb);
        },
        function(cb) {
            // this is overkill. Hardcoding getTripPage ten times was easier. Node and async is bending my brain.
            var pages = [];
            // build closure
            var makeGetPages = function(i, cbb) {
                return function(cbb) {
                    self.getTripPage(i, cbb);
                };
            };
            // build array of functions
            for (var i = 2; i < 1 + self.lastPage; i++) {
                // var getsPage = makeGetPages(i);
                var getsPage = makeGetPages(i, cb);
                pages.push(getsPage);
            }
            // execute the array of function closures
            // calling async inside of async, we can go deeper! <INCEPTION GONG!>
            async.series(pages, function(err, res) {
                if (err) {
                    self.debug && console.error(Date() + ' ' + 'ASYNC error[' + JSON.stringify(err, null, 2) + ']');
                    return callback(err);
                }
                return callback(null);
            });
            //self.debug > 3 && console.log('SELF: ' + JSON.stringify(self, null, 2));
        }
    ], function(err, result) {
        if (err) {
            self.debug && console.error(Date() + ' ' + 'ASYNC error[' + JSON.stringify(err, null, 2) + ']');
            return callback(err);
        }
        return callback(null);
    });
};

CitibikeTrips.prototype.sortTrips = function sortTripsF(trips) {
    // returns a sorted array of tripId strings for lookup
    var sortedTrips = [];

    if (trips.length < 1) {
        console.error('trips is null');
        return null;
    }

    for (var entry in trips) {
        // trip id has different lengths, so cast to int and then sort
        sortedTrips.push(parseInt(entry.substring(5), 10));
    }

    sortedTrips.sort(function(a, b) {
        // backwards because we're sorting from max to min
        return b - a;
    });

    for (var c = 0, l = sortedTrips.length; c < l; c++) {
        sortedTrips[c] = 'trip-' + sortedTrips[c];
    }

    return sortedTrips;
};

CitibikeTrips.prototype.getLastTrip = function getLastTripF(callback) {
    // returns a single trip object based on greatest tripId
    var self = this;
    self.getRecentTrips(function(err) {
        var sortedTrips = self.sortTrips(self.trips);
                console.error(self);

        return callback(err, self.trips[sortedTrips[0]]);
    });
};

module.exports = exports = CitibikeTrips;