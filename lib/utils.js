/**
 * Module dependencies
 */
var fs = require('fs');


/**
 * Compute the size (number of elements) of a given object
 *
 * @param {Object} object
 * @return {Number} size
 * @api public
 */
var objectSize = function(object) {
  var size = 0
    , key;
  for (key in object){
    if (object.hasOwnProperty(key)){
      size++;
    }
  }
  return size;
}

/**
 * Loads the data contained in the configuration files
 *
 * @param {Object} express app
 * @api public
 */
var loadConfig = function(app){
  var configs = {}
    , configs_dir = process.cwd() + '/config'
    , filepath = ''
    , filenoext = '';
  fs.readdir(configs_dir, function(err, files){
    files.forEach(function(file){
      filepath = configs_dir + '/' + file;
      filenoext = file.split('.')[0];
      configs[filenoext] = JSON.parse(fs.readFileSync(filepath));
    });
  });
  app.locals({
    config: configs
  })
}


/**
 * Expose public functions, classes and methods
 */
exports.objectSize = objectSize;
exports.loadConfig = loadConfig;
