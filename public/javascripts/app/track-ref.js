/**
 * Class for handling reference tracks
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 */
var TrackRef = function(trackid, width, height, metadata) {
  var self = this;
  TrackBase.call(this, trackid, width, height, metadata);
};

TrackRef.prototype = new TrackBase;

/**
 * Draw the track's data.
 *
 * @param {Array} data
 * @param {Number} start
 * @param {Number} end
 * @see drawData()
 */
TrackRef.prototype.draw = function(seqid, start, end) {
  var self = this;
  self.getData(seqid, start, end, function(data) {
    self.drawData(data, start, end, false);
  });
};

/**
 * Draw the documents in the track canvas
 *
 * @param {Array} data
 * @param {Number} start
 * @param {Number} end
 * @see drawDocument()
 */
TrackRef.prototype.drawData = function(data, start, end, packed) {
  var self = this;
  var layers = [];
  var laidout = false;
  var next = false;
  var start_overlap;
  var end_overlap;
  var glyph = new GlyphGeneric(self.canvas, start, end);
  data.sort(function(a, b) {
    return (b.end - b.start) - (a.end - a.start);
  });
  data.forEach(function(doc) {
    glyph.coat(doc);
    self.documents.push(glyph.draw(self.metadata.style, packed));
    glyphPos = glyph.getGenomicPosition();
    laidout = false;
    for (var i = 0; i < layers.length; ++i) {
      for (var j = 0; j < layers[i].length; ++j) {
        start_overlap = glyphPos.start >= layers[i][j]['start'] && glyphPos.start <= layers[i][j]['end'];
        end_overlap = glyphPos.end >= layers[i][j]['start'] && glyphPos.end <= layers[i][j]['end'];
        if (start_overlap || end_overlap) {
          next = true;
          break;
        }
      }
      if (!next) {
        glyph.adjustToLayer(i);
        layers[i].push(glyph.getGenomicPosition());
        laidout = true;
        break;
      }
      next = false;
    }
    if (!laidout) {
      if (layers.length) {
        self.resize(self.canvas.width, self.canvas.height+40);
      }
      glyph.adjustToLayer(i);
      layers.push([glyph.getGenomicPosition()]);
    }
  });
};

/**
 * Clears the documents from the track canvas
 */
TrackRef.prototype.clear = function() {
  TrackBase.prototype.clear.call(this);
  this.canvas.setSize(this.width, this.height);
};


/**
 * Computes the path necessary to represent an oriented glyph
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Number} layer
 * @param {String} strand
 */
var traceOrientedGlyph = function(start, end, layer, strand) {
  var path = null
    , length = end - start
    , tip_length = length > 10 ? 10 : length/1.5;
  if (strand === '+') {
    path = [
      'M' + start + ' ' + (30+30*layer)
    , 'h' + (length - tip_length)
    , 'l' + tip_length + ' ' + 5
    , 'l' + (-tip_length) + ' ' + 5
    , 'h' + (-(length - tip_length))
    , 'v' + (-10)
    ];
  }
  else if (strand === '-') {
    path = [
      'M' + (start + tip_length) + ' ' + (30+30*layer)
    , 'h' + (length - tip_length)
    , 'v' + 10
    , 'h' + (-(length - tip_length))
    , 'l' + (-tip_length) + ' ' + (-5)
    , 'l' + tip_length + ' ' + (-5)
    ];
  }
  return path.join(' ');
}
