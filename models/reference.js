/**
 * Module dependencies
 */
var Mongolian = require('mongolian')
  , NotFound = require('../controllers/errors').NotFound;


/**
 * Class to easily access the reference genome stored in a GrifFS
 *
 * @api public
 */
var Reference = function(db){
  this.gridfs = db.gridfs();
}

/**
 * Gets the metadata of seqid stored in the gridfs.
 *
 * @param {String} seqid
 * @param {Function} callback
 * @api public
 */
Reference.prototype.getMetadata = function(seqid, callback) {
  var self = this;
  self.gridfs.findOne(seqid, function(err, doc) {
    if (doc) {
      callback(err, {
        _id: doc._id
      , length: doc.length
      , chunkSize: doc.chunkSize
      , md5: doc.md5
      , filename: doc.filename
      , contentType: doc.contentType
      , uploadDate: doc.uploadDate
      });
    } else {
      callback(err, null);
    }
  });
};

/**
 * Get the sequence corresponding to the given seqid
 *
 * @param {String} id
 * @param {Function} callback
 * @api public
 */
//Reference.prototype.findById = function(id, callback){
  //var self = this
    //, data = '';
  //self.files.findById(id, function(err, file){
    //if (file){
      //self.chunks.find({files_id: id}, [], function(err, chunks){
        //chunks.forEach(function(chunk){
          //data += chunk.data;
        //});
        //callback(err, {
          //_id: file['_id']
        //, length: file['length']
        //, md5: file['md5']
        //, data: data
        //});
      //});
    //} else {
      //callback(err, {});
    //}
  //});
//};


/**
 * Expose public functions, classes and methods
 */
exports.Reference = Reference
