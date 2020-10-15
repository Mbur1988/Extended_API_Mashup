const createError = require('http-errors');
const express = require('express');
const twit = require('twit');
const AWS = require('aws-sdk');
const router = express.Router();

// Configure the AWS environment
AWS.config.update({
  accessKeyId: 'AKIA5DYSEEJ4UZUKTYXR',
  secretAccessKey: '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'
});

// Create AWS S3 varaibles
const s3 = new AWS.S3();
const bucket = 'n9801154-trendbing-bucket1';

// Set Twitter API credentials
const apiKey = 'JiZw0LDxyItpT9RowC0LjUUxU';
const apiSecretKey = 'QOFXRDziLsysKNW6CZsP5huiVrUTO6WQKyji87chDkDy7A7VUJ';
const accessToken = '1295958893827223557-97diUVsv3TgLcW304pR5CEBEkE1Cdq';
const accessTokenSecret = 'RiSn6jXAi0WA9NHJCxmYM8bNnFYdQJLTPgGqnCFlERfnp';

// Configure twit package with Twitter API credentials
const T = new twit({
  consumer_key: apiKey,
  consumer_secret: apiSecretKey,
  access_token: accessToken,
  access_token_secret: accessTokenSecret
})

// Trends route handler for blank input
router.get('/', function (req, res, next) {
  console.log('Test!!!!');
  let params = { id: 1, exclude: 'hashtags' } // Set params
  return T.get('trends/place', params) // Query Twitter API to get the top trends worldwide

    .then(result => {
      const top10Trends = []
      for (let i = 0; i < 10; i++) {
        top10Trends.push(result.data[0].trends[i].name) // Extract the top 10 of the returned trends
      }
      return top10Trends; // return the top 10 trends

    }).then(result => { // Render the trending page
      res.render("trending", {
        trending: result,
        title: 'Trending Worldwide',
        location: 'the World'
      });

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
      // Configure S3 parameters
      console.log(result.data[0].locations[0].name);  //request location

      //setting up key
      var today = new Date();
      var ss = String(today.getSeconds());
      var mm = String(today.getMinutes);
      var hh = String(today.getHours());
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today = yyyy + ' ' + mm + ' ' + dd + ' ' + hh + ' ' + mm + ' ' + ss;
      var LocationOfSearch = result.data[0].locations[0].name;
      console.log(result.data[0].trends);
      s3Key = today +" " + LocationOfSearch;
      var params = {
        Bucket: bucket,
        //Key : result.data[0].as_of, //This is the original 
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
      let numTrends = 10
      if (result.data[0].trends.length < 10) {
        numTrends = result.data[0].trends.length
      }
      const topTrends = []
      for (let i = 0; i < numTrends; i++) {
        topTrends.push(result.data[0].trends[i].name) // Extract the top 10 of the returned trends
      }
      return topTrends; // return the top 10 trends

    }).then(result => {
      res.render("trending", {  // Render the trending page
        trending: result,
        title: 'Trending in ' + req.params.query,
        location: req.params.query
      });

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
    //res.json(result);
    let numTrends = 10
    if (result.data[0].trends.length < 10) {
      numTrends = result.data[0].trends.length
    }
    const topTrends = []
    for (let i = 0; i < numTrends; i++) {
      topTrends.push(result.data[0].trends[i].name) // Extract the top 10 of the returned trends
    }
    return topTrends; // return the top 10 trends

  }).then(result => {
    res.render("trending", {  // Render the trending page
      trending: result,
      title: 'Trending in ' + req.params.query,
      location: req.params.query
    });
  });
});

module.exports = router;
