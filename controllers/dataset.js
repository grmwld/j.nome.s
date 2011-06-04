var mongoose = require('mongoose')
  , dbutils = require('../lib/dbutils')
  , Reference = require('../models/reference').Reference
  , Track = require('../models/track').Track;

var route = function(app){

  app.get('/datasets/:dataset', dbutils.connect, function(req, res){
    res.render('dataset', {
      title: req.params.dataset
    , dataset: req.params.dataset 
    });
  });

  app.get('/datasets/:dataset/:seqid', dbutils.connect, function(req, res){
    var reference = new Reference();
    reference.findById(req.params.seqid, function(err, doc){
      res.send(doc);
    });
  });

  app.get('/datasets/:dataset/:seqid/:start/:end/:tracks', dbutils.connect, function(req, res){
    var tracksNames = req.params.tracks
      , track = new Track(tracksNames, tracksNames);
    track.fetchInInterval(req.params.seqid, req.params.start, req.params.end, function(err, docs){
      res.send(docs);
    });
  });

}


exports.route = route;
