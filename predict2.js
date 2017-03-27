
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var inputFile='smallTest.csv';

var google = require('googleapis');

function auth (callback) {
  google.auth.getApplicationDefault(function (err, authClient) {

    if (err) {
      return callback(err);
    }

    // The createScopedRequired method returns true when running on GAE or a
    // local developer machine. In that case, the desired scopes must be passed
    // in manually. When the code is  running in GCE or GAE Flexible, the scopes
    // are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more
    // information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/devstorage.read_only',
        'https://www.googleapis.com/auth/prediction'
      ]);
    }
    callback(null, authClient);
  });
}

var resultArr = [];

function pushResult (sampleCase, res){
	try {
		var ans = res.outputLabel;	
		sampleCase.push(ans);
		resultArr.push(sampleCase);
	} catch(e){
		console.log(sampleCase);
	}
	

}

function predict (callback, sampleCase) {
  auth(function (err, authClient) {

    if (err) {
      return callback(err);
    }

    var trainedmodels = google.prediction({
      version: 'v1.6',
      auth: authClient
    }).trainedmodels;
    
    var sampleArr = [];
    for(key in Object.keys(sampleCase)){
    	sampleArr.push(sampleCase[key].toString());
    }
    
    trainedmodels.predict({
      project: 'test-project-160901',
      id: "random-categorization",
      resource: {
        input: {
          csvInstance: sampleArr
        }
      }         
    }, function (err, res){
      if(err) console.log(err);
      pushResult(sampleArr, res);
      callback();
    }); 

  });
}

var parser = parse({delimiter: ','}, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    predict(function(){
    	callback();
    }, line);
  }, function(err){
		var file = fs.createWriteStream('array.csv');
		file.on('error', function(err) { console.log(err); });

		resultArr.forEach(function(v) { 
			file.write(v.join(', ') + '\n'); });
		file.end();
  })
})

var stream = fs.createReadStream(inputFile).pipe(parser);
