var express = require('express');
var router = express.Router();
const bing = require('node-bing-api')({ accKey: "2e4ead038dae45889f7f713afd5fc008" }); // Set Bing API credentials

// Set number of images to request from Bing images API
const NUM_IMAGES = 20;

// bingImages route handler
router.get('/:trend', (req, res) => { 
    let params = { count: NUM_IMAGES } // Set params
    bing.images(req.params.trend, params, function (error, resp, data) { // Query Bing images API to get images for trend
        let stories = data.value;
        res.json({ stories }); // Send stories (images)
    })
});

module.exports = router;