/**
 * Class representing a glyph.
 *
 * A glyph is a visual representation of a feature element.
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 */
var GlyphGeneric = function(canvas, viewStart, viewEnd) {
  this.canvas = canvas;
  this.viewStart = viewStart;
  this.viewEnd = viewEnd;
  this.document = null;
  this.glyph = null;
  this.bbox = null;
};

GlyphGeneric.prototype = new GlyphBase;

/**
 * Draw the shape
 */
GlyphGeneric.prototype.drawShape = function(start, end) {
  return this.canvas.rect(start, 30, end-start, 10);
};

/**
 * Draw the oriented shape
 */
GlyphGeneric.prototype.drawOrientedShape = function(start, end) {
  var path = null
    , length = end - start
    , tip_length = length > 10 ? 10 : length/1.5;
  if (this.document.strand === '+') {
    path_string = [
      'M' + start + ' ' + (30)
    , 'h' + (length - tip_length)
    , 'l' + tip_length + ' ' + 5
    , 'l' + (-tip_length) + ' ' + 5
    , 'h' + (-(length - tip_length))
    , 'v' + (-10)
    ];
  }
  else if (this.document.strand === '-') {
    path_string = [
      'M' + (start + tip_length) + ' ' + (30)
    , 'h' + (length - tip_length)
    , 'v' + 10
    , 'h' + (-(length - tip_length))
    , 'l' + (-tip_length) + ' ' + (-5)
    , 'l' + tip_length + ' ' + (-5)
    ];
  }
  return this.canvas.path(path_string.join(' '));
};
