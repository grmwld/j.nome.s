/**
 * Class for handling track display
 *
 * @param {Object} track
 * @param {Number} width
 * @param {Number} height
 */
var Track = function(track, width, height){
  this.width = width;
  this.height = height;
  this.metadata = track.metadata;
  this.data = track.data;
  this.canvas = undefined;
  this.bgrules = undefined;
  this.documents = undefined;
  this.title = undefined;
  this.div = $("<div class='track' id=track"+ this.metadata.id +"></div>");
};

/**
 * Display a track.
 * Instanciates and creates the containing elements if they don't exist.
 *
 * @param {Number} start
 * @param {Number} end
 */
Track.prototype.display = function(start, end){
  var self = this;
  if ($("#track"+self.metadata.id).length === 0){
    $("#tracks").append(self.div);
  }
  self.canvas = Raphael("track"+self.metadata.id, self.width, self.height);
  self.bgrules = self.canvas.drawBgRules(10, { stroke: "#eee" });
  self.title = self.canvas.text(3, 5, self.metadata.name).attr({'font-size': 14, 'font-weight': "bold", 'text-anchor': "start"});
  self.documents = self.canvas.set();
  self.draw(start, end);
};

/**
 * Draw the documents in the track canvas
 *
 * @param {Number} start
 * @param {Number} end
 * @see drawDocument()
 */
Track.prototype.draw = function(start, end){
  var self = this
    , layers = []
    , laidout = false
    , next = false;
  self.data.forEach(function(doc){
    laidout = false;
    for (var i = 0; i < layers.length; ++i){
      for (var j = 0; j < layers[i].length; ++j){
        if (   doc.start >= layers[i][j][0] && doc.start <= layers[i][j][1]
            || doc.end >= layers[i][j][0] && doc.end <= layers[i][j][1]){
          next = true;
          break;
        }
      }
      if (!next){
        self.documents.push(self.canvas.drawDocument(doc, start, end, i, self.metadata.style));
        layers[i].push([doc.start, doc.end]);
        laidout = true;
        break;
      }
      next = false;
    }
    if (!laidout){
      self.bgrules.remove();
      self.canvas.setSize(self.canvas.width, self.canvas.height+35);
      self.bgrules = self.canvas.drawBgRules(10, { stroke: "#eee" });
      self.documents.push(self.canvas.drawDocument(doc, start, end, i, self.metadata.style));
      layers.push([[doc.start, doc.end]]);
    }
  });
}

/**
 * Empty the track
 */
Track.prototype.empty = function(){
  var self = this;
  $("#track"+self.metadata.id).empty();
}

/**
 * Clears the documents from the track canvas
 */
Track.prototype.clear = function(){
  var self = this;
  self.documents.remove();
  self.canvas.setSize(self.width, self.height);
}

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
Track.prototype.refresh = function(start, end, data){
  var self = this;
  self.clear();
  self.data = data;
  self.draw(start, end);
}



/**
 * Draw a document
 *
 * @param {Object} doc
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Object} style
 */
Raphael.fn.drawDocument = function(doc, view_start, view_end, layer, style) {
  view_span = view_end - view_start;
  var nf = new PHP_JS().number_format
    , rel_start = (((Math.max(doc.start, view_start) - view_start) / view_span) * (this.width-100)) + 50
    , rel_end = (((Math.min(doc.end, view_end) - view_start) / view_span) * (this.width-100)) + 50
    , rel_doc_length = rel_end - rel_start
    , d = this.rect(rel_start, 40+35*layer, rel_doc_length, 10).attr(style)
    , title = [];
  for (var i in doc){
    title.push(i + ' : ' + doc[i]);
  }
  d.attr({ title: title.join('\n') });
  return d;
}
