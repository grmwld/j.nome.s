/**
 * Client side javascript
 *
 * Renders all client-side data when page is ready.
 */


$(document).ready(function() {

  var navigation = new Navigation();

  /**
   * Setup dynamic prompt input text-fields.
   * The default value corresponds to the 'name' attribute
   * of the input field.
   */
  $("input[type=text]")
    .focus(function(){
      clearPrompt(this);
    })
    .blur(function(){
      setPrompt(this);
    });

  /**
   * Render tracks if parameters of the form are valid.
   *
   * The text-field inputs for positions are also sanitized for
   * negative or too big values.
   */
  validateForm(function(){
    var start = parseNum($('#start').val())
      , end = parseNum($('#end').val());
    sanitizeInputPos(start, end, function(start, end){
      fetchTracksData(start, end);
      displayNavigation(navigation, start, end);
    });
  });
  
  /**
   * Handle browsing from main form.
   */
  $("#submit").click(function() {
    validateForm(function(){
      var start = parseNum($('#start').val())
        , end = parseNum($('#end').val());
      sanitizeInputPos(start, end, function(start, end){
        fetchTracksData(start, end);
        refreshNavigation(navigation, start, end);
      });
    });
    return false;
  });

  $("#tracks").sortable({
    placeholder: "ui-state-highlight"
  , forcePlaceholderSize: true
  , opacity: 0.9
  });
  $("#tracks").disableSelection();

  localStorage["prevTracks"] = JSON.stringify([]);
  localStorage["prevPos"] = 0;
  localStorage["prevSeqID"] = "";

});



// **********   Form Navigation   ************

/**
 * Iteratively fetches data of all selected tracks.
 * After rendering, 'start' and 'end' values are updated
 *
 * @param {Number} start
 * @param {Number} end
 */
var fetchTracksData = function(start, end){
  var nf = new PHP_JS().number_format
    , seqid = $("#seqid").val()
    , trackselector = $('#trackselector :checked')
    , tracksIDs = []
    , trackID
    , prevTracks = JSON.parse(localStorage["prevTracks"])
    , prevPos = parseInt(localStorage["prevPos"], 10)
    , prevSeqID = localStorage["prevSeqID"]
    , reqURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  trackselector.each(function(i){
    trackID = $(trackselector[i]).val();
    tracksIDs.push(trackID);
    if (   seqid !== prevSeqID
        || prevTracks === []
        || prevPos === 0
        || prevTracks.indexOf(trackID) === -1
        || prevPos !== start*end) {
      requestTrackData(reqURL, seqid, start, end, trackID, function(track){
        renderTrack(track, start, end);
      });
    }
  });
  prevTracks.forEach(function(ptrack){
    if (tracksIDs.indexOf(ptrack) === -1){
      $("#track"+ptrack).empty();
    }
  });
  window.history.pushState({}, '',
    [reqURL, seqid, start, end, tracksIDs.join('&')].join('/')
  );
  localStorage["prevTracks"] = JSON.stringify(tracksIDs);
  localStorage["prevPos"] = start*end
  $("#start").val(nf(start));
  $("#end").val(nf(end));
}

/**
 * Request data of a given track between 2 positions of a seqid.
 * The callback is triggered with the collected data
 *
 * @param {String} reqURL
 * @param {string} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {String} trackID
 * @param {Function} callback
 * @api private
 */
var requestTrackData = function(reqURL, seqid, start, end, trackID, callback){
  $.ajax({
    type: "POST"
  , url: reqURL
  , data: {
      seqid: seqid
    , start: start
    , end: end
    , trackID: trackID
    }
  , dataType: "json"
  , success: function(data) {
      callback(data);
    }
  });
}

/**
 * Get the metadata associated to the current seqid
 *
 * @param {String} seqid
 * @param {Function} callback
 * @api private
 */
var getSeqidMetadata = function(seqid, callback){
  var reqURL = '/'
    + window.location.href.split('/').slice(3, 5).join('/')
    + '/' + seqid + ".json";
  $.ajax({
    type: "GET"
  , url: reqURL
  , dataType: "json"
  , success: function(metadata) {
      callback(metadata);
    }
  });
}

/**
 * Get the global style
 *
 * @param {Function} callback
 */
var getGlobalStyle = function(callback){
  var reqURL = '/globalconfig.json';
  $.ajax({
    type: "GET"
  , url: reqURL
  //, data: { seqid: seqid }
  , dataType: "json"
  , success: function(style) {
      callback(style);
    }
  });
}

/**
 * Validates the values in the form.
 * If the form is valid, the callback is triggered.
 *
 * @param {Function} callback
 */
var validateForm = function(callback){
  var seqid = $("#seqid").val()
    , start = parseNum($("#start").val())
    , end = parseNum($("#end").val())
    , okSeqid = seqid != 'seqid'
    , okStart = !isNaN(start)
    , okEnd = !isNaN(end);
  if (okSeqid && okStart && okEnd){
    callback();
  }
}

