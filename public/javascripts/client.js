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
   * Render tracks if parameters of the form are valid.
   *
   * The text-field inputs for positions are also sanitized for
   * negative or too big values.
   */
  validateForm(function(seqid, start, end) {
    fetchTracksData(seqid, start, end, true);
    navigation.display(seqid, start, end);
  });
  
  /**
   * Handle browsing from main form.
   */
  $('#submit').click(function() {
    validateForm(function(seqid, start, end) {
      fetchTracksData(seqid, start, end, true);
      try {
        navigation.refresh(seqid, start, end);
      } catch (err) {
        if (err.arguments[0] === 'remove') {
          navigation.display(seqid, start, end);
        }
      }
    });
    return false;
  });

  /**
   * Makes the tracks divs sortable
   */
  $("#tracks").sortable({
    placeholder: 'ui-state-highlight'
  , forcePlaceholderSize: true
  , opacity: 0.8
  , cursor: 'move'
  });
  $('#tracks').disableSelection();

  /**
   * Handle history navigation
   */
  window.onpopstate = function(event) {
    var state = event.state;
    if (state) {
      fetchTracksData(state.seqid, state.start, state.end, false);
      navigation.refresh(state.seqid, state.start, state.end);
    }
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
var fetchTracksData = function(seqid, start, end, updatehistory) {
  var trackselector = $('#trackselector :checked');
  var tracksIDs = [];
  var trackID;
  var reqURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  trackselector.each(function(i) {
    trackID = $(trackselector[i]).val();
    tracksIDs.push(trackID);
  });
  tracksIDs.forEach(function(trackid) {
    if (   seqid !== previous.seqid
        || previous.tracks === []
        || previous.pos === 0
        || previous.tracks.indexOf(trackid) === -1
        || previous.pos !== (start+1)*end) {
      if (!tracks[trackid]) {
        tracks[trackid] = new Track(trackid, 1101, 50);
        tracks[trackid].display(seqid, start, end);
      } else {
        tracks[trackid].refresh(seqid, start, end);
      }
    }
  });
  previous.tracks.forEach(function(ptrack) {
    if (tracksIDs.indexOf(ptrack) === -1) {
      tracks[ptrack].empty();
      delete tracks[ptrack];
    }
  });
  if (updatehistory) {
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
  previous.pos = (start+1)*end;
  previous.seqid = seqid;
  $('#start').val(start);
  $('#end').val(end);
};

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
var requestTrackData = function(reqURL, seqid, start, end, trackID, callback) {
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
};

/**
 * Get the metadata associated to the current seqid
 *
 * @param {String} seqid
 * @param {Function} callback
 * @api private
 */
var getSeqidMetadata = function(seqid, callback) {
  var dataset = window.location.href.split('/')[4];
  if (!localStorage[dataset+seqid+"metadata"]) {
    var reqURL = '/'
      + window.location.href.split('/').slice(3, 5).join('/')
      + '/' + seqid + ".json";
    $.ajax({
      type: "GET"
    , url: reqURL
    , dataType: "json"
    , success: function(metadata) {
        if (metadata){
          localStorage[dataset+seqid+"metadata"] = JSON.stringify(metadata);
          callback(metadata);
        }
      }
    });
  } else {
    callback(JSON.parse(localStorage[dataset+seqid+"metadata"]));
  }
}

/**
 * Get the global style
 *
 * @param {Function} callback
 */
var getGlobalStyle = function(callback) {
  var reqURL = '/globalconfig.json';
  if (!localStorage["globalconfig"]) {
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
};

/**
 * Validates the values in the form.
 * If the form is valid, the callback is triggered.
 *
 * @param {Function} callback
 */
var validateForm = function(callback) {
  var seqid = $('#seqid').val();
  var start = $('#start').val();
  var end = $('#end').val();
  if (seqid && !(isNaN(start) || isNaN(end))) {
    sanitizeInputPos(start, end, function(start, end) {
      callback(seqid, start, end);
    });
  }
};

/**
 * Reset positions to 0 or seqid.length if it exceeds those limits.
 * The call back is triggered with the new start and end positions.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callback
 */
var sanitizeInputPos = function(start, end, callback) {
  var start = start;
  var end = end;
  var temp = 0;
  if (start > end) {
    temp = end;
    end = start;
    start = temp;
  }
  getSeqidMetadata($('#seqid').val(), function(seqidMD) {
    start = Math.max(0, start);
    end = Math.min(seqidMD.length, end);
    callback(start, end);
  });
};



/**
 * Function to handle a selected dataset in a dropdown menu
 *
 * @param {Object} dropdown
 * @return {Boolean}
 */
var OnSelect = function(dropdown) {
  var index = dropdown.selectedIndex
    , selected = dropdown.options[index]
    , baseURL = '/browse/' + selected.value;
  if (selected.value != 'Select a dataset') {
    top.location.href = baseURL;
    return true;
  }
  return false;
};
