$(document).ready(function() {

  /**
   * Setup dynamic prompt input text-fields.
   * The default value corresponds to the 'name' attribute
   * of the input field.
   */
  $("input[type=text]").focus(function(){
    clearPrompt(this);
  }).blur(function(){
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

});



/**
 * Post an AJAX request to fetch the requested data
 * 
 * @api private
 */
var fetchTracksData = function(){
  var seqid = $('#seqid').val()
    , start = $('#start').val()
    , end = $('#end').val()
    , tracks = []
    , track
    , trackselector = $('#trackselector :checked')
    , baseURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
  $("#tracks").empty();
  trackselector.each(function(i){
    tracks.push($(trackselector[i]).val());
  });
  tracks.forEach(function(track){
    $.ajax({
      type: "POST"
    , url: baseURL
    , data: {
        seqid: seqid
      , start: start
      , end: end
      , track: track
      }
    , dataType: "json"
    , success: function(data) {
        renderTrack(data);
      }
    });
  });
  window.history.pushState({}, '',
    [baseURL, seqid, start, end, tracks.join('&')].join('/')
  );
}

/**
 * Validates the values in the form.
 * If the form is valid, the callback is triggered.
 *
 * @param {Function} callback
 * @api private
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
 * Render a track
 *
 * @param {Object} track
 * @api private
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
 * Clear prompt from field
 * 
 * @param {Object} element
 * @api private
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
 * @api private
 */
setPrompt = function(elem){
  if ($(elem).val() == "") {
    $(elem).val($(elem).attr("name"));
  }
}

/**
 * Function to handle a selected dataset in a dropdown menu
 *
 * @param {Object} dropdown menu
 * @return {Boolean}
 * @api public
 */
function OnSelect(dropdown){
  var index  = dropdown.selectedIndex
    , selected = dropdown.options[myindex]
    , baseURL = '/browse/' + selected.value;
  if (selected.value != 'Select a dataset'){
    top.location.href = baseURL;
    return true;
  }
  return false;
}
