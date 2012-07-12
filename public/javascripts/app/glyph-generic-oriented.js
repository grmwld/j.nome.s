/**
 * Class representing a glyph.
 *
 * A glyph is a visual representation of a feature element.
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 */
var GlyphGenericOriented = function(canvas, viewStart, viewEnd) {
  var self = this;
  self.canvas = canvas;
  self.viewStart = viewStart;
  self.viewEnd = viewEnd;
  self.document = null;
  self.glyph = null;
};

GlyphGenericOriented.prototype = new GlyphGeneric;

/**
 * Draw an oriented generic glyph
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Number} layer
 * @param {String} strand
 */
GlyphGenericOriented.prototype.drawShape = function(start, end) {
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
