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

  app.error(function(err, req, res, next){
    if (err instanceof NotFound) {
      res.render('404.jade', {
        title: 'Not Found'
      , status: 404
      , locals: { error: err }
      });
    } else {
      next(err);
    }
  });

  if (app.settings.env == 'production' || app.settings.env == 'test'){
    app.error(function(err, req, res){
      res.render('500.jade', {
        title: 'Server Error'
      , status: 500
      , locals: { error: err }
      });
    });
  }

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
