var express = require('express');
var router = express.Router();

// Index route handler
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Trend/Bing'}); // Render the index page
});

module.exports = router;
