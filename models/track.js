/**
 * Module dependencies
 */
var util = require('util')
    async = require('async')
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
  var self = this
    , step = 1000000
    , params = [];
  for (var i = parseInt(start, 10); i < parseInt(end, 10); i+=step){
    params.push([self.collection, seqid, i, i+step]);
  }
  setTimeout(function(){
    async.concat(params, findInterval, function(err, results){
      callback(err, {
        metadata: self.metadata
      , data: results
      });
    });
  }, 200);
};

var findInterval = function(params, callback){
  var collection = params[0]
    , seqid = params[1]
    , start = params[2]
    , end = params[3]
  collection.find({
    seqid: seqid
  , start: {$lt: end}
  , end: {$gt: start}
  }).toArray(function(err, docs){
    callback(err, docs);
  });
};


/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
