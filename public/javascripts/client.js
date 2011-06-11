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
    var start = $('#start').val()
      , end = $('#end').val();
    fetchTracksData(start, end);
    drawNavigationRulers(start, end);
  });
  
  /**
   * Handle browsing from main form via ajax post.
   */
  $("#submit").click(function() {
    validateForm(function(){
      var start = $('#start').val()
        , end = $('#end').val();
      fetchTracksData(start, end);
      drawNavigationRulers(start, end);
    });
    return false;
  });

});



// **********   Form Navigation   ************

/**
 * Iteratively fetches data of all selected tracks.
 */
var fetchTracksData = function(start, end){
  var seqid = $("#seqid").val()
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
  $("#start").val(start);
  $("#end").val(end);
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
 * Draw the output
 */
var drawNavigationRulers = function(start, end){
  $("#overviewnavigation").empty();
  $("#ratiozoom").empty();
  $("#zoomnavigation").empty();
  drawMainNavigation(start, end);
}

/**
 * Draw main navigation ruler
 */
var drawMainNavigation = function(start, end){
  var seqid = $('#seqid').val()
    , postURL = '/'+ window.location.href.split('/').slice(3, 6).join('/') + ".json";
  $.ajax({
    type: "POST"
  , url: postURL
  , data: { seqid: seqid }
  , dataType: "json"
  , success: function(seqidMD) {
      var overviewNavigation = Raphael("overviewnavigation", 1101, 50)
        , ratiozoom = Raphael("ratiozoom", 1101, 50)
        , zoomNavigation = Raphael("zoomnavigation", 1101, 50)
        , currentSpan;
      overviewNavigation.drawBgRules(10, { stroke: "#eee" });
      overviewNavigation.drawMainRuler(0, seqidMD.length, { stroke: "#000" });
      currentSpan = overviewNavigation.currentSpan(start, end, seqidMD.length, { fill: "#00ABFA", 'fill-opacity': 0.2 });
      overviewNavigation.explorableArea(0, seqidMD.length, { fill: "#00ABFA", 'fill-opacity': 0.3 });
      ratiozoom.drawBgRules(10, { stroke: "#eee" });
      ratiozoom.drawRatio(currentSpan);
      zoomNavigation.drawBgRules(10, { stroke: "#eee" });
      zoomNavigation.drawMainRuler(start, end, { stroke: "#000" });
      zoomNavigation.explorableArea(start, end, { fill: "#00ABFA", 'fill-opacity': 0.2 });
    }
  });
}

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
    , selected = dropdown.options[index]
    , baseURL = '/browse/' + selected.value;
  if (selected.value != 'Select a dataset'){
    top.location.href = baseURL;
    return true;
  }
  return false;
}
