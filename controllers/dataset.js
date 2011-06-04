var dbutils = require('../lib/dbutils')
  , Reference = require('../models/reference').Reference;

var route = function(app){

  app.get('/datasets/:dataset', dbutils.connectdb, function(req, res){
    res.render('dataset', {
      title: req.params.dataset
    , dataset: req.currentdb.databaseName 
    });
  });

  app.get('/datasets/:dataset/:seqid', dbutils.connectdb, function(req, res){
    var reference = new Reference();
    reference.findById(req.params.seqid, function(err, doc){
      res.send('seq ' + doc.data);
    });
  });
}

exports.route = route;
