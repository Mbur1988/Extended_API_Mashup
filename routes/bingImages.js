var express = require('express');
var router = express.Router();
const bing = require('node-bing-api')({ accKey: "2e4ead038dae45889f7f713afd5fc008" }); // Set Bing API credentials

// bingImages route handler
router.get('/:trend/:amount', (req, res) => { 
    let params = { count: req.params.amount } // Set params
    bing.images(req.params.trend, params, function (error, resp, data) { // Query Bing images API to get images for trend
        let stories = data.value;
        res.json({ stories }); // Send stories (images)
    })
});

module.exports = router;