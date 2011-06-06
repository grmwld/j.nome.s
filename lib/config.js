/**
 * Modules dependencies
 */
var fs = require('fs');


/**
 * Class used to manipulate app configuration
 *
 * @param {Object} express app
 * @api public
 */
var Config = function(app){
  this.app = app;
}

/**
 * Loads a specified config file
 *
 * @param {String} file
 * @param {Function} callback
 * @api private
 */
Config.prototype.loadFile = function(file, callback){
  callback(JSON.parse(fs.readFileSync(file)));
}

/**
 * Loads and processes the global config file
 *
 * @param {String} file
 * @param {Function} callback
 * @api private
 */
Config.prototype.loadGlobal = function(file, callback){
  var self = this
    , root_dir = file.split('/').slice(0, -1).join('/')
    , dataset_file = ''
    , config = {};
  self.loadFile(file, function(config_global){
    config['global'] = config_global;
    for (var dataset in config_global.datasets){
      dataset_file = [root_dir, config_global.datasets[dataset]].join('/');
      self.loadFile(dataset_file, function(config_dataset){
        config[dataset] = config_dataset;
      });
    }
    callback(config);
  });
}

/**
 * Loads the data contained in the configuration files
 *
 * @param {String} configuration directory
 * @api public
 */
Config.prototype.loadDir = function(dir){
  var self = this
    , configs_dir = dir || process.cwd() + '/config'
    , config_global_file = configs_dir + '/' + 'global.json';
  self.loadGlobal(config_global_file, function(config){
    self.app.locals({
      config: config
    });
  });
}

/**
 * Expose public functions, classes and methods
 */
exports.Config = Config;
