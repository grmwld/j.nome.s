var mongoose = require('mongoose')
  , Schema = mongoose.Schema;


// Mongoose Schema.

var Track = new Schema({
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
 * Fetch data from this track between 2 positions
 */
Track.method('fetchInInterval', function(seqid, start, stop, callback){
  Track.findById(0, function(){
    callback();
  });
});


var createTrack = function(name, track){
  return mongoose.model(name, Track, track);
}

exports.Track = Track;
exports.createTrack = createTrack;
