var expect = require('chai').expect
  , Mongolian = require('mongolian')
  , errors = require('../controllers/errors')
  , Reference = require('../models/reference').Reference
  , Track = require('../models/track').Track
  , TrackRef = require('../models/track').TrackRef
  , TrackProfile = require('../models/track').TrackProfile
  , TrackOrientedProfile = require('../models/track').TrackOrientedProfile
  , processProfile = require('../lib/cutils').processProfile;

var server = new Mongolian({
  log: {
    debug: function(message) {},
    info: function(message) {},
    warn: function(message) {},
    error: function(message) {}
  }
})
var dataset = server.db('SacCer-demo'); 


describe('Reference', function() {

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


describe('Track', function() {

  describe('#fetchInInterval', function() {

    describe('with ref metadata', function() {
      var track = new Track(dataset, {
        id: 'ensembl_genes'
      , name: 'Ensembl genes'
      , description: 'Ensembl genes'
      , type: 'ref'
      , style: {
          fill: 'purple'
        , stroke: 'purple'
        } 
      });
      
      it('responds with ref documents', function(done) {
        expect(track).to.be.an.instanceof(TrackRef);
        track.fetchInInterval('chrI', null, 30192, 98123, function(err, docs) {
          expect(err).to.not.exist;
          expect(docs).to.be.an.instanceof(Array);
          expect(docs).to.have.length(45);
          docs.forEach(function(doc) {
            expect(doc).to.contain.keys([
              '_id'
            , 'seqid'
            , 'source'
            , 'type'
            , 'start'
            , 'end'
            , 'strand'
            , 'phase'
            ])
            expect(doc.strand).to.match(/\+|\-/);
            expect(doc.start).to.be.a('number');
            expect(doc.end).to.be.a('number');
            expect(doc.start).to.be.below(doc.end);
          });
          done();
        });
      });

    });

    describe('with profile metadata', function() {
      var track = new Track(dataset, {
        id: 'rnaseq'
      , name: 'RNASeq data'
      , description: 'RNA-Seq data from SRR002051'
      , type: 'profile'
      , style: {
          gutter: 25
        , shade: true
        , nostroke: true
        , axis: '0 0 1 1'
        , axisxstep: 10
        , axisystep: 4
        }
      });

      before(function(done) {
        track.collection.remove({step: {$exists:true}}, function(err, nrows) {
          done(err);
        });
      });

      it('responds with profile documents (range < 1,000,000)', function(done) {
        expect(track).to.be.an.instanceof(TrackProfile);
        track.fetchInInterval('chrI', null, 30192, 31123, function(err, docs) {
          expect(err).to.not.exist;
          expect(docs).to.be.an.instanceof(Array);
          expect(docs).to.have.length(931);
          docs.forEach(function(doc) {
            expect(doc).to.contain.keys([
            , 'start'
            , 'end'
            , 'score'
            ])
            expect(doc.score).to.be.a('number');
            expect(doc.score).to.not.be.below(0);
            expect(doc.start).to.be.a('number');
            expect(doc.end).to.be.a('number');
            expect(doc.start).to.be.below(doc.end);
          });
          done();
        });
      });
    
      it('responds with profile documents - cache[OFF] - range > 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackProfile);
        track.fetchInInterval('chrIV', null, 10192, 1112001, function(err, docs) {
          expect(err).to.not.exist;
          expect(docs).to.be.an.instanceof(Array);
          expect(docs).to.have.length(2205);
          docs.forEach(function(doc) {
            expect(doc).to.contain.keys([
            , 'start'
            , 'end'
            , 'score'
            ])
            expect(doc.score).to.be.a('number');
            expect(doc.score).to.not.be.below(0);
            expect(doc.start).to.be.a('number');
            expect(doc.end).to.be.a('number');
            expect(doc.start).to.be.below(doc.end);
          });
          done();
        });
      });

      it('responds with profile documents - cache[ON] - range > 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackProfile);
        track.fetchInInterval('chrIV', null, 10192, 1112001, function(err, docs) {
          expect(err).to.not.exist;
          expect(docs).to.be.an.instanceof(Array);
          expect(docs).to.have.length(2205);
          docs.forEach(function(doc) {
            expect(doc).to.contain.keys([
            , 'start'
            , 'end'
            , 'score'
            ])
            expect(doc.score).to.be.a('number');
            expect(doc.score).to.not.be.below(0);
            expect(doc.start).to.be.a('number');
            expect(doc.end).to.be.a('number');
            expect(doc.start).to.be.below(doc.end);
          });
          done();
        });
      });

    });

    describe('with oriented profile metadata', function() {
      var track = new Track(dataset, {
        id: 'oriented-rnaseq'
      , name: 'Oriented RNASeq data'
      , description: 'Oriented RNA-Seq data from SRR002051'
      , type: 'oriented-profile'
      , style: {
          gutter: 25
        , shade: true
        , nostroke: true
        , axis: '0 0 1 1'
        , axisxstep: 10
        , axisystep: 4
        }
      });

      before(function(done) {
        track.collection.remove({step: {$exists:true}}, function(err, nrows) {
          done(err);
        });
      });

      it('responds with profile documents - [plus] - range < 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrI', '+', 30192, 31123, function(err, docs) {
          expect(err).to.not.exist;
          expect(docs).to.be.an.instanceof(Array);
          expect(docs).to.have.length(931);
          docs.forEach(function(doc) {
            expect(doc).to.contain.keys([
            , 'start'
            , 'end'
            , 'score'
            ])
            expect(doc.score).to.be.a('number');
            expect(doc.score).to.not.be.below(0);
            expect(doc.start).to.be.a('number');
            expect(doc.end).to.be.a('number');
            expect(doc.start).to.be.below(doc.end);
          });
          done();
        });
      });

      it('responds with profile documents - [minus] - range < 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrI', '-', 30192, 31123, function(err, docs) {
          expect(err).to.not.exist;
          expect(docs).to.be.an.instanceof(Array);
          expect(docs).to.have.length(931);
          docs.forEach(function(doc) {
            expect(doc).to.contain.keys([
            , 'start'
            , 'end'
            , 'score'
            ])
            expect(doc.score).to.be.a('number');
            expect(doc.score).to.not.be.below(0);
            expect(doc.start).to.be.a('number');
            expect(doc.end).to.be.a('number');
            expect(doc.start).to.be.below(doc.end);
          });
          done();
        });
      });
    
      //it('responds with profile documents - cache[OFF] - range > 1,000,000', function(done) {
        //expect(track).to.be.an.instanceof(TrackProfile);
        //track.fetchInInterval('chrIV', 10192, 1112001, function(err, docs) {
          //expect(err).to.not.exist;
          //expect(docs).to.be.an.instanceof(Array);
          //expect(docs).to.have.length(2205);
          //docs.forEach(function(doc) {
            //expect(doc).to.contain.keys([
            //, 'start'
            //, 'end'
            //, 'score'
            //])
            //expect(doc.score).to.be.a('number');
            //expect(doc.score).to.not.be.below(0);
            //expect(doc.start).to.be.a('number');
            //expect(doc.end).to.be.a('number');
            //expect(doc.start).to.be.below(doc.end);
          //});
          //done();
        //});
      //});

      //it('responds with profile documents - cache[ON] - range > 1,000,000', function(done) {
        //expect(track).to.be.an.instanceof(TrackProfile);
        //track.fetchInInterval('chrIV', 10192, 1112001, function(err, docs) {
          //expect(err).to.not.exist;
          //expect(docs).to.be.an.instanceof(Array);
          //expect(docs).to.have.length(2205);
          //docs.forEach(function(doc) {
            //expect(doc).to.contain.keys([
            //, 'start'
            //, 'end'
            //, 'score'
            //])
            //expect(doc.score).to.be.a('number');
            //expect(doc.score).to.not.be.below(0);
            //expect(doc.start).to.be.a('number');
            //expect(doc.end).to.be.a('number');
            //expect(doc.start).to.be.below(doc.end);
          //});
          //done();
        //});
      //});

    });

  });

});
