/**
 * Module dependencies.
 */
var fs = require('fs')
  , express = require('express')
  , Resource = require('express-resource')
  , expose = require('express-expose')
  , mongoose = require('mongoose');


/**
 * Loads the data contained in the configuration files
 */
function loadUserConfig(){
  var configs = {}
    , configs_dir = process.cwd() + '/config'
    , filepath = ''
    , filenoext = '';
  fs.readdir(configs_dir, function(err, files){
    files.forEach(function(file){
      filepath = configs_dir + '/' + file;
      filenoext = file.split('.')[0];
      configs[filenoext] = JSON.parse(fs.readFileSync(filepath));
    });
  });
  app.locals({
    config: configs
  })
}


/**
 * Create the main app
 */
var app = module.exports = express.createServer();


/**
 * Configuration of the express app
 */
loadUserConfig();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'topsecret' }));
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  console.log('Application started in development mode.')
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
  console.log('Application started in production mode.');
});


/**
 * Map routes to app functions
 */
var help = require('./controllers/help')
  , about = require('./controllers/about')
  , browse = require('./controllers/browse');

app.get('/', function(req, res){
  res.render('index', {
    title: 'j.nome.s'
  });
});

help.route(app);
about.route(app);
browse.route(app);


/**
 * Start the express app
 */
if (!module.parent) {
  app.listen(3000);
  console.log("j.nome.s listening on port %d", app.address().port);
}
