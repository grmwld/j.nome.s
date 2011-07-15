/**
 * Function used to handle the routing associated to
 * the API page.
 *
 * @param {Object} application
 * @api public
 */
var route = function(app) {
  
  /**
   * Route to base API page
   *
   * @handle {Route#GET} /api
   */
  app.get('/api', function(req, res) {
    res.sendfile('./docs/api.html');
  });

};


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
