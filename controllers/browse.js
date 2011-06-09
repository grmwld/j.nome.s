/**
 * Module dependencies
 */
var dbutils = require('../lib/dbutils')
  , Reference = require('../models/reference').Reference
  , Track = require('../models/track').Track
  , TrackCollection = require('../models/track').TrackCollection;


/**
 * Function used to handle the routing associated to
 * the dataset controller
 *
 * @param {Application} express app
 * @api public
 */
var route = function(app){

  /**
   * Route to a specific dataset
   *
   * @handles {Route#GET} /browse/:dataset
   * @api public
   */
  app.get('/browse/:dataset', dbutils.connect, function(req, res){
    res.render('browse', {
      title: req.params.dataset
    , dataset: req.params.dataset
    , seqid: 'seqid'
    , start: 'start'
    , end: 'end'
    , checked: {}
    , data: ''
    });
  });

  /**
   * Route to a specific dataset
   *
   * @handles {Route#POST} /browse/:dataset
   * @api public
   */
  app.post('/browse/:dataset', dbutils.connect, function(req, res){
    var track = new Track(req.body.track, req.body.track);
    track.fetchInInterval(
      req.body.seqid
    , req.body.start
    , req.body.end
    , function(err, data){
        res.send(data);
      }
    );
  });

  /**
   * Route to a specific seqid
   *
   * @handles {Route#GET} /browse/:dataset/:seqid
   * @api public
   */
  app.get('/browse/:dataset/:seqid', dbutils.connect, function(req, res){
    var reference = new Reference();
    reference.findById(req.params.seqid, function(err, doc){
      res.send(doc);
    });
  });

  /**
   * Route to a specific range, with specified collections
   *
   * @handles {Route#GET} /browse/:dataset/:seqid/:start/:end/:tracks
   * @api public
   */
  app.get('/browse/:dataset/:seqid/:start/:end/:tracks', dbutils.connect, function(req, res){
    var checked = {};
    req.params.tracks.split('&').forEach(function(track){
      checked[track] = true;
    });
    res.render('browse', {
      title: 'j.nome.s : browse'
    , dataset: req.params.dataset
    , seqid: req.params.seqid
    , start: req.params.start
    , end: req.params.end
    , checked: checked
    });
  });

  /**
   * Redirect to base url of dataset if parameters are incomplete
   *
   * @handles {Route#GET} /browse/:dataset/*
   * @api public
   */
  app.get('/browse/:dataset/*', dbutils.connect, function(req, res){
    res.redirect('/browse/' + req.params.dataset);
  });

}


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
