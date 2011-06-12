/**
 * Module dependencies
 */
var util = require('util');


/**
 * NotFound error
 */
var NotFound = function(message){
  this.name = 'NotFound';
  this.message = (message) ? message : "Not Found";
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
}
util.inherits(NotFound, Error);

/**
 * Function used to handle the routing associated to
 * the error controller
 *
 * @param {Application} express app
 * @api public
 */
var route = function(app){

  app.get('/404', function(req, res){
    throw new NotFound;
  });

  app.get('/500', function(req, res){
    throw new Error('Server side Error.');
  });

  app.get('/bad', function(req, res){
    unknownMethod();
  });

  app.use(function(req, res){
    throw new NotFound('404 - Page not found.');
  });

}


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
exports.NotFound = NotFound;
