/**
 * Module dependencies
 */
var util = require('util')
  , mongoose = require('mongoose')
  , async = require('async')
  , utils = require('../lib/utils');


/**
 * Mongoose schema representing a document from a
 * jff formatted collection.
 * Corresponds to an entry from a track
 */
var TrackSchema = new mongoose.Schema({
  seqid: String
, source: String
, type: String
, start: Number
, end: Number
, score: Number
, phase: Number
, strand: String
});


/**
 * Class representing a track.
 * 
 * @param {String} name
 * @param {String} collection
 * @api public
 */
var Track = function(name, track){
  this.model =  mongoose.model(name, TrackSchema, track);
}

/**
 * Fetch all documents on seqid between 2 positions
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @api public
 */
Track.prototype.fetchInInterval = function(seqid, start, end, callback){
  self = this;
  self.model.find({
    seqid: seqid
  , start: {$lt: end}
  , end: {$gt: start}
  }, function(err, docs){
    callback(err, docs);
  });
}


/**
 * Class representing a collection of tracks.
 * It initializes a collection of Track objects
 * based on the provided list of track names.
 *
 * @param {Array} track names
 * @see {Track}
 * @api public
 */
var TrackCollection = function(tracknames){
  var self = this;
  self.tracks = {};
  tracknames.forEach(function(trackname){
    self.tracks[trackname] = new Track(trackname, trackname);
  });
}

/**
 * Fetch all documents between 2 position on a given seqid.
 * Relies on the individual fetchInInterval method of
 * the Track objects.
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @see {Track#fetchInInterval}
 * @api public
 */
TrackCollection.prototype.fetchInInterval = function(seqid, start, end, callback){
  var self = this
    , data = {};
  for(var i in self.tracks){
    self.tracks[i].fetchInInterval(seqid, start, end, function(err, docs){
      data[i] = docs;
    });
  }
  async.whilst(
    function(){ return Object.size(data) < Object.size(self.tracks); },
    function(cb){ setTimeout(cb, 100); },
    function(err){ callback(err, data); }
  );
}


/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
exports.TrackCollection = TrackCollection;
