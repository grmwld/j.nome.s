/**
 * Module dependencies
 */
var Mongolian = require('mongolian');
var NotFound = require('../controllers/errors').NotFound;


/**
 * Middleware used to connect to a specific database
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Function} callback
 * @api public
 */
var connect = function(req, res, next) {
  var server = new Mongolian;
  if (!req.app._locals.config[req.params.dataset]) {
    return next(new NotFound("dataset '" + req.params.dataset + "' does not exist."));
  } else {
    req.dataset = server.db(req.params.dataset);
    next();
  }
};


/**
 * Expose public functions, classes and methods
 */
exports.connect = connect;
