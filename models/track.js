/**
 * Module dependencies
 */
var Mongolian = require('mongolian');
var execFile = require('child_process').execFile;
var processProfile = require('../lib/cutils').processProfile;
var bigwig = require('../lib/bigwig');


var emitLines = function(stream) {
  var backlog = '';
  stream.on('data', function(data) {
    backlog += data;
    var n = backlog.indexOf('\n');
    while (~n) {
      stream.emit('line', backlog.substring(0, n));
      backlog = backlog.substring(n + 1)
      n = backlog.indexOf('\n')
    }
  });
  stream.on('end', function() {
    if (backlog) {
      stream.emit('line', backlog);
    }
  });
};


/**
 * Compute step according to the length of the selected region
 *
 * @param {Number} span
 * @return {Number} step
 */
var getStep = function(span) {
  if (span <= 1000000) {
    return ~~(span/1000) + 1;
  }
  var step = Math.pow(10, (~~(Math.log(span)/Math.log(10))) - 3) * 2;
  var midspan = (Math.pow(10, (~~(Math.log(span)/Math.log(10)) + 1)) - Math.pow(10, (~~(Math.log(span)/Math.log(10))))) / 2;
  if (span < midspan) {
    return step;
  } else {
    return step * 5;
  }
};




var Track = (function() {
  return function(db, metadata) {
    if (metadata.type === 'ref') {
      return new TrackRef(db, metadata);
    }
    else if (metadata.type === 'profile') {
      return new TrackProfile(db, metadata);
    }
    else if (metadata.type === 'oriented-profile') {
      return new TrackOrientedProfile(db, metadata);
    }
  };
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

TrackRef.prototype = new TrackBase();

/**
 * Fetch all documents on seqid between 2 positions
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @api public
 */
TrackRef.prototype.fetchInInterval = function(seqid, strand, start, end, callback) {
  var self = this;
  this.query(seqid, ~~start, ~~end, function(err, docs) {
    callback(err, docs);
  });
};

/**
 * Perform a query
 */
TrackRef.prototype.query = function(seqid, start, end, callback) {
  this.collection.find({
    seqid: seqid,
    start: { $lt: end },
    end: { $gt: start }
  }).toArray(function(err, docs) {
    callback(err, docs);
  });
};
 


/**
 * Class representing a Profile Track.
 *
 * @param {String} name
 * @param {String} collection
 * @api private
 */
var TrackProfile = function(db, metadata) {
  TrackBase.call(this, db, metadata);
  this.collection = this.db.collection(metadata.id);
};

TrackProfile.prototype = new TrackBase();

/**
 * Fetch all documents on seqid between 2 positions
 * will choose automatically between query and queryCache
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @api public
 */
TrackProfile.prototype.fetchInInterval = function(seqid, strand, start, end, callback) {
  var self = this;
  var step = getStep(~~end - ~~start);
  if (self.metadata.backend === 'bigwig') {
    self.queryBigWig(seqid, ~~start, ~~end, Math.min(~~end - ~~start, 1024), function(err, docs) {
      callback(err, docs);
    });
  }
  else {
    if (step % 2000 === 0) {
      self.queryCache(seqid, ~~start, ~~end, step, function(err, docs) {
        callback(err, docs);
      });
    } else {
      self.query(seqid, ~~start, ~~end, step, function(err, docs) {
        callback(err, docs);
      });
    }
  }
};

/**
 * Query on raw data and return a processed profile
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Function} callback
 * @api private
 */
TrackProfile.prototype.queryBigWig = function(seqid, start, end, nbins, callback) {
  var self = this;
  docs = bigwig.summary('./store/SRR002051_chrI-II-III-IV.profile.bw', seqid, start, end, nbins);
  callback(null, docs);
};

/**
 * Query on raw data and return a processed profile
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Function} callback
 * @api private
 */
TrackProfile.prototype.query = function(seqid, start, end, step, callback) {
  var self = this;
  var fields = {_id: 0, start:1, end:1, score:1};
  var query = {
        seqid: seqid,
        start: { $lt: end },
        end: { $gt: start },
        step: { $exists: false }
      };
  var sortOrder = {
        seqid: 1,
        start: 1,
        end: 1
      };
  self.collection
    .find(query, fields)
    .sort(sortOrder)
    .toArray(function(err, docs) {
      if (docs.length) {
        docs[0].start = start;
        if (docs[docs.length-1].end > end) {
          docs[docs.length-1].end = end;
        }
        else if (docs[docs.length-1].end < end) {
          docs.push({
            start: docs[docs.length-1].end,
            end: end,
            score: 0
          });
        }
      }
      callback(err, processProfile(docs, step));
    });
};

/**
 * Query on cached profiles. If the cache does not exist,
 * will compute it before.
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Function} callback
 * @api private
 */
TrackProfile.prototype.queryCache = function(seqid, start, end, step, callback) {
  var self = this;
  var fields = {_id: 0, start:1, end:1, score:1};
  var query = {
        seqid: seqid,
        start: { $lt: end },
        end: { $gt: start },
        step: step
      };
  var sortOrder = {
        seqid: 1,
        start: 1,
        end: 1
      };
  self.collection
    .find(query, fields)
    .sort(sortOrder)
    .toArray(function(err, cachedDocs) {
      if (cachedDocs.length === 0) {
        self.cacheProfile(seqid, step, function() {
          self.collection
            .find(query, fields)
            .sort(sortOrder)
            .toArray(function(err, cachedDocs) {
              callback(err, cachedDocs);
            });
        });
      } else {
        callback(err, cachedDocs);
      }
    });
};

/**
 * Inserts a processed profile in the database.
 * Fetching from this cached profile is faster than
 * processing the processed profile each time.
 *
 * @param {String} seqid
 * @param {Number} step
 * @param {Function} callback
 */
TrackProfile.prototype.cacheProfile = function(seqid, step, callback) {
  var self = this;
  var fields = {_id: 0, start:1, end:1, score:1};
  var query = { seqid: seqid };
  self.collection
    .find(query, fields)
    .toArray(function(err, docs) {
      processProfile(docs, step).forEach(function(doc) {
        doc.seqid = seqid;
        doc.step = step;
        self.collection.insert(doc, function(){});
      });
      callback();
    });
};



/**
 * Class representing an Oriented Profile Track.
 *
 * @param {String} name
 * @param {String} collection
 * @api private
 */
var TrackOrientedProfile = function(db, metadata) {
  TrackBase.call(this, db, metadata);
  this.collection = this.db.collection(metadata.id);
};

TrackOrientedProfile.prototype = new TrackBase();

/**
 * Fetch all documents on seqid between 2 positions
 * will choose automatically between query and queryCache
 *
 * @param {String} seqid
 * @param {String} strand
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @api public
 */
TrackOrientedProfile.prototype.fetchInInterval = function(seqid, strand, start, end, callback) {
  var self = this;
  var step = getStep(~~end - ~~start);
  if (step % 2000 === 0) {
    self.queryCache(seqid, strand, ~~start, ~~end, step, function(err, docs) {
      callback(err, docs);
    });
  } else {
    self.query(seqid, strand, ~~start, ~~end, step, function(err, docs) {
      callback(err, docs);
    });
  }
};

/**
 * Query on raw data and return a processed profile
 *
 * @param {String} seqid
 * @param {String} strand
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Function} callback
 * @api private
 */
TrackOrientedProfile.prototype.query = function(seqid, strand, start, end, step, callback) {
  var self = this;
  var fields = {_id: 0, start:1, end:1, score:1};
  var query = {
        seqid: seqid,
        strand: strand,
        start: { $lt: end },
        end: { $gt: start },
        step: { $exists: false }
      };
  var sortOrder = {
        seqid: 1,
        start: 1,
        end: 1
      };
  self.collection
    .find(query, fields)
    .sort(sortOrder)
    .toArray(function(err, docs) {
      if (docs.length) {
        docs[0].start = start;
        if (docs[docs.length-1].end > end) {
          docs[docs.length-1].end = end;
        }
        else if (docs[docs.length-1].end < end) {
          docs.push({
            start: docs[docs.length-1].end,
            end: end,
            score: 0
          });
        }
      }
      callback(err, processProfile(docs, step));
    });
};

/**
 * Query on cached profiles. If the cache does not exist,
 * will compute it before.
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Function} callback
 * @api private
 */
TrackOrientedProfile.prototype.queryCache = function(seqid, strand, start, end, step, callback) {
  var self = this;
  var fields = {_id: 0, start:1, end:1, score:1};
  var query = {
        seqid: seqid,
        strand: strand,
        start: { $lt: end },
        end: { $gt: start },
        step: step
      };
  var sortOrder = {
        seqid: 1,
        start: 1,
        end: 1
      };
  self.collection
    .find(query, fields)
    .sort(sortOrder)
    .toArray(function(err, cachedDocs) {
      if (cachedDocs.length === 0) {
        self.cacheProfile(seqid, strand, step, function() {
          self.collection
            .find(query, fields)
            .sort(sortOrder)
            .toArray(function(err, cachedDocs) {
              callback(err, cachedDocs);
            });
        });
      } else {
        callback(err, cachedDocs);
      }
    });
};

/**
 * Inserts a processed profile in the database.
 * Fetching from this cached profile is faster than
 * processing the processed profile each time.
 *
 * @param {String} seqid
 * @param {Number} step
 * @param {Function} callback
 */
TrackOrientedProfile.prototype.cacheProfile = function(seqid, strand, step, callback) {
  var self = this;
  var fields = {_id: 0, start:1, end:1, score:1};
  var query = {
        seqid: seqid,
        strand: strand
      };
  self.collection
    .find(query)
    .toArray(function(err, docs) {
      processProfile(docs, step).forEach(function(doc) {
        doc.seqid = seqid;
        doc.step = step;
        doc.strand = strand;
        self.collection.insert(doc, function(){});
      });
      callback();
    });
};



/**
 * Expose public functions, classes and methods
 */
exports.Track = Track;
exports.TrackRef = TrackRef;
exports.TrackProfile = TrackProfile;
exports.TrackOrientedProfile = TrackOrientedProfile;
