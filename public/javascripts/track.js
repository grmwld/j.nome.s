/**
 * Factory function to build appropriate Track objects
 * based on the metadata
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 * @param {Function} callback
 */
var NewTrack = function(trackid, width, height, callback) {
  var reqURL = '/'
    + window.location.href.split('/').slice(3, 5).join('/')
    + '/track/' + trackid + ".json";
  $.ajax({
    type: "GET"
    , url: reqURL
    , dataType: "json"
    , success: function(metadata) {
      var track = null;
      if (metadata.type === 'ref') {
        track = new TrackRef(trackid, width, height, metadata);
      }
      else if (metadata.type === 'profile') {
        track = new TrackProfile(trackid, width, height, metadata);
      }
      else if (metadata.type === 'oriented-profile') {
        track = new TrackOrientedProfile(trackid, width, height, metadata);
      }
      callback(track);
    }
    //, async: false
  });
};


/**
 * Class for handling track display
 *
 * @param {String} trackid
 * @param {Number} width
 * @param {Number} height
 * @param {Object} metadata
 */
var TrackBase = function(trackid, width, height, metadata) {
  var self = this;
  this.metadata = metadata;
  this.trackid = trackid;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.background = undefined;
  this.bgrules = undefined;
  this.documents = undefined;
  this.title = undefined;
  this.seqid = undefined;
  this.start = undefined;
  this.end = undefined;
  this.maxvalue = 0;
  this.div = $('<div class=\'track\' id=track'+ trackid +'></div>');
  this.spinner = $('<div class=\'spinner\' id=spinner'+ trackid +'></div>');
  [1,2,3,4,5,6,7,8,9,10,11,12].forEach(function(i) {
    self.spinner.append($('<div class=\'bar' + i + '\'></div>'));
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
TrackBase.prototype.getData = function(seqid, start, end, callback) {
  var self = this
    , reqURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  if (seqid !== self.seqid || start !== self.start || end !== self.end) {
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
        self.seqid = seqid;
        self.start = start;
        self.end = end;
        self.data = data;
        callback(data);
      }
    });
  }
  else {
    callback(self.data);
  }
};


/**
 * Display a track.
 * Instanciates and creates the containing elements if they don't exist.
 *
 * @param {String} seqid
 * @param {Number} start
 * @param {Number} end
 */
TrackBase.prototype.display = function(seqid, start, end) {
  var self = this;
  if ($('#track'+self.trackid).length === 0){
    $('#tracks').append(self.div);
  }
  self.canvas = Raphael('track'+self.trackid, self.width, self.height);
  self.background = self.canvas.rect(0, 0, self.canvas.width, self.canvas.height).attr({
    fill: '#fff'
  , stroke: '#fff'
  });
  self.background.dblclick(function(x, y) {
    self.setMaxValue();
  });
  self.bgrules = self.canvas.drawBgRules(10, { stroke: '#eee' });
  self.title = self.canvas.text(3, 7, self.metadata.name).attr({
    'font-size': 14
  , 'font-weight': 'bold'
  , 'text-anchor': 'start'
  });
  self.documents = self.canvas.set();
  self.orderLayers();
  self.draw(seqid, start, end);
};

/**
 * Resize the track's canvas
 *
 * @param {Number} width
 * @param {Number} height
 */
TrackBase.prototype.resize = function(width, height) {
  var self = this;
  self.background.remove();
  self.bgrules.remove();
  self.canvas.setSize(width, height);
  self.background = self.canvas.rect(0, 0, self.canvas.width, self.canvas.height).attr({
    fill: '#fff'
  , stroke: '#fff'
  });
  self.background.dblclick(function(x, y) {
    self.setMaxValue();
  });
  self.bgrules = self.canvas.drawBgRules(10, { stroke: '#eee' });
  self.orderLayers();
};

/**
 * Manually set the maximum value.
 *
 * If the dataset contains higher values, the manually specified value is
 * ignored
 */
TrackBase.prototype.setMaxValue = function() {
  var self = this;
  apprise("Maximum value (0 = auto) : ", {input: self.maxvalue+''}, function(value) {
    if (!isNaN(parseInt(value, 10))) {
      self.maxvalue = value <= 0 ? 0 : value;
      self.refresh(self.seqid, self.start, self.end);
    }
  });
}

/**
 * Order the layers
 */
TrackBase.prototype.orderLayers = function() {
  var self = this;
  self.documents.toBack();
  self.title.toBack();
  self.bgrules.toBack();
  self.background.toBack();
};

/**
 * Empty the track
 */
TrackBase.prototype.empty = function() {
  var self = this;
  $('#track'+self.metadata.id).empty();
};

/**
 * Clears the documents from the track canvas
 */
TrackBase.prototype.clear = function() {
  var self = this;
  self.documents.remove();
  self.documents = self.canvas.set();
  self.canvas.setSize(self.width, self.height);
};

/**
 * Refresh the documents in the track canvas.
 * This method first cleans the canvas then draws the new documents
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} data
 * @see TrackBase.clear()
 * @see TrackBase.draw()
 */
TrackBase.prototype.refresh = function(seqid, start, end) {
  var self = this;
  self.clear();
  self.draw(seqid, start, end);
};
