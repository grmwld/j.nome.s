/**
 * Function used to handle the routing associated to
 * the 'about' page.
 *
 * @param {Application} express app
 * @api public
 */
var route = function(app){
  
  /**
   * Route to base 'about' page
   *
   * @handles {Route} /about
   */
  app.get('/about', function(req, res){
    res.render('about', {
      title: 'About'
    });
  });

}


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
