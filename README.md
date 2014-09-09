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

Example config:

```json
{
  "debug": 0,
  "citibikenyc": {
    "user": "yourusername",
    "pass": "yourpassword"
  }
}
```

Example code:

```node
var config = require('etc/config.json');
var CitibikeTrips = require('CitibikeTrips');
var bt = CitibikeTrips({config});

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
{
  "startStationId": 212,
  "startTimestamp": 1406850546,
  "endStationId": 512,
  "endTimestamp": 1406851284,
  "durationSeconds": 738,
  "id": 13204503,
  "endDate": "2014-08-01T00:01:24.000Z",
  "startDate": "2014-07-31T23:49:06.000Z",
  "durationMins": 12,
  "nowSecs": 3600,
  "nowMins": 60,
  "isOpen": false
}
```

## See Also

Example code in bin directory.

My collection of tools at https://github.com/elwarren/citibiketools.git
is available seperately to avoid updates to this package.

## Thanks

Special thanks to the Citibike program operated by NYC Bike Share.  I ride these bikes everyday, sometimes 3-4 trips in a single day.

Please do not abuse their servers with excessive polling.  I've read the Citibike TOS http://www.citibikenyc.com/assets/pdf/terms-of-use.pdf
and it appears to be OK to do this for personal use.



