var express = require('express');
var router = express.Router();
const bing = require('node-bing-api')({ accKey: "2e4ead038dae45889f7f713afd5fc008" }); // Set Bing API credentials

// Set number of news articles to request from Bing news API
const NUM_ARTICLES = 10;

// bingNews route handler
router.get('/:trend', (req, res) => { 
    let params = { count: NUM_ARTICLES } // Set params
    bing.news(req.params.trend, params, function (error, resp, data) { // Query Bing news API to get articles for trend
        let stories = data.value;
        res.json({ stories }); // Send stories (news articles)
    })
});

module.exports = router;
