var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , dbutils = require('../lib/dbutils');


// Mongoose Schema.

var File = new Schema({
  chunksize: Number
, length: Number
, md5: String
, filename: String
, _id: String
});

var Chunk = new Schema({
  files_id: [File]
, n: Number
});

Chunk.virtual('data')
  .get(function(){
    return this.doc.data.buffer.toString().slice(0, -256);
  });


/**
 * Class to easily access the reference genome stored in a GrifFS
 */
var Reference = function(){
  this.files = mongoose.model('File', File, 'fs.files');
  this.chunks = mongoose.model('Chunk', Chunk, 'fs.chunks');
}

/**
 * Get the sequence corresponding to the given seqid
 */
Reference.prototype.findById = function(id, callback){
  var self = this;
  var data = '';
  self.files.findById(id, function(err, file){
    self.chunks.find({files_id: id}, [], function(err, chunks){
      chunks.forEach(function(chunk){
        data += chunk.data;
      });
      callback(null, {
        _id: file['_id']
      , length: file['length']
      , md5: file['md5']
      , data: data
      });
    });
  });
}

exports.Reference = Reference
