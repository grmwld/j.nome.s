/**
 * Module dependencies
 */
var util = require('util')
  , utils = require('../lib/utils');

var Mongolian = require('mongolian');

/**
 * Class representing a track.
 * 
 * @param {String} name
 * @param {String} collection
 * @api public
 */
var Track = function(db, metadata){
  this.metadata = metadata;
  this.db = db;
  this.collection = this.db.collection(metadata.id);
};

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
  self.collection.find({
    seqid: seqid
  , start: {$lt: parseInt(end, 10)}
  , end: {$gt: parseInt(start, 10)}
  }).toArray(function(err, docs){
    console.log(docs);
    callback(err, {
      metadata: self.metadata
    , data: docs
    });
  });
};



/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
