var express = require('express');
var router = express.Router();

// Index route handler
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Trend/Bing', locError: false}); // Render the index page
});

router.get('/:query', (req, res) => {
  if (req.params.query == '!') {
    res.render('index', { title: 'Trend/Bing', locError: true}); // Render the index page
  }
});

module.exports = router;
