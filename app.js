
/**
 * Module dependencies.
 */

var fs = require('fs')
  , express = require('express')
  , Resource = require('express-resource')
  , expose = require('express-expose');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('local_config', JSON.parse(fs.readFileSync(process.cwd() + '/config.json')));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  //app.use(express.session({ secret: 'your secret here' }));
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

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'j.nome.s',
    datasets: app.settings.local_config['datasets']
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("j.nome.s listening on port %d", app.address().port);
}
