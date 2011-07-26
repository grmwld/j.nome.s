/**
 * Module dependencies
 */
var dbutils = require('../lib/dbutils');
var Reference = require('../models/reference').Reference;
var Track = require('../models/track').Track;


/**
 * Function used to handle the routing associated to
 * the dataset controller.
 *
 * @param {Object} application
 * @api public
 */
var route = function(app) {

  /**
   * Route to a specific dataset
   *
   * Handling this route triggers the dbutils.connect middleware
   * in order to connect to the mongo database.
   * The browse/index.jade view is rendered in case of success.
   *
   * @see dbutils.connect
   * @handles {Route#GET} /browse/:dataset
   */
  app.get('/browse/:dataset', dbutils.connect, function(req, res, next) {
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
   * Respond to AJAX track requests.
   *
   * Handling this route triggers the dbutils.connect middleware
   * in order to connect to the mongo database.
   * The track data is sent to the AJAX request event.
   *
   * @see dbutils.connect
   * @handles {Route#POST} /browse/:dataset
   */
  app.post('/browse/:dataset', dbutils.connect, function(req, res) {
    console.log(req.body);
    console.log(app._locals.config[req.params.dataset].tracks[req.body.trackID]);
    var track = new Track(req.dataset, app._locals.config[req.params.dataset].tracks[req.body.trackID]);
    track.fetchInInterval(
      req.body.seqid
    , req.body.start
    , req.body.end
    , function(err, data) {
        res.send(data);
      }
    );
  });
  
  /**
   * Fetches the metadata of a specific track
   *
   * Handling this route triggers the dbutils.connect middleware
   * in order to connect to the mongo database.
   *
   * @see dbutils.connect
   * @handles {Route#GET} /browse/:dataset/:trackid.json
   */
  app.get('/browse/:dataset/track/:trackid.:format', dbutils.connect, function(req, res) {
    if (req.params.format === 'json') {
      res.send(app._locals.config[req.params.dataset].tracks[req.params.trackid]);
    }
  });

  /**
   * Fetches the metadata of a specific seqid
   *
   * Handling this route triggers the dbutils.connect middleware
   * in order to connect to the mongo database.
   *
   * @see dbutils.connect
   * @handles {Route#GET} /browse/:dataset/:seqid.json
   */
  app.get('/browse/:dataset/:seqid.:format', dbutils.connect, function(req, res) {
    if (req.params.format === 'json') {
      var reference = new Reference(req.dataset);
      reference.getMetadata(req.params.seqid, function(err, metadata) {
        res.send(metadata);
      });
    }
  });

  /**
   * Route to a specific range, with specified collections
   *
   * Handling this route triggers the dbutils.connect middleware
   * in order to connect to the mongo database.
   *
   * @see dbutils.connect
   * @handles {Route#GET} /browse/:dataset/:seqid/:start/:end/:tracks
   */
  app.get('/browse/:dataset/:seqid/:start/:end/:tracks', dbutils.connect, function(req, res) {
    var checked = {};
    req.params.tracks.split('&').forEach(function(track) {
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
   * Handling this route triggers the dbutils.connect middleware
   * in order to connect to the mongo database.
   *
   * @see dbutils.connect
   * @handles {Route#GET} /browse/:dataset/*
   */
  app.get('/browse/:dataset/*', dbutils.connect, function(req, res) {
    res.redirect('/browse/' + req.params.dataset);
  });

};


/**
 * Expose public functions, classes and methods
 */
exports.route = route;
