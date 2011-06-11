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
    var start = parseNum($('#start').val())
      , end = parseNum($('#end').val());
    fetchTracksData(start, end);
    drawNavigationRulers(start, end);
  });
  
  /**
   * Handle browsing from main form via ajax post.
   */
  $("#submit").click(function() {
    validateForm(function(){
      var start = parseNum($('#start').val())
        , end = parseNum($('#end').val());
      fetchTracksData(start, end);
      drawNavigationRulers(start, end);
    });
    return false;
  });

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
    , baseURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  $("#tracks").empty();
  trackselector.each(function(i){
    trackID = $(trackselector[i]).val();
    tracksIDs.push(trackID);
    requestTrackData(baseURL, seqid, start, end, trackID, function(data){
      renderTrack(data, start, end);
    });
  });
  window.history.pushState({}, '',
    [baseURL, seqid, start, end, tracksIDs.join('&')].join('/')
  );
  $("#start").val(nf(start));
  $("#end").val(nf(end));
}

/**
 * Request data of a given track between 2 positions of a seqid.
 * The callback is triggered with the collected data
 *
 * @param {String} baseURL
 * @param {string} seqid
 * @param {Number} start
 * @param {Number} end
 * @param {String} trackID
 * @param {Function} callback
 */
var requestTrackData = function(postURL, seqid, start, end, trackID, callback){
  $.ajax({
    type: "POST"
  , url: postURL
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
    , okStart = !isNaN(parseNum($("#start").val()))
    , okEnd = !isNaN(parseNum($("#end").val()))
  if (okSeqid && okStart && okEnd){
    callback();
  }
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
 * Draw the output
 *
 * @param {Number} start
 * @param {Number} end
 */
var drawNavigationRulers = function(start, end){
  $("#overviewnavigation").empty();
  $("#ratiozoom").empty();
  $("#zoomnavigation").empty();
  drawMainNavigation(start, end);
}

/**
 * Draw main navigation ruler
 *
 * @param {Number} start
 * @param {Number} end
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
 * @param {Number} start
 * @param {Number} end
 */
var renderTrack = function(track, start, end){
  var trackdiv = $("<div class='track' id=track" + track.name + "></div>")
    , trackCanvas;
  $("#tracks").append(trackdiv);
  trackCanvas = Raphael("track"+track.name, 1101, 50);
  trackCanvas.drawBgRules(10, { stroke: "#eee" });
  track.docs.forEach(function(doc){
    trackCanvas.drawDocument(doc, start, end, {fill: "#000"});
  });
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
