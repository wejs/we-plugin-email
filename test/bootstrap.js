var projectPath = process.cwd();
var deleteDir = require('rimraf');
var testTools = require('we-test-tools');
var ncp = require('ncp').ncp;
var mkdirp = require('mkdirp');
var path = require('path');
var we;

before(function(callback) {
  var dest = path.resolve(process.cwd(), 'server/emails');

  mkdirp(dest, function(){
    ncp(
      path.resolve(__dirname, 'stubs/emails'),
      dest, function (err) {
      if (err) {
        return callback(err);
      }
      callback();
    });
  })
});

before(function(callback) {
  this.slow(100);

  testTools.copyLocalConfigIfNotExitst(projectPath, function() {

    var We = require('we-core');
    we = new We();

    testTools.init({}, we);

    we.bootstrap({
      i18n: {
        directory: path.join(__dirname, 'locales'),
        updateFiles: true
      }
    } , function(err, we) {
      if (err) throw err;

      we.startServer(function(err) {
        if (err) throw err;
        callback();
      });
    });

  });
});

//after all tests
after(function (callback) {
  we.db.defaultConnection.close();

  var tempFolders = [
    projectPath + '/server',
    projectPath + '/config/local.js',
  ];

  we.utils.async.each(tempFolders, function(folder, next){
    deleteDir( folder, next);
  }, function(err) {
    if (err) throw new Error(err);
    callback();
  });

});