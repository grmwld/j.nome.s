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
   */
  app.get('/browse/:dataset', dbutils.connect, function(req, res){
    res.render('browse', {
      title: req.params.dataset
    , dataset: req.params.dataset
    , seqid: ''
    , start: ''
    , end: ''
    , checked: {}
    , data: ''
    });
  });

  /**
   * Route to a specific dataset
   *
   * @handles {Route#POST} /browse/:dataset
   */
  app.post('/browse/:dataset', dbutils.connect, function(req, res){
    var tracks = new TrackCollection(req.body.tracks);
    tracks.fetchInInterval(
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
   */
  app.get('/browse/:dataset/:seqid/:start/:end/:tracks', dbutils.connect, function(req, res){
    var tracks = new TrackCollection(req.params.tracks.split('&'))
      , checked = {};
    req.params.tracks.split('&').forEach(function(track){
      checked[track] = true;
    });
    tracks.fetchInInterval(
      req.params.seqid
    , req.params.start
    , req.params.end
    , function(err, data){
        res.render('browse', {
          title: 'j.nome.s : browse'
        , dataset: req.params.dataset
        , seqid: req.params.seqid
        , start: req.params.start
        , end: req.params.end
        , checked: checked
        , data: JSON.stringify(data)
        });
      }
    );
  });

}


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
