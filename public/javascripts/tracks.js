/**
 * Class for handling track display
 *
 * @param {Object} track
 * @param {Number} width
 * @param {Number} height
 */
var Track = function(track, width, height) {
  this.width = width;
  this.height = height;
  this.metadata = track.metadata;
  this.data = track.data;
  this.canvas = undefined;
  this.background = undefined;
  this.bgrules = undefined;
  this.documents = undefined;
  this.title = undefined;
  this.div = $('<div class=\'track\' id=track'+ this.metadata.id +'></div>');
};

/**
 * Display a track.
 * Instanciates and creates the containing elements if they don't exist.
 *
 * @param {Number} start
 * @param {Number} end
 */
Track.prototype.display = function(start, end) {
  var self = this;
  if ($('#track'+self.metadata.id).length === 0){
    $('#tracks').append(self.div);
  }
  self.canvas = Raphael('track'+self.metadata.id, self.width, self.height);
  self.background = self.canvas.rect(0, 0, self.canvas.width, self.canvas.height).attr({
    fill: '#fff'
  , stroke: '#fff'
  });
  self.bgrules = self.canvas.drawBgRules(10, { stroke: '#eee' });
  self.title = self.canvas.text(3, 5, self.metadata.name).attr({
    'font-size': 14
  , 'font-weight': 'bold'
  , 'text-anchor': 'start'
  });
  self.documents = self.canvas.set();
  self.orderLayers();
  self.draw(start, end);
};

/**
 * Draw the track's data according to it's type
 *
 * @param {Number} start
 * @param {Number} end
 * @see drawDocuments()
 */
Track.prototype.draw = function(start, end) {
  var self = this;
  if (self.metadata.type === 'ref') {
    self.drawDocuments(start, end);
  }
  else if (self.metadata.type === 'profile') {
    self.drawProfile(start, end);
  }
};

/**
 * Draw the documents in the track canvas
 *
 * @param {Number} start
 * @param {Number} end
 * @see drawDocument()
 */
Track.prototype.drawDocuments = function(start, end) {
  var self = this;
  var layers = [];
  var laidout = false;
  var next = false;
  var start_overlap;
  var end_overlap;
  self.data.sort(function(a, b) {
    return (b.end - b.start) - (a.end - a.start);
  });
  self.data.forEach(function(doc) {
    laidout = false;
    for (var i = 0; i < layers.length; ++i) {
      for (var j = 0; j < layers[i].length; ++j) {
        start_overlap = doc.start >= layers[i][j][0] && doc.start <= layers[i][j][1];
        end_overlap = doc.end >= layers[i][j][0] && doc.end <= layers[i][j][1];
        if (start_overlap || end_overlap) {
          next = true;
          break;
        }
      }
      if (!next) {
        self.documents.push(self.canvas.drawDocument(doc, start, end, i, self.metadata.style));
        layers[i].push([doc.start, doc.end]);
        laidout = true;
        break;
      }
      next = false;
    }
    if (!laidout) {
      if (layers.length) {
        self.resize(self.canvas.width, self.canvas.height+20);
      }
      self.documents.push(self.canvas.drawDocument(doc, start, end, i, self.metadata.style));
      layers.push([[doc.start, doc.end]]);
    }
  });
};

/**
 * Draw a profile track
 *
 * @param {Number} start
 * @param {Number} end
 */
Track.prototype.drawProfile = function(start, end) {
  var self = this;
  var xvals = [];
  var yvals = [];
  var i = 0;
  if (self.data.length !== 0) {
    self.data.forEach(function(doc) {
      for (i = doc[0]; i < doc[1]; i++) {
        xvals.push(i);
        yvals.push(doc[2]);
      }
    });
    self.resize(self.canvas.width, 170);
    self.documents = self.canvas.g.linechart(25, 5, self.width-50, 170, xvals, yvals, {
      shade: true
    , gutter: 25
    , axis: '0 0 0 1'
    }).hoverColumn(
      function(){
        this.popups = self.canvas.set();
        this.popups.push(self.canvas.g.popup(this.x, this.y[0], ~~(this.values[0])).insertBefore(this));
      },
      function() {
        this.popups && this.popups.remove();
      }
    );
  }
};

/**
 * Draw the documents in the track canvas
 *
 * @param {Number} start
 * @param {Number} end
 * @see drawDocument()
 */
Track.prototype.orderLayers = function() {
  var self = this;
  self.documents.toBack();
  self.title.toBack();
  self.bgrules.toBack();
  self.background.toBack();
};

/**
 * Resize the track's canvas
 */
Track.prototype.resize = function(width, height) {
  var self = this;
  self.background.remove();
  self.bgrules.remove();
  self.canvas.setSize(width, height);
  self.background = self.canvas.rect(0, 0, self.canvas.width, self.canvas.height).attr({
    fill: '#fff'
  , stroke: '#fff'
  });
  self.bgrules = self.canvas.drawBgRules(10, { stroke: '#eee' });
  self.orderLayers();
};

/**
 * Empty the track
 */
Track.prototype.empty = function() {
  var self = this;
  $('#track'+self.metadata.id).empty();
};

/**
 * Clears the documents from the track canvas
 */
Track.prototype.clear = function() {
  var self = this;
  self.documents.remove();
  self.canvas.setSize(self.width, self.height);
};

/**
 * Refresh the documents in the track canvas.
 * This method first cleans the canvas then draws the new documents
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} data
 * @see Track.clear()
 * @see Track.draw()
 */
Track.prototype.refresh = function(start, end, data) {
  var self = this;
  self.clear();
  self.data = data;
  self.draw(start, end);
};



/**
 * Draw a document
 *
 * @param {Object} doc
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Object} style
 */
Raphael.fn.drawDocument = function(doc, view_start, view_end, layer, style) {
  var view_span = view_end - view_start;
  var nf = new PHP_JS().number_format;
  var rel_start = (((Math.max(doc.start, view_start) - view_start) / view_span) * (this.width-100)) + 50;
  var rel_end = (((Math.min(doc.end, view_end) - view_start) / view_span) * (this.width-100)) + 50;
  var rel_doc_length = rel_end - rel_start;
  var d = this.rect(rel_start, 20+20*layer, rel_doc_length, 10).attr(style);
  var title = [];
  for (var i in doc) {
    title.push(i + ' : ' + doc[i]);
  }
  d.attr({ title: title.join('\n') });
  return d;
};
