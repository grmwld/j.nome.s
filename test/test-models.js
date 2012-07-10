var expect = require('chai').expect
  , Mongolian = require('mongolian')
  , async = require('async')
  , errors = require('../controllers/errors')
  , Reference = require('../models/reference').Reference
  , Track = require('../models/track').Track
  , TrackRef = require('../models/track').TrackRef
  , TrackProfile = require('../models/track').TrackProfile
  , TrackOrientedProfile = require('../models/track').TrackOrientedProfile;

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
  describe('.getMetadata()', function() {
    it('responds with metadata if seqid is valid', function(done) {
      var reference = new Reference(dataset);
      reference.getMetadata('chrIV', function(err, metadata) {
        try {
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
          done(err);
        } catch(err) {
          done(err);
        }
      });
    });
    it('responds with an error if seqid is invalid', function(done) {
      var reference = new Reference(dataset);
      reference.getMetadata('Invalid_seqid', function(err, metadata) {
        try {
          expect(err).to.be.an.instanceof(errors.NotFound);
          expect(metadata).to.not.exist;
          done();
        } catch(err) {
          done(err);
        }
      });
    });
  });
});


/**
 * Feature Tracks Tests
 * (genes and the likes)
 */
describe('Feature Track', function() {
  describe('.fetchInInterval()', function() {
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
      track.fetchInInterval('chrIV', null, 32289, 98123, function(err, docs) {
        try {
          expect(err).to.not.exist;
          expect(docs).to.be.an.instanceof(Array);
          expect(docs).to.have.length(34);
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
          done(err);
        } catch(err) {
          done(err);
        }
      });
    });
  });
});

describe('Profile Track', function() {
  describe('.fetchInInterval()', function() {
    describe('using the bigwig backend', function() {
      describe('and an existant bigwig file', function() {
        var track = new Track(dataset, {
          id: 'rnaseq-bigwig'
        , name: 'RNASeq data bigwig'
        , description: 'RNA-Seq data from SRR002051 (bigwig)'
        , type: 'profile'
        , backend: 'bigwig'
        , file: './test/store/SRR002051_chrI-II-III-IV.profile.bw'
        , style: {}
        });
        it('responds with profile data', function(done) {
          expect(track).to.be.an.instanceof(TrackProfile);
          track.fetchInInterval('chrIV', null, 32289, 3933090, function(err, docs) {
            try {
              expect(err).to.not.exist;
              expect(docs).to.be.an.instanceof(Array);
              expect(docs).to.have.length(1025);
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
              done(err);
            } catch(err) {
              done(err);
            }
          });
        });
      });
      describe('and an invalid bigwig file', function() {
        var track = new Track(dataset, {
          id: 'rnaseq-bigwig'
        , name: 'RNASeq data bigwig'
        , description: 'RNA-Seq data from SRR002051 (bigwig)'
        , type: 'profile'
        , backend: 'bigwig'
        , file: './test/store/non-existent.profile.bw'
        , style: {}
        });
        it('responds with an empty array', function(done) {
          expect(track).to.be.an.instanceof(TrackProfile);
          track.fetchInInterval('chrIV', null, 32289, 3933090, function(err, docs) {
            try {
              expect(err).to.be.a('string');
              expect(err).to.equal('Could not process bigwig file')
              expect(docs).to.be.an.instanceof(Array);
              expect(docs).to.have.length(0);
              done();
            } catch(err) {
              done(err);
            }
          });
        });
      });
    });
    describe('using the JSON backend', function() {
      var track = new Track(dataset, {
        id: 'rnaseq'
      , name: 'RNASeq data'
      , description: 'RNA-Seq data from SRR002051'
      , type: 'profile'
      , style: {}
      });
      before(function(done) {
        track.collection.remove({step: {$exists:true}}, function(err, nrows) {
          done(err);
        });
      });
      it('responds with profile data - range < 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackProfile);
        track.fetchInInterval('chrIV', null, 32289, 33090, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(801);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
      it('responds with profile documents - range > 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackProfile);
        track.fetchInInterval('chrIV', null, 50192, 1112001, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(532);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
    });
  });
});

describe('Oriented Profile Track', function() {
  describe('.fetchInInterval()', function() {
    describe('using the bigwig backend', function() {
      var track = new Track(dataset, {
        id: 'rnaseq-bigwig-oriented'
      , name: 'RNASeq data bigwig'
      , description: 'RNA-Seq data from SRR002051 (bigwig)'
      , type: 'oriented-profile'
      , backend: 'bigwig'
      , files: {
          plus_strand: './test/store/oriented/SRR002051_top_chrI-II-III-IV.profile.bw'
        , minus_strand: './test/store/oriented/SRR002051_bottom_chrI-II-III-IV.profile.bw'
      }
      , style: {}
      });
      it('responds with profile documents - top strand', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrIV', '+', 50192, 1112001, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(1025);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
      it('responds with profile documents - bottom strand', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrIV', '-', 50192, 1112001, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(1025);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
    });
    describe('using the JSON backend', function() {
      var track = new Track(dataset, {
        id: 'rnaseq_oriented'
      , name: 'Oriented RNASeq data'
      , description: 'Oriented RNA-Seq data from SRR002051'
      , type: 'oriented-profile'
      , style: {}
      });
      before(function(done) {
        track.collection.remove({step: {$exists:true}}, function(err, nrows) {
          done(err);
        });
      });
      it('responds with profile documents - top strand - range < 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrIV', '+', 32289, 33090, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(801);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
      it('responds with profile documents - bottom strand - range < 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrIV', '-', 32289, 33090, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(801);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
      it('responds with profile documents - top strand - range > 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrIV', '+', 50192, 1112001, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(532);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
      it('responds with profile documents - bottom strand - range > 1,000,000', function(done) {
        expect(track).to.be.an.instanceof(TrackOrientedProfile);
        track.fetchInInterval('chrIV', '-', 50192, 1112001, function(err, docs) {
          try {
            expect(err).to.not.exist;
            expect(docs).to.be.an.instanceof(Array);
            expect(docs).to.have.length(532);
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
            done(err);
          } catch(err) {
            done(err);
          }
        });
      });
    });
  });
});

