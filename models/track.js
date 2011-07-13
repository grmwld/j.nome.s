/**
 * Module dependencies
 */
var util = require('util')
  , async = require('async')
  , Mongolian = require('mongolian')
  , utils = require('../lib/utils');


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
  var self = this
    , start = parseInt(start, 10)
    , end = parseInt(end, 10)
  self.collection.find({
    seqid: seqid
  , start: {$lt: end}
  , end: {$gt: start}
  }).toArray(function(err, docs){
    if (self.metadata.type === 'profile' && docs.length > 10000){
      processProfile(docs, function(data){
        callback(null, {
          metadata: self.metadata
        , data: data
        });
      });
    } else {
      callback(err, {
        metadata: self.metadata
      , data: docs
      });
    }
  });
};

var processProfile = function(docs, callback){
  var smoothed = []
    , score = 0
    , start = docs[0].start
    , length = 0
    , step = parseInt(Math.min((docs[docs.length-1].end - docs[0].start) / 10000, 1000), 10)
    , i = 0;
  docs.forEach(function(doc){
    for (i = doc.start; i < doc.end; i++){
      score += doc.score;
      length++;
      if (length === step){
        smoothed.push({
          start: start
        , end: start + length
        , score: ~~(score/length)
        });
        score = 0;
        start = i;
        length = 0;
      }
    }
  });
  callback(smoothed);
};

/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
