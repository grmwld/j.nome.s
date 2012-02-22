var expect = require('chai').expect
  , Mongolian = require('mongolian')
  , errors = require('../controllers/errors')
  , Reference = require('../models/reference').Reference
  , Track = require('../models/track').Track;

describe('Reference', function() {
  var server = new Mongolian({
    log: {
      debug: function(message) {},
      info: function(message) {},
      warn: function(message) {},
      error: function(message) {}
    }
  })
    , dataset = server.db('SacCer-demo'); 

  describe('#getMetadata', function() {
    
    it('responds with metadata if seqid is valid', function(done) {
      var reference = new Reference(dataset);
      reference.getMetadata('chrI', function(err, metadata) {
        expect(err).to.not.exist;
        expect(metadata).to.be.a('object');
        expect(metadata).to.have.keys([
          '_id'
        , 'length'
        , 'chunkSize'
        , 'md5'
        , 'filename'
        , 'contentType'
        , 'uploadDate'
        ]);
        expect(metadata.uploadDate).to.be.an.instanceof(Date);
        done();
      });
    });
    
    it('responds with an error if seqid is invalid', function(done) {
      var reference = new Reference(dataset);
      reference.getMetadata('Invalid_seqid', function(err, metadata) {
        expect(err).to.be.an.instanceof(errors.NotFound);
        expect(metadata).to.not.exist;
        done();
      });
    });

  });
});
