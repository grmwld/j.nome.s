/**
 * Module dependencies
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema


/**
 * Mongoose schema representing the fs.files part of a GridStore
 *
 * @api private
 */
var File = new Schema({
  chunksize: Number
, length: Number
, md5: String
, filename: String
, _id: String
});

/**
 * Mongoose schema representing the fs.chunks part of a GridStore
 *
 * @api private
 */
var Chunk = new Schema({
  files_id: [File]
, n: Number
});

/**
 * Virtual method allowing easy access to the data
 * contained in a GridStore object
 *
 * @api private
 */
Chunk.virtual('data')
  .get(function(){
    return this.doc.data.buffer.toString().slice(0, -256);
  });


/**
 * Class to easily access the reference genome stored in a GrifFS
 *
 * @api public
 */
var Reference = function(){
  this.files = mongoose.model('File', File, 'fs.files');
  this.chunks = mongoose.model('Chunk', Chunk, 'fs.chunks');
}

/**
 * Gets the length of a seqid.
 *
 * @param {String} seqid
 * @param {Function} callback
 * @api public
 */
Reference.prototype.getMetadata = function(seqid, callback){
  var self = this;
  self.files.findById(seqid, function(err, doc){
    callback(err, doc);
  });
};

/**
 * Get the sequence corresponding to the given seqid
 *
 * @param {String} id
 * @param {Function} callback
 * @api public
 */
Reference.prototype.findById = function(id, callback){
  var self = this
    , data = '';
  self.files.findById(id, function(err, file){
    if (file){
      self.chunks.find({files_id: id}, [], function(err, chunks){
        chunks.forEach(function(chunk){
          data += chunk.data;
        });
        callback(err, {
          _id: file['_id']
        , length: file['length']
        , md5: file['md5']
        , data: data
        });
      });
    } else {
      callback(err, {});
    }
  });
}


/**
 * Expose public functions, classes and methods
 */
exports.Reference = Reference
