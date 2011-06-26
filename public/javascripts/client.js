/**
 * Client side javascript
 *
 * Renders all client-side data when page is ready.
 */


$(document).ready(function() {

  var navigation = new Navigation();

  tracks = {};
  previous = {
    tracks: []
  , pos: 0
  , seqid: ""
  };

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
    var seqid = $('#seqid').val() 
      , start = parseNum($('#start').val())
      , end = parseNum($('#end').val());
    sanitizeInputPos(start, end, function(start, end){
      fetchTracksData(seqid, start, end, true);
      navigation.display(seqid, start, end);
    });
  });
  
  /**
   * Handle browsing from main form.
   */
  $("#submit").click(function() {
    validateForm(function(){
      var seqid = $('#seqid').val()
        , start = parseNum($('#start').val())
        , end = parseNum($('#end').val());
      sanitizeInputPos(start, end, function(start, end){
        fetchTracksData(seqid, start, end, true);
        navigation.refresh(seqid, start, end);
        
      });
    });
    return false;
  });

  $("#tracks").sortable({
    placeholder: "ui-state-highlight"
  , forcePlaceholderSize: true
  , opacity: 0.8
  });
  $("#tracks").disableSelection();

  window.onpopstate = function(event) {
    var state = event.state;
    console.log(JSON.stringify(state));
    fetchTracksData(state.seqid, state.start, state.end);
    navigation.refresh(state.seqid, state.start, state.end);
  };

});



// **********   Form Navigation   ************

/**
 * Iteratively fetches data of all selected tracks.
 * After rendering, 'start' and 'end' values are updated
 *
 * @param {Number} start
 * @param {Number} end
 */
var fetchTracksData = function(seqid, start, end, updatehistory){
  var nf = new PHP_JS().number_format
    , trackselector = $('#trackselector :checked')
    , tracksIDs = []
    , trackID
    , reqURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  trackselector.each(function(i){
    trackID = $(trackselector[i]).val();
    tracksIDs.push(trackID);
  });
  tracksIDs.forEach(function(trackid){
    if (   seqid !== previous.seqid
        || previous.tracks === []
        || previous.pos === 0
        || previous.tracks.indexOf(trackid) === -1
        || previous.pos !== start*end) {
      requestTrackData(reqURL, seqid, start, end, trackid, function(track){
        if (!tracks[trackid]){
          tracks[trackid] = new Track(track, 1101, 50);
          tracks[trackid].display(start, end);
        } else {
          tracks[trackid].refresh(start, end, track.data);
        }
      });
    }
  });
  previous.tracks.forEach(function(ptrack){
    if (tracksIDs.indexOf(ptrack) === -1){
      tracks[ptrack].empty();
      delete tracks[ptrack];
    }
  });
  if (updatehistory){
    window.history.pushState({
      seqid: seqid
    , start: start
    , end: end
    , tracksIDs: tracksIDs
    }, '',
      [reqURL, seqid, start, end, tracksIDs.join('&')].join('/')
    );
  }
  previous.tracks = tracksIDs;
  previous.pos = start*end;
  previous.seqid = seqid;
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
  if (!localStorage[seqid+"metadata"]){
    var reqURL = '/'
      + window.location.href.split('/').slice(3, 5).join('/')
      + '/' + seqid + ".json";
    $.ajax({
      type: "GET"
    , url: reqURL
    , dataType: "json"
    , success: function(metadata) {
        localStorage[seqid+"metadata"] = JSON.stringify(metadata);
        callback(metadata);
      }
    });
  } else {
    callback(JSON.parse(localStorage[seqid+"metadata"]));
  }
}

/**
 * Get the global style
 *
 * @param {Function} callback
 */
var getGlobalStyle = function(callback){
  var reqURL = '/globalconfig.json';
  if (!localStorage["globalconfig"]){
    $.ajax({
      type: "GET"
    , url: reqURL
    , dataType: "json"
    , success: function(style) {
        localStorage["globalconfig"] = JSON.stringify(style);
        callback(style);
      }
    });
  } else {
    callback(JSON.parse(localStorage["globalconfig"]));
  }
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
