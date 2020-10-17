var express = require('express');
var router = express.Router();
const redis = require('redis');

const bing = require('node-bing-api')({ accKey: "2e4ead038dae45889f7f713afd5fc008" }); // Set Bing API credentials

// Create AWS Elasticache variables
const endpoint = 'mitchredis.km2jzi.ng.0001.apse2.cache.amazonaws.com';
const cache = redis.createClient({ host: endpoint });

// bingNews route handler
router.get('/:trend/:amount', (req, res) => { 
    cache.get(`${req.params.trend}News`, (err, data) => {
        if (data && data.length > 2) { // Key exists in Redis store
            let stories = JSON.parse(data);            // Serve from redis store
            res.json({ stories });            
        } else {
            let params = { count: req.params.amount } // Set params
            bing.news(req.params.trend, params, function (error, resp, data) { // Query Bing news API to get articles for trend
                let stories = data.value;
                res.json({ stories }); // Send stories (news articles)
            });
        }
    });
});

module.exports = router;
