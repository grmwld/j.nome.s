var mongoose = require('mongoose')
  , Schema = mongoose.Schema;


// Mongoose Schema.

var TrackSchema = new Schema({
  seqid: String
, source: String
, type: String
, start: Number
, end: Number
, score: Number
, phase: Number
, strand: String
});


var Track = function(name, track){
  this.model =  mongoose.model(name, TrackSchema, track);
}

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


exports.Track = Track;
