
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

function train (callback) {
  auth(function (err, authClient) {

    if (err) {
      return callback(err);
    }

    var trainedmodels = google.prediction({
      version: 'v1.6',
      auth: authClient
    }).trainedmodels;

    trainedmodels.insert({
      project: 'test-project-160901',
      resource: {
        "id": "random-regression",
        "storageDataLocation": "quickstart-1488936542/D_lin.csv"
      }
    }, function (err, res){
      if(err) console.log(err);
      console.log(res);
    });

  });
}

// Run the examples
exports.main = function (phrase, cb) {
  train(cb || console.log);
};

if (module === require.main) {
  exports.main(process.argv.slice(2).shift());
}