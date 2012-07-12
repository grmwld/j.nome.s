/**
 * Class representing a glyph.
 *
 * A glyph is a visual representation of a feature element.
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 */
var GlyphBase = function(canvas, viewStart, viewEnd) {
  var self = this;
  self.canvas = canvas;
  self.viewStart = viewStart;
  self.viewEnd = viewEnd;
  self.document = null;
  self.glyph = null;
};

/**
 * Bind to a feature document.
 */
GlyphBase.prototype.coat = function(doc) {
  this.document = doc;
  if (this.document.hasOwnProperty('strand')) {
    this.drawShape = this.drawOrientedShape;
  } else {
    this.drawShape = this.drawShape;
  }
};

GlyphBase.prototype.getGenomicPosition = function() {
  var view_span = this.viewEnd - this.viewStart;
  var gBBox = this.glyph.getBBox();
  var start = (((gBBox.x-50) / (this.canvas.width-100)) * view_span) + this.viewStart;
  var end = (((gBBox.x+gBBox.width-50) / (this.canvas.width-100)) * view_span) + this.viewStart;
  return {
    start: start,
    end: end
  }
};

GlyphBase.prototype.adjustToLayer = function(layer) {
  var translation = 'T0,'+(40*layer);
  //this.glyph.transform(translation);
  this.glyph.animate({transform: translation}, 500);
};

/**
 * Draw the shape
 */
GlyphBase.prototype.drawShape = function(start, end) {
};

/**
 * Draw the oriented shape
 */
GlyphBase.prototype.drawOrientedShape = function(start, end) {
};

/**
 * Draw a feature element
 */
GlyphBase.prototype.draw = function(style, packed) {
};

