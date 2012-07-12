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
  var self = this;
  self.canvas = canvas;
  self.viewStart = viewStart;
  self.viewEnd = viewEnd;
  self.document = null;
  self.glyph = null;
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

/**
 * Draw a feature element
 */
GlyphGeneric.prototype.draw = function(style, packed) {
  self = this;
  var view_span = this.viewEnd - this.viewStart;
  var nf = new PHP_JS().number_format;
  var rel_start = (((Math.max(this.document.start, this.viewStart) - this.viewStart) / view_span) * (this.canvas.width-100)) + 50;
  var rel_end = (((Math.min(this.document.end, this.viewEnd) - this.viewStart) / view_span) * (this.canvas.width-100)) + 50;
  var rel_doc_length = rel_end - rel_start;
  var title = [];
  var doc_text = null;
  var doc_element = this.canvas.set();
  var doc_shape_bbox = null;
  var doc_text_bbox = null;
  var packed = typeof packed !== 'undefined' ? packed : true;
  var doc_shape = this.drawShape(rel_start, rel_end);
  for (var i in self.document) {
    title.push(i + ' : ' + self.document[i]);
  }
  doc_shape.attr({ title: title.join('\n') });
  doc_shape.attr(style);
  doc_shape_bbox = doc_shape.getBBox();
  doc_text = this.canvas.text(doc_shape_bbox.x+doc_shape_bbox.width/2, doc_shape_bbox.y-1-doc_shape_bbox.height/2, self.document.name);
  doc_text_bbox = doc_text.getBBox();
  doc_element.push(doc_shape);
  if (self.document.name === undefined || (packed && doc_text_bbox.width > doc_shape_bbox.width)) {
    doc_text.remove();
  } else {
    doc_element.push(doc_text);
  }
  this.glyph = doc_element;
  return doc_element;
};
