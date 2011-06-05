/**
 * Function used to handle the routing associated to
 * the 'about' page.
 *
 * @param {Application} express app
 * @api public
 */
var route = function(app){
  
  /**
   * Route to base 'help' page
   *
   * @handles {Route} /help
   */
  app.get('/help', function(req, res){
    res.render('help', {
      title: 'Help'
    });
  });

}


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
