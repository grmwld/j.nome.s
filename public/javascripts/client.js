$(document).ready(function() {

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
   */
  validateForm(function(){
    fetchTracksData();
  });
  
  /**
   * Handle browsing from main form via ajax post.
   */
  $("#submit").click(function() {
    validateForm(function(){
      fetchTracksData();
    });
    return false;
  });

  /**
   * Draw the main navigation ruler
   */
  var mainNavigation = Raphael("mainnavruler", 1101, 50);
  mainNavigation.drawBgRules(10, { stroke: "#eee" });
  mainNavigation.drawMainRuler(0, 7000000, { stroke: "#000" });

});



// **********   Navigation Form   ************

/**
 * Iteratively fetches data of all selected tracks.
 */
var fetchTracksData = function(){
  var seqid = $('#seqid').val()
    , start = $('#start').val()
    , end = $('#end').val()
    , trackselector = $('#trackselector :checked')
    , tracksIDs = []
    , trackID
    , baseURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  $("#tracks").empty();
  trackselector.each(function(i){
    trackID = $(trackselector[i]).val();
    tracksIDs.push(trackID);
    requestTrackData(baseURL, seqid, start, end, trackID, function(data){
      renderTrack(data);
    });
  });
  window.history.pushState({}, '',
    [baseURL, seqid, start, end, tracksIDs.join('&')].join('/')
  );
}

/**
 * Request data of a given track between 2 positions of a seqid.
 * The callback is triggered with the collected data
 *
 * @param {String} baseURL
 * @param {string} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {String} track
 * @param {Function} callback
 */
var requestTrackData = function(baseURL, seqid, start, end, trackID, callback){
  $.ajax({
    type: "POST"
  , url: baseURL
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
 * Validates the values in the form.
 * If the form is valid, the callback is triggered.
 *
 * @param {Function} callback
 */
var validateForm = function(callback){
  var okSeqid = $("#seqid").val() != 'seqid'
    , okStart = !isNaN($("#start").val())
    , okEnd = !isNaN($("#end").val())
  if (okSeqid && okStart && okEnd){
    callback();
  }
}

/**
 * Clear prompt from field
 * 
 * @param {Object} element
 */
var clearPrompt = function(elem){
  if ($(elem).val() == $(elem).attr("name")) {
    $(elem).val("");
  }
}

/**
 * Set prompt for field
 *
 * @param {Object} element
 */
var setPrompt = function(elem){
  if ($(elem).val() == "") {
    $(elem).val($(elem).attr("name"));
  }
}



// *********   Tracks and rulers navigation   ************

/**
 * Render a track
 *
 * @param {Object} track
 */
var renderTrack = function(t){
  var track = $("<div class='track'></div>");
  track.append($([
    "<h3>"
  , t.name, ":", t.docs.length, "results"
  , "</h3>"
  ].join(' ')));
  $("#tracks").append(track);
}




/**
 * Function to handle a selected dataset in a dropdown menu
 *
 * @param {Object} dropdown menu
 * @return {Boolean}
 */
var OnSelect = function(dropdown){
  var index  = dropdown.selectedIndex
    , selected = dropdown.options[myindex]
    , baseURL = '/browse/' + selected.value;
  if (selected.value != 'Select a dataset'){
    top.location.href = baseURL;
    return true;
  }
  return false;
}
