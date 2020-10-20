const createError = require('http-errors');
const express = require('express');
const twit = require('twit');
const AWS = require('aws-sdk');
const redis = require('redis');
const bing = require('node-bing-api')({ accKey: "532aa70654bf49488baf4112120a9599" }); // Set Bing API credentials
const router = express.Router();

const MaxNumTrends = 5;
const NumResults = 50;

// Configure the AWS environment
AWS.config.update({
  accessKeyId: 'AKIA5DYSEEJ4UZUKTYXR',
  secretAccessKey: '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'
});

// Create AWS S3 varaibles
const s3 = new AWS.S3();
const bucket = 'n9801154-trendbing-bucket1';

// Create AWS Elasticache variables
const endpoint = 'mitchredis.km2jzi.ng.0001.apse2.cache.amazonaws.com';
const cache = redis.createClient({ host: endpoint });
const expiry = 3600;

// Configure twit package with Twitter API credentials
const T = new twit({
  consumer_key: 'JiZw0LDxyItpT9RowC0LjUUxU',
  consumer_secret: 'QOFXRDziLsysKNW6CZsP5huiVrUTO6WQKyji87chDkDy7A7VUJ',
  access_token: '1295958893827223557-97diUVsv3TgLcW304pR5CEBEkE1Cdq',
  access_token_secret: 'RiSn6jXAi0WA9NHJCxmYM8bNnFYdQJLTPgGqnCFlERfnp'
})

// Print redis errors to the console
cache.on('error', (err) => {
  console.log("Error " + err);
});

// Extracts the top trends from the result
function GetTopTrends(result) {
  let NumTrends = MaxNumTrends;
  if (result.data[0].trends.length < MaxNumTrends) {
    NumTrends = result.data[0].trends.length
  }
  const topTrends = []
  for (let i = 0; i < NumTrends; i++) {
    topTrends.push(result.data[0].trends[i].name) // Extract the top 10 of the returned trends
  }
  return topTrends; // return the top 10 trends
}

// Add entry to S3 storage
function AddS3(result) {
  //setting up key
  let date = new Date();
  let sec = String(date.getSeconds()).padStart(2, '0');
  let min = String(date.getMinutes()).padStart(2, '0');
  let hour = String(date.getHours()).padStart(2, '0');
  let day = String(date.getDate()).padStart(2, '0');
  let month = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let year = String(date.getFullYear()).padStart(2, '0');
  
  let today = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
  var LocationOfSearch = result.data[0].locations[0].name;
  s3Key = today +" " + LocationOfSearch;
  
  // Configure S3 parameters
  var params = {
    Bucket: bucket,
    Key : s3Key,
    Body : JSON.stringify(result)
  };
  // Upload twitter trends to S3 bucket
  s3.upload(params, function (err, data) {
    //handle error
    if (err) {
      console.log("Error", err);
    }
    //success
    if (data) {
      console.log("Uploaded in:", data.Location);
    }
  });
}

function PopulateCache(trend) {  
  let params = { count: NumResults } // Set params
  bing.news(trend, params, function (error, resp, data) { // Query Bing images API to get images for trend
    let result = data.value;
    cache.setex(trend + " News", expiry, JSON.stringify(result));
    bing.images(trend, params, function (error, resp, data) { // Query Bing images API to get images for trend
      let result = data.value;
      cache.setex(trend + " Pics", expiry, JSON.stringify(result));
    })
  })  
}

// Trends route handler for blank input
router.get('/', function (req, res, next) {
  let params = { id: 1, exclude: 'hashtags' } // Set params
  return T.get('trends/place', params) // Query Twitter API to get the top trends worldwide

    .then(result => {
      AddS3(result);
      topTrends = GetTopTrends(result);
      return topTrends; // return the top 10 trends

    }).then(result => { // Render the trending page
      res.render("trending", {
        trending: result,
        title: 'Trending Worldwide',
        location: 'the World'
      });
      for (trend in topTrends) {
        PopulateCache(topTrends[trend]);
      }
    }).catch(function (err) {
      console.log('caught error', err.stack)
    })
});

// Trends route handler
router.get('/:query', (req, res) => {
  let params = { query: req.params.query }
  T.get('geo/search', params) // Query Twitter API to get coordinates for the entered location

    .then(result => {
      if(result.data.result.places.length > 0) {

        let params = { // Set params
          lat: result.data.result.places[0].centroid[1], // Extract latitude from result data
          long: result.data.result.places[0].centroid[0] // Extract longditude from result data
        }
        return T.get('trends/closest', params) // Query Twitter API to get closest location that trending data is available for
      }
      else {
        res.redirect('/!')
        throw new Error('Location not recognised')        
        }
    
    }).then(result => {
      let params = { // Set params
        id: result.data[0].woeid, // Extract woeid from result data
        exclude: 'hashtags'
      }
      return T.get('trends/place', params) // Query Twitter API to get the top trends closest to the entered location

    }).then(result => {
      AddS3(result);
      topTrends = GetTopTrends(result);
      return topTrends; // return the top 10 trends

    }).then(result => {
      res.render("trending", {  // Render the trending page
        trending: result,
        title: 'Trending in ' + req.params.query,
        location: req.params.query
      });
      for (trend in topTrends) {
        PopulateCache(topTrends[trend]);
      }
    }).catch(function (err) { // catch any errors
      console.log('caught error', err.stack)
    })
});

router.get('/s3get/:query', (req, res) => {
  let params = {
    Bucket: bucket,
    Key: req.params.query
  };
  s3.getObject(params).promise()
  .then(data => {
    const result = JSON.parse(data.Body);
    topTrends = GetTopTrends(result);
    return topTrends; // return the top 10 trends

  }).then(result => {
    res.render("trending", {  // Render the trending page
      trending: result,
      title: 'Trending in ' + req.params.query,
      location: req.params.query
    });
    for (trend in topTrends) {
      PopulateCache(topTrends[trend]);
    }
  });
});

module.exports = router;
