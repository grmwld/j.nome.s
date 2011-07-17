/**
 * Function used to handle the routing associated to
 * the documentation page.
 *
 * @param {Object} application
 */
var route = function(app) {
  
  /**
   * Route to base 'doc' page.
   *
   * @handle {Route#GET} /doc
   */
  app.get('/doc', function(req, res) {
    res.render('doc', {
      title: 'Documentation'
    });
  });

};


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
