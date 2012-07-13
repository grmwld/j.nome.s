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
    glyphPos = glyph.getBBox();
    laidout = false;
    for (var i = 0, l = layers.length; i < l; ++i) {
      for (var j = 0, m = layers[i].length; j < m; ++j) {
        if (glyph.overlapsWith(layers[i][j])) {
          next = true;
          break;
        }
      }
      if (!next) {
        glyph.adjustToLayer(i);
        layers[i].push(glyphPos);
        laidout = true;
        break;
      }
      next = false;
    }
    if (!laidout) {
      if (layers.length) {
        self.resize(self.canvas.width, self.canvas.height+40);
        glyph.adjustToLayer(i);
      }
      layers.push([glyphPos]);
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
