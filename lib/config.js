/**
 * Modules dependencies
 */
var fs = require('fs');


/**
 * Loads a specified config file
 */
var loadConfigFile = function(file, callback){
  callback(JSON.parse(fs.readFileSync(file)));
}

/**
 * Loads and processes the global config file
 */
var loadConfigGlobal = function(file, callback){
  var root_dir = file.split('/').slice(0, -1).join('/')
    , dataset_file = ''
    , config = {};
  loadConfigFile(file, function(config_global){
    config['global'] = config_global;
    for (var dataset in config_global.datasets){
      dataset_file = [root_dir, config_global.datasets[dataset]].join('/');
      loadConfigFile(dataset_file, function(config_dataset){
        config[dataset] = config_dataset;
      });
    }
    callback(config);
  });
}

/**
 * Loads the data contained in the configuration files
 *
 * @param {Object} express app
 * @api public
 */
var loadConfigDir = function(dir, app){
  var configs_dir = dir || process.cwd() + '/config'
    , config_global_file = configs_dir + '/' + 'global.json';
  loadConfigGlobal(config_global_file, function(config){
    app.locals({
      config: config
    });
  });
}

/**
 * Expose public functions, classes and methods
 */
exports.loadConfigDir = loadConfigDir;
