const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

const MAX_BUCKET_SIZE = 1000;

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
    const keys = data.Contents
    if (keys.length > MAX_BUCKET_SIZE) {
      for (let i = 0; i < (keys.length - MAX_BUCKET_SIZE); i++) {
        let params2 = {
          Bucket: bucket,
          Key: keys[i].Key
        }
        s3.deleteObject(params2, function (err, data) {
          //handle error
          if (err) {
            console.log("deleteObject Error", err);
          }
          //success
          if (data) {
            console.log("Record", keys[i].Key,"deleted from S3");
          }
        });
        keys.shift();
      }
    }
    res.render('index', { title: 'Trend/Bing', list: keys, locError: bool}); // Render the index page    
  } catch(error) {
    throw error;
  }
}


// Index route handler
router.get('/', function(req, res) {  
  listKeys(res, false)  
});

router.get('/!', (req, res) => {
    listKeys(res, true)
});

module.exports = router;