/**
 * Reset positions to 0 or seqid.length if it exceeds those limits.
 * The call back is triggered with the new start and end positions.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 */
var sanitizeInputPos = function(start, end, callback){
  var nf = new PHP_JS().number_format;
  getSeqidMetadata($("#seqid").val(), function(seqidMD){
    start = Math.max(0, start)
    end = Math.min(seqidMD.length, end);
    $("#start").val(nf(start));
    $("#end").val(nf(end));
    callback(start, end);
  });
}

/**
 * Clear prompt from field
 * 
 * @param {Object} element
 */
var clearPrompt = function(element){
  if ($(element).val() == $(element).attr("name")) {
    $(element).val("");
  }
}

/**
 * Set prompt for field
 *
 * @param {Object} element
 */
var setPrompt = function(element){
  if ($(element).val() == "") {
    $(element).val($(element).attr("name"));
  }
}

/**
 * Convert a formated number to an integer.
 * Returns NaN if the formated number cannot be parsed.
 *
 * @param {String} str_num
 * @return {Number}
 */
var parseNum = function(str_num){
  var nf = new PHP_JS().number_format;
  parsedNum = parseInt(nf(str_num, 0, '.', ''), 10);
  if (parseInt(str_num, 10) != 0){
    if (parsedNum != 0){
      return parseInt(nf(str_num, 0, '.', ''), 10);
    }
    return NaN;
  }
  return 0;
}


// *********   Tracks and rulers navigation   ************

/**
 * Draw the navigation rulers between 2 positions
 *
 * @param {Number} start
 * @param {Number} end
 */
var displayNavigation = function(navigation, start, end){
  getGlobalStyle(function(style){
    var seqid = $('#seqid').val();
    getSeqidMetadata(seqid, function(seqidMD){
      navigation.display(start, end, seqidMD, style);
    });
  });
}

/**
 * Refresh the navigation rulers between 2 positions
 *
 * @param {Number} start
 * @param {Number} end
 */
var refreshNavigation = function(navigation, start, end){
  getGlobalStyle(function(style){
    var seqid = $('#seqid').val();
    getSeqidMetadata(seqid, function(seqidMD){
      navigation.refresh(start, end, seqidMD, style);
    });
  });
}
/**
 * Render a track
 *
 * @param {Object} track
 * @param {Number} start
 * @param {Number} end
 */
var renderTrack = function(track, start, end){
  var trackdiv = $("<div class='track' id=track"+ track.metadata.id +"></div>")
    , trackCanvas
    , bgrules
    , bground
    , layers = []
    , next = false
    , laidout = false;
  $("#track"+track.metadata.id).empty();
  $("#tracks").append(trackdiv);
  trackCanvas = Raphael("track"+track.metadata.id, 1101, 50);
  bground = trackCanvas.rect(0, 0, trackCanvas.width, trackCanvas.height).attr({ fill: "#fff", stroke: "#fff" });
  bgrules = trackCanvas.drawBgRules(10, { stroke: "#eee" });
  trackCanvas.text(3, 5, track.metadata.name).attr({'font-size': 14, 'font-weight': "bold", 'text-anchor': "start"});
  track.data.forEach(function(doc){
    laidout = false;
    for (var i = 0; i < layers.length; ++i){
      for (var j = 0; j < layers[i].length; ++j){
        if (    doc.start >= layers[i][j][0] && doc.start <= layers[i][j][1]
            ||  doc.end >= layers[i][j][0] && doc.end <= layers[i][j][1]){
          next = true;
          break;
        }
      }
      if (!next){
        trackCanvas.drawDocument(doc, start, end, i, track.metadata.style);
        layers[i].push([doc.start, doc.end]);
        laidout = true;
        break;
      }
      next = false;
    }
    if (!laidout){
      bgrules.remove();
      trackCanvas.setSize(trackCanvas.width, trackCanvas.height+35);
      bgrules = trackCanvas.drawBgRules(10, { stroke: "#eee" });
      bground.remove();
      bground = trackCanvas.rect(0, 0, trackCanvas.width, trackCanvas.height).attr({ fill: "#fff", stroke: "#fff" });
      bground.toBack();
      trackCanvas.drawDocument(doc, start, end, i, track.metadata.style);
      layers.push([[doc.start, doc.end]]);
    }
  });
}


/**
 * Function to handle a selected dataset in a dropdown menu
 *
 * @param {Object} dropdown
 * @return {Boolean}
 */
var OnSelect = function(dropdown){
  var index  = dropdown.selectedIndex
    , selected = dropdown.options[index]
    , baseURL = '/browse/' + selected.value;
  if (selected.value != 'Select a dataset'){
    top.location.href = baseURL;
    return true;
  }
  return false;
}
