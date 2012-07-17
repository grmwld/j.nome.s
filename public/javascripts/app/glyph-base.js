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
  if (this.document.strand) {
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
 * Associate a tooltip to a glyph
 */
GlyphBase.prototype.tooltip = function() {
  var tooltip_text = [];
  var std_fields = [
    '_id',
    'seqid',
    'start',
    'end',
    'score',
    'strand',
    'type',
    'source'
  ];
  var opt_fields = [
    'name',
    'gene',
    'alias',
    'note'
  ]
  for (var i = 0, l = std_fields.length ; i < l ; ++i) {
    tooltip_text.push('<strong>'+std_fields[i]+'</strong>' + ' : ' + this.document[std_fields[i]]);
  }
  for (var i = 0, l = opt_fields.length ; i < l ; ++i) {
    if (typeof document[i] !== 'undefined') {
      tooltip_text.push('<strong>'+opt_fields[i]+'</strong>' + ' : ' + this.document[opt_fields[i]]);
    }
  }
  for (var i in this.document) {
    if (std_fields.indexOf(i) === -1 && opt_fields.indexOf(i) === -1) {
      tooltip_text.push('<strong>'+i+'</strong>' + ' : ' + this.document[i]);
    }
  }
  this.glyph.forEach(function(e) {
    $(e.node).qtip({
      content: {
        text: tooltip_text.join('<br />')
      },
      style: {
        classes: 'ui-tooltip-bootstrap'
      },
      position: {
        viewport: $(window),
        adjust: {
          method: 'shift'
        }
      }
    });
    e.attr({ cursor: 'help' });
  });
}

/**
 * Draw the label associated to a document
 *
 * @param {Object} shape
 * @param {String} txt
 * @param {Boolean} packed
 */
GlyphBase.prototype.label = function(shape, txt, packed) {
  var shape_bbox = shape.getBBox();
  var text = this.canvas.text(shape_bbox.x, shape_bbox.y-1-shape_bbox.height/2).attr({
    'text': txt,
    'text-anchor': 'start'
  });
  var text_bbox = text.getBBox();
  if (typeof txt === 'undefined' || (packed && text_bbox.width > shape_bbox.width)) {
    text.remove();
    text = null;
  }
  return text
}

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
  var rel_start = (((Math.max(this.document.start, this.viewStart) - this.viewStart) / view_span) * (this.canvas.width-100)) + 50;
  var rel_end = (((Math.min(this.document.end, this.viewEnd) - this.viewStart) / view_span) * (this.canvas.width-100)) + 50;
  var rel_doc_length = rel_end - rel_start;
  var doc_element = this.canvas.set();
  var packed = typeof packed !== 'undefined' ? packed : true;
  var doc_shape = this.drawShape(rel_start, rel_end);
  var doc_text = this.label(doc_shape, this.document.name, packed);
  doc_shape.attr(style);
  doc_element.push(doc_shape);
  if (doc_text) {
    doc_element.push(doc_text);
  }
  this.bbox = doc_element.getBBox();
  this.glyph = doc_element;
  this.tooltip();
  return doc_element;
};

/**
 * Draw the shape
 */
GlyphBase.prototype.drawShape = function(start, end) {
  throw 'Abstract method drawShape(start, end) not implemented';
};

/**
 * Draw the oriented shape
 */
GlyphBase.prototype.drawOrientedShape = function(start, end) {
  throw 'Abstract method drawOrientedShape(start, end) not implemented';
};

