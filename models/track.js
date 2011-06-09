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
  _id: Number
, seqid: String
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
  this.name = name;
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
  var self = this;
  self.model.find({
    seqid: seqid
  , start: {$lt: end}
  , end: {$gt: start}
  }, function(err, docs){
    callback(err, {
      name: self.name
    , docs: docs
    });
  });
}



/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
