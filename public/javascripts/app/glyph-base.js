/**
 * Class representing a glyph.
 *
 * A glyph is a visual representation of a feature element.
 *
 * @param {String} canvas
 * @param {Number} viewStart
 * @param {Number} viewEnd
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
 *
 * The drawing method (standard or oriented) is picked here
 *
 * @param {Object} doc
 */
GlyphBase.prototype.coat = function(doc) {
  this.document = doc;
  if (this.document.hasOwnProperty('strand')) {
    this.drawShape = this.drawOrientedShape;
  } else {
    this.drawShape = this.drawShape;
  }
};

/**
 * Test if a glyph overlaps with another one
 *
 * @param {Object} other
 */
GlyphBase.prototype.overlapsWith = function(other) {
  var glyphPos = this.getBBox();
  var v1 = other.end - glyphPos.end;
  var v2 = other.end - glyphPos.start;
  var v3 = other.start - glyphPos.end;
  var v4 = other.start - glyphPos.start;
  return (!((v1>0 && v2>0 && v3>0 && v4>0) || (v1<0 && v2<0 && v3<0 && v4<0)));
};

/**
 * Access a simplified bbox of the glyph
 */
GlyphBase.prototype.getBBox = function() {
  return {
    start: this.bbox.x,
    end: this.bbox.x + this.bbox.width
  }
};

/**
 * Move the glyph on the Y to a specified layer
 *
 * @param {Number} layer
 */
GlyphBase.prototype.adjustToLayer = function(layer) {
  var translation = 'T0,'+(40*layer);
  //this.glyph.transform(translation);
  this.glyph.animate({transform: translation}, 500);
};

/**
 * Draw a feature element
 *
 * @param {Object} style
 * @param {Boolean} packed
 * @returns element
 */
GlyphBase.prototype.draw = function(style, packed) {
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
    title.push('<strong>'+i+'</strong>' + ' : ' + self.document[i]);
  }
  doc_shape.attr(style);
  doc_shape_bbox = doc_shape.getBBox();
  doc_text = this.canvas.text(doc_shape_bbox.x, doc_shape_bbox.y-1-doc_shape_bbox.height/2).attr({
    'text': self.document.name,
    'text-anchor': 'start'
  });
  doc_text_bbox = doc_text.getBBox();
  doc_element.push(doc_shape);
  if (self.document.name === undefined || (packed && doc_text_bbox.width > doc_shape_bbox.width)) {
    doc_text.remove();
  } else {
    doc_element.push(doc_text);
  }
  doc_element.attr({
    cursor: 'help'
  });
  doc_element.forEach(function(e) {
    $(e.node).qtip({
      content: { text: title.join('<br />') },
      style: { classes: 'ui-tooltip-bootstrap' }
    });
  });
  this.bbox = doc_element.getBBox();
  this.glyph = doc_element;
  return doc_element;
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

