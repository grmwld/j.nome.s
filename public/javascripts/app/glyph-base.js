/**
 * Class representing a glyph.
 *
 * A glyph is a visual representation of a feature element.
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 */
var GlyphBase = function(canvas, document, viewStart, viewEnd) {
  var self = this;
  self.canvas = canvas;
  self.document = document;
  self.viewStart = viewStart;
  self.viewEnd = viewEnd;
  self.shape = null;
};

/**
 * Draw a feature element
 */
GlyphBase.prototype.draw = function(layer, style) {
  self = this;
  var view_span = self.viewEnd - self.viewStart
    , nf = new PHP_JS().number_format
    , rel_start = (((Math.max(self.document.start, self.viewStart) - self.viewStart) / view_span) * (this.canvas.width-100)) + 50
    , rel_end = (((Math.min(self.document.end, self.viewEnd) - self.viewStart) / view_span) * (this.canvas.width-100)) + 50
    , rel_doc_length = rel_end - rel_start
    , title = []
    , doc_shape = null
    , doc_text = null
    , doc_element = this.canvas.set()
    , doc_shape_bbox = null
    , doc_text_bbox = null;
  //if (self.document.strand) {
    //doc_shape = this.path(traceOrientedGlyph(rel_start, rel_end, layer, self.document.strand));
  //} else {
    doc_shape = this.canvas.rect(rel_start, 30+30*layer, rel_doc_length, 10);
  //}
  for (var i in self.document) {
    title.push(i + ' : ' + self.document[i]);
  }
  doc_shape.attr({ title: title.join('\n') });
  doc_shape.attr(style);
  doc_shape_bbox = doc_shape.getBBox();
  doc_text = this.canvas.text(doc_shape_bbox.x+doc_shape_bbox.width/2, doc_shape_bbox.y-1-doc_shape_bbox.height/2, self.document.name);
  doc_text_bbox = doc_text.getBBox();
  doc_element.push(doc_shape);
  if (doc_text_bbox.width > doc_shape_bbox.width || self.document.name === undefined) {
    doc_text.remove();
  } else {
    doc_element.push(doc_text);
  }
  console.log(doc_shape_bbox);
  console.log(doc_text_bbox);
  return doc_element;
};

/**
 * Remove a feature element
 */
GlyphBase.prototype.remove = function() {
  this.glyph.remove();
}

