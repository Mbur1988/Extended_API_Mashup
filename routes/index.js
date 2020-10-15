const express = require('express');
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

async function listKeys(res, bool) {
  let params = { Bucket: bucket };

  try {
    const data = await s3.listObjects(params).promise();
    var names = data.Contents;
//
    res.render('index', { title: 'Trend/Bing', list: data.Contents, locError: bool}); // Render the index page    
  } catch(error) {
    throw error;
  }
}


// Index route handler
router.get('/', function(req, res, next) {
  
  listKeys(res, false)
  
});

router.get('/!', (req, res) => {
    listKeys(res, true)
});

module.exports = router;
