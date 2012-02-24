/**
 * Module dependencies
 */
var Mongolian = require('mongolian')
var processProfile = require('../lib/cutils').processProfile;


/**
 * Compute step according to the length of the selected region
 *
 * @param {Number} span
 * @return {Number} step
 */
var getStep = function(span) {
  if (span <= 1000000) {
    return ~~(span/10000) + 1;
  }
  return Math.pow(10, (~~(Math.log(span)/Math.log(10)) - 4)) * 5;
};

/**
 * Inserts a processed profile in the database.
 * Fetching from this cached profile is faster than
 * processing the processed profile each time.
 *
 * @param {MongolianCollection} collection
 * @param {String} seqid
 * @param {Number} step
 * @param {Function} callback
 */
var cacheProfile = function(collection, seqid, step, callback) {
  collection.find({ seqid: seqid }).toArray(function(err, docs) {
    var pdocs = processProfile(docs, step);
    pdocs.forEach(function(doc) {
      doc.step = step;
      collection.insert(doc, function(){});
    });
    callback();
  });
};

/**
 * Function invoked to query a profile track (collection).
 * This function takes care of querying the cached profile if
 * it exists, or to compute it and cache it if it doesn't.
 * If the step used in the profile processing is < 500,
 * the profile is processed on the fly.
 *
 * @param {MongolianCollection} col
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Function} callback
 */
var queryProfile = function(collection, seqid, start, end, step, callback) {
  var query = {
    seqid: seqid
  , start: { $lt: end }
  , end: { $gt: start }
  , step: { $exists: false }
  };
  var sortOrder = {
    seqid: 1
  , start: 1
  , end: 1
  };
  var blFields = {_id:0, seqid:0}
  if (step % 500 === 0) {
    var queryCache = query;
    queryCache.step = step;
    collection.find(queryCache, blFields).sort(sortOrder).toArray(function(err, cachedDocs) {
      if (cachedDocs.length === 0) {
        cacheProfile(collection, seqid, step, function() {
          collection.find(queryCache, blFields).sort(sortOrder).toArray(function(err, cachedDocs) {
            callback(err, cachedDocs);
          });
        });
      } else {
        callback(err, cachedDocs);
      }
    });
  } else {
    collection.find(query, blFields).sort(sortOrder).toArray(function(err, docs) {
      if (docs.length) {
        docs[0].start = start;
        if (docs[docs.length-1].end > end) {
          docs[docs.length-1].end = end;
        }
        else if (docs[docs.length-1].end < end) {
          docs.push({
            start: docs[docs.length-1].end
          , end: end
          , score: 0
          });
        }
      }
      callback(err, processProfile(docs, step));
    });
  }
};

/**
 * Function invoked to query a reference track.
 *
 * @param {MongolianCollection} collection
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Function} callback
 */
var queryRef = function(collection, seqid, start, end, callback) {
  collection.find({
    seqid: seqid
  , start: { $lt: end }
  , end: { $gt: start }
  }).toArray(function(err, docs) {
    callback(err, docs);
  });
};


var Track = (function() {
  return function(db, metadata) {
    if (metadata.type === 'ref') {
      return new TrackRef(db, metadata);
    }
    else if (metadata.type === 'profile') {
      return new TrackProfile(db, metadata);
    }
  }
})();


/**
 * Class representing a Base Track.
 * 
 * @param {String} name
 * @param {String} collection
 * @api private
 */
var TrackBase = function(db, metadata) {
  this.db = db;
  this.metadata = metadata;
};


/**
 * Class representing a Ref Track.
 *
 * @param {String} name
 * @param {String} collection
 * @api private
 */
var TrackRef = function(db, metadata) {
  TrackBase.call(this, db, metadata);
  this.collection = this.db.collection(metadata.id);
};

TrackRef.prototype = new TrackBase;

/**
 * Fetch all documents on seqid between 2 positions
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @api public
 */
TrackRef.prototype.fetchInInterval = function(seqid, start, end, callback) {
  var self = this
    , start = ~~start
    , end = ~~end
  queryRef(self.collection, seqid, start, end, function(err, docs) {
    callback(err, docs);
  });
};
 

/**
 * Class representing a Ref Track.
 *
 * @param {String} name
 * @param {String} collection
 * @api private
 */
var TrackProfile = function(db, metadata) {
  TrackBase.call(this, db, metadata);
  this.collection = this.db.collection(metadata.id);
};

TrackProfile.prototype = new TrackBase;

/**
 * Fetch all documents on seqid between 2 positions
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @api public
 */
TrackProfile.prototype.fetchInInterval = function(seqid, start, end, callback) {
  var self = this
    , start = ~~start
    , end = ~~end
    , step = getStep(end - start);
  queryProfile(self.collection, seqid, start, end, step, function(err, docs) {
    callback(err, docs);
  });
};


/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
exports.TrackRef = TrackRef;
exports.TrackProfile = TrackProfile;
