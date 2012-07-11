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
    self.drawData(data, start, end);
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
TrackRef.prototype.drawData = function(data, start, end) {
  var self = this;
  var layers = [];
  var laidout = false;
  var next = false;
  var start_overlap;
  var end_overlap;
  var cur_element;
  data.sort(function(a, b) {
    return (b.end - b.start) - (a.end - a.start);
  });
  data.forEach(function(doc) {
    laidout = false;
    for (var i = 0; i < layers.length; ++i) {
      for (var j = 0; j < layers[i].length; ++j) {
        start_overlap = doc.start >= layers[i][j]['start'] && doc.start <= layers[i][j]['end'];
        end_overlap = doc.end >= layers[i][j]['start'] && doc.end <= layers[i][j]['end'];
        if (start_overlap || end_overlap) {
          next = true;
          break;
        }
      }
      if (!next) {
        cur_element = self.canvas.drawDocument(doc, start, end, i, self.metadata.style);
        self.documents.push(cur_element);
        layers[i].push({
          start: doc.start,
          end: doc.end
        });
        laidout = true;
        break;
      }
      next = false;
    }
    if (!laidout) {
      if (layers.length) {
        self.resize(self.canvas.width, self.canvas.height+30);
      }
      cur_element = self.canvas.drawDocument(doc, start, end, i, self.metadata.style);
      self.documents.push(cur_element);
      layers.push([{
        start: doc.start,
        end: doc.end
      }]);
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
 * Draw a document
 *
 * @param {Object} doc
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Number} layer
 * @param {Object} style
 */
Raphael.fn.drawDocument = function(doc, view_start, view_end, layer, style) {
  var view_span = view_end - view_start
    , nf = new PHP_JS().number_format
    , rel_start = (((Math.max(doc.start, view_start) - view_start) / view_span) * (this.width-100)) + 50
    , rel_end = (((Math.min(doc.end, view_end) - view_start) / view_span) * (this.width-100)) + 50
    , rel_doc_length = rel_end - rel_start
    , title = []
    , doc_shape = null
    , doc_text = null
    , doc_element = this.set()
    , doc_shape_bbox = null
    , doc_text_bbox = null;
  if (doc.strand) {
    doc_shape = this.path(traceOrientedGlyph(rel_start, rel_end, layer, doc.strand));
  } else {
    doc_shape = this.rect(rel_start, 30+30*layer, rel_doc_length, 10);
  }
  for (var i in doc) {
    title.push(i + ' : ' + doc[i]);
  }
  doc_shape.attr({ title: title.join('\n') });
  doc_shape.attr(style);
  doc_shape_bbox = doc_shape.getBBox();
  doc_text = this.text(doc_shape_bbox.x+doc_shape_bbox.width/2, doc_shape_bbox.y-1-doc_shape_bbox.height/2, doc.name);
  doc_text_bbox = doc_text.getBBox();
  doc_element.push(doc_shape);
  if (doc_text_bbox.width > doc_shape_bbox.width || doc.name === undefined) {
    doc_text.remove();
  } else {
    doc_element.push(doc_text);
  }
  return doc_element;
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
