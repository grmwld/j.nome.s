/**
 * Module dependencies
 */
var util = require('util');


/**
 * NotFound error
 *
 * Inherits from Error
 * This is used in case of 404 errors.
 *
 * @param {String} message
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
 * @param {Object} application
 * @api public
 */
var route = function(app){

  /**
   * Handle 404 errors.
   *
   * If the error is not a 404 error, the callback is triggered
   * so that the next matching handler can handle it.
   * Otherwise, renders the 404 view.
   */
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

  /**
   * Handle 500 errors.
   *
   * Since this is the final exception handler,
   * not callback is necessary.
   */
  app.error(function(err, req, res){
    res.render('500.jade', {
      title: 'Server Error'
    , status: 500
    , locals: { error: err }
    });
  });

  /**
   * Route to 404 error
   *
   * @handle {Route#GET} /404
   * @throws {NotFound}
   */
  app.get('/404', function(req, res){
    throw new NotFound;
  });

  /**
   * Route to 500 error
   *
   * @handle {Route#GET} /500
   * @throws {Error}
   */
  app.get('/500', function(req, res){
    throw new Error('Server Side Error.');
  });

  /**
   * Handle any non registered URL by throwing a 404 exception.
   *
   * @throws {NotFound}
   */
  app.use(function(req, res){
    throw new NotFound('404 - Page not found.');
  });

}


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
exports.NotFound = NotFound;
