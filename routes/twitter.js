const express = require('express');
const router = express.Router();
const twit = require('twit');

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
      let params = { // Set params
        lat: result.data.result.places[0].centroid[1], // Extract latitude from result data
        long: result.data.result.places[0].centroid[0] // Extract longditude from result data
      }
      return T.get('trends/closest', params) // Query Twitter API to get closest location that trending data is available for

    }).then(result => {
      let params = { // Set params
        id: result.data[0].woeid, // Extract woeid from result data
        exclude: 'hashtags'
      }
      return T.get('trends/place', params) // Query Twitter API to get the top trends closest to the entered location

    }).then(result => {
      const top10Trends = []
      for (let i = 0; i < 10; i++) {
        top10Trends.push(result.data[0].trends[i].name) // Extract the top 10 of the returned trends
      }
      return top10Trends; // return the top 10 trends

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

module.exports = router;
