/**
 * Module dependencies
 */
var Mongolian = require('mongolian')
var processProfile = require('../lib/cutils').processProfile;


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
  var self = this;
  var start = ~~start;
  var end = ~~end;
  var step = ~~(Math.min((end-start)/2000+1, 2000));
  self.collection.find({
    seqid: seqid
  , start: { $lt: end }
  , end: { $gt: start }
  }).toArray(function(err, docs) {
    callback(null, {
      metadata: self.metadata
    , data: self.metadata.type === 'profile' ? processProfile(docs, step) : docs
    });
  });
};


/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
