var express = require('express');
var router = express.Router();
const redis = require('redis');

const bing = require('node-bing-api')({ accKey: "2e4ead038dae45889f7f713afd5fc008" }); // Set Bing API credentials

// Create AWS Elasticache variables
const endpoint = 'n9801154-trendbing-redis.km2jzi.ng.0001.apse2.cache.amazonaws.com';
const cache = redis.createClient({ host: endpoint });

// bingImages route handler
router.get('/:trend/:amount', (req, res) => { 
    cache.get(`${req.params.trend}Pics`, (err, data) => {
        if (data && data.length > 2) { // Key exists in Redis store
            let images = JSON.parse(data);            // Serve from redis store
            res.json({ images });            
        } else {
            let params = { count: req.params.amount } // Set params
            bing.images(req.params.trend, params, function (error, resp, data) { // Query Bing images API to get images for trend
                let images = data.value;
                res.json({ images }); // Send stories (images)
            });
        }    
    });
});

module.exports = router;