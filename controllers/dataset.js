var mongoose = require('mongoose')
  , dbutils = require('../lib/dbutils')
  , Reference = require('../models/reference').Reference
  , Track = require('../models/track').createTrack;

var route = function(app){

  app.get('/datasets/:dataset', dbutils.connectdb, function(req, res){
    res.render('dataset', {
      title: req.params.dataset
    , dataset: req.params.dataset 
    });
  });

  app.get('/datasets/:dataset/:seqid', dbutils.connectdb, function(req, res){
    var reference = new Reference();
    reference.findById(req.params.seqid, function(err, doc){
      res.send(doc);
    });
  });

  app.get('/datasets/:dataset/:seqid/:start/:stop/:tracks', dbutils.connectdb, function(req, res){
    var tracksNames = req.params.tracks
      , track = Track(tracksNames, tracksNames);
    track.find({
      seqid: req.params.seqid
    }, function(err, docs){
      try {
      console.log(docs);
      res.send(docs);
      } catch (e) {
        console.log(e);
      }
    });
  });

}


exports.route = route;
