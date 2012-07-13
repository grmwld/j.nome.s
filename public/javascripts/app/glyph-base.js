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
  this.canvas = canvas;
  this.viewStart = viewStart;
  this.viewEnd = viewEnd;
  this.document = null;
  this.glyph = null;
  this.bbox = null;
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

GlyphBase.prototype.overlapsWith = function(other) {
  var glyphPos = this.getBBox();
  var v1 = other.end - glyphPos.end;
  var v2 = other.end - glyphPos.start;
  var v3 = other.start - glyphPos.end;
  var v4 = other.start - glyphPos.start;
  return (!((v1>0 && v2>0 && v3>0 && v4>0) || (v1<0 && v2<0 && v3<0 && v4<0)));
};

GlyphBase.prototype.getBBox = function() {
  return {
    start: this.bbox.x,
    end: this.bbox.x + this.bbox.width
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

