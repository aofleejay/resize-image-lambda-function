var AWS = require('aws-sdk');
var gm = require('gm').subClass({ imageMagick: true });
var s3 = new AWS.S3();
 
exports.handler = function(event, context, callback) {
    var srcBucket = event.Records[0].s3.bucket.name;
    var dstBucket = "resized-" + event.Records[0].s3.bucket.name;
    var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    var dstKey    = "resized-" + srcKey;
    var typeMatch = srcKey.match(/\.([^.]*)$/);

    if (!typeMatch || typeMatch[1] != 'jpg') {
        callback('Unsupported image type.');
        return;
    }
    
    s3.getObject({Bucket: srcBucket, Key: srcKey}, function(err, data) {
        if(err) console.log(err, err.stack)
        else {
            gm(data.Body).size(function(err, size) {
                this.resize(100, 100).toBuffer(typeMatch[1], function(err, buffer) {
                    if(err) console.log(err, err.stack)
                    else {
                        s3.putObject({
                          Bucket: dstBucket,
                          Key: dstKey,
                          Body: buffer,
                        }, function(err2, data2) {
                          if(err2) console.log(err2, err2.stack)
                          else console.log(data2)
                        });
                    }
                });
            });
        }
    });
};