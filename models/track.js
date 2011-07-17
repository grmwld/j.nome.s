/**
 * Module dependencies
 */
var Mongolian = require('mongolian')
var cutils = require('../lib/cutils');


/**
 * Class representing a track.
 * 
 * @param {String} name
 * @param {String} collection
 * @api public
 */
var Track = function(db, metadata) {
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
Track.prototype.fetchInInterval = function(seqid, start, end, callback) {
  var self = this
    , start = parseInt(start, 10)
    , end = parseInt(end, 10)
    , data;
  self.collection.find({
    seqid: seqid
  , start: { $lt: end }
  , end: { $gt: start }
  }).toArray(function(err, docs) {
    if (self.metadata.type === 'profile') {
      callback(null, {
        metadata: self.metadata
      , data: cutils.processProfile(docs)
      });
    } else {
      callback(err, {
        metadata: self.metadata
      , data: docs
      });
    }
  });
};


/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
