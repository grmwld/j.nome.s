/**
 * Class for handling track display
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 */
var Track = function(trackid, width, height) {
  var self = this;
  self.getTrackMetadata(trackid, function(metadata) {
    self.metadata = metadata;
    self.trackid = trackid;
    self.width = width;
    self.height = height;
    self.canvas = undefined;
    self.background = undefined;
    self.bgrules = undefined;
    self.documents = undefined;
    self.title = undefined;
    self.div = $('<div class=\'track\' id=track'+ trackid +'></div>');
    self.spinner = $('<div class=\'spinner\' id=spinner'+ trackid +'></div>');
    [1,2,3,4,5,6,7,8,9,10,11,12].forEach(function(i) {
      self.spinner.append($('<div class=\'bar' + i + '\'></div>'));
    });
  });
};

/**
 * Get the metadata associated to the current track
 *
 * @param {String} seqid
 * @param {Function} callback
 * @api private
 */
Track.prototype.getTrackMetadata = function(trackid, callback) {
  var self = this;
  var reqURL = '/'
    + window.location.href.split('/').slice(3, 5).join('/')
    + '/track/' + trackid + ".json";
  $.ajax({
    type: "GET"
  , url: reqURL
  , dataType: "json"
  , success: function(metadata) {
      callback(metadata);
    }
  , async: false
  });
};

/**
 * Request data of the track between 2 positions of a seqid.
 * The callback is triggered with the collected data
 *
 * @param {string} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 * @api private
 */
Track.prototype.getData = function(seqid, start, end, callback) {
  var self = this;
  var reqURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  $.ajax({
    type: "POST"
  , url: reqURL
  , data: {
      seqid: seqid
    , start: start
    , end: end
    , trackID: self.trackid
    }
  , dataType: "json"
  , beforeSend: function() {
      $('#track'+self.trackid).append(self.spinner);
    }
  , complete: function(data) {
      $('#spinner'+self.trackid).remove();
    }
  , success: function(data) {
      callback(data);
    }
  });
};


/**
 * Display a track.
 * Instanciates and creates the containing elements if they don't exist.
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 */
Track.prototype.display = function(seqid, start, end) {
  var self = this;
  if ($('#track'+self.trackid).length === 0){
    $('#tracks').append(self.div);
  }
  self.canvas = Raphael('track'+self.trackid, self.width, self.height);
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
  self.draw(seqid, start, end);
};

/**
 * Draw the track's data according to it's type
 *
 * @param {Array} data
 * @param {Number} start
 * @param {Number} end
 * @see drawDocuments()
 */
Track.prototype.draw = function(seqid, start, end) {
  var self = this;
  self.getData(seqid, start, end, function(data) {
    if (self.metadata.type === 'ref') {
      self.drawDocuments(data, start, end);
    }
    else if (self.metadata.type === 'profile') {
      self.drawProfile(data, start, end);
    }
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
Track.prototype.drawDocuments = function(data, start, end) {
  var self = this;
  var layers = [];
  var laidout = false;
  var next = false;
  var start_overlap;
  var end_overlap;
  data.sort(function(a, b) {
    return (b.end - b.start) - (a.end - a.start);
  });
  data.forEach(function(doc) {
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
 * @param {Array} data
 * @param {Number} start
 * @param {Number} end
 */
Track.prototype.drawProfile = function(data, start, end) {
  var self = this;
  var xvals = [];
  var yvals = [];
  var i = 0;
  if (data.length !== 0) {
    data.forEach(function(doc) {
      for (i = doc.start; i < doc.end; i++) {
        xvals.push(i);
        yvals.push(doc.score);
      }
    });
    self.resize(self.canvas.width, 170);
    self.documents = self.canvas.g.linechart(25, 5, self.width-50, 170, xvals, yvals, self.metadata.style).hoverColumn(
      function(){
        this.popups = self.canvas.set();
        this.popups.push(self.canvas.g.popup(this.x, this.y[0], ~~(this.values[0])+' | '+~~(this.axis)).insertBefore(this));
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
Track.prototype.refresh = function(seqid, start, end) {
  var self = this;
  self.clear();
  self.draw(seqid, start, end);
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
  var view_span = view_end - view_start
    , nf = new PHP_JS().number_format
    , rel_start = (((Math.max(doc.start, view_start) - view_start) / view_span) * (this.width-100)) + 50
    , rel_end = (((Math.min(doc.end, view_end) - view_start) / view_span) * (this.width-100)) + 50
    , rel_doc_length = rel_end - rel_start
    , tip_length = rel_doc_length > 15 ? 15 : rel_doc_length/1.5
    , title = []
    , path = ''
    , doc_shape = null;
  if (doc.strand === '+') {
    path = [
      'M' + rel_start + ' ' + (20+20*layer)
    , 'h' + (rel_doc_length - tip_length)
    , 'l' + tip_length + ' ' + 5
    , 'l' + (-tip_length) + ' ' + 5
    , 'h' + (-(rel_doc_length - tip_length))
    , 'v' + (-10)
    ].join(' ');
  }
  else if (doc.strand === '-') {
    path = [
      'M' + (rel_start + tip_length) + ' ' + (20+20*layer)
    , 'h' + (rel_doc_length - tip_length)
    , 'v' + 10
    , 'h' + (-(rel_doc_length - tip_length))
    , 'l' + (-tip_length) + ' ' + (-5)
    , 'l' + tip_length + ' ' + (-5)
    ].join(' ');
  }
  doc_shape = this.path(path).attr(style);
  for (var i in doc) {
    title.push(i + ' : ' + doc[i]);
  }
  doc_shape.attr({ title: title.join('\n') });
  return doc_shape;
};
