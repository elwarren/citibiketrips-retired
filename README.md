# CitibikeTrips.js 

A node.js module to scrape your personal trip data from the CitiBike website.

## Install
TODO this has not been released to NPM yet

```
git clone https://github.com/elwarren/citibiketrips.git
npm install
```

## Usage

You'll need to provide your username and password to the http://citibikenyc.com

```node
var config = require('etc/config.json');
var CitibikeTrips = require('CitibikeTrips');
var bt = CitibikeTrips(config);

bt.getLastTrip(function(trip) {
  // return single json object of most recent trip
  console.log(trip);
}

bt.getRecentTrips(function(trips) {
  // return json of this month's trips 
  console.log(trips);
});

bt.getAllTrips(function(trips) {
  // iterate over all history pages and return hash of complete history
  console.log(trips);
});
```

Example output:

```json
{}
```

Example config:

```json
{}
```

What else can we do?
See examples in bin directory
 * Tell twitter you're riding a bike!
 * Send yourself an sms txt if your trip time is approaching 45 minutes.
 * Track your personal station history.
 * Auto-checkin to foursquare when you checkout a bike.
 * what else?

