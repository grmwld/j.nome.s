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
   * @handles {Route} /datasets/:dataset
   */
  app.get('/datasets/:dataset', dbutils.connect, function(req, res){
    res.render('dataset', {
      title: req.params.dataset
    , dataset: req.params.dataset 
    });
  });

  /**
   * Route to a specific seqid
   *
   * @handles {Route} /datasets/:dataset/:seqid
   */
  app.get('/datasets/:dataset/:seqid', dbutils.connect, function(req, res){
    var reference = new Reference();
    reference.findById(req.params.seqid, function(err, doc){
      res.send(doc);
    });
  });

  /**
   * Route to a specific range, with specified collections
   *
   * @handles {Route} /datasets/:dataset/:seqid/:start/:end/:tracks
   */
  app.get('/datasets/:dataset/:seqid/:start/:end/:tracks', dbutils.connect, function(req, res){
    var tracks = new TrackCollection(req.params.tracks.split('&'))
      , seqid = req.params.seqid
      , start = req.params.start
      , end = req.params.end;
    tracks.fetchInInterval(seqid, start, end, function(err, data){
      res.send(data);
    });
  });

}


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
