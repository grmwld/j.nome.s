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
   * Handle browsing from main form via ajax post.
   */
  $("#submit").click(function() {
    var seqid = $('#seqid').val()
      , start = $('#start').val()
      , end = $('#end').val()
      , tracks = []
      , trackselector = $('#trackselector :checked')
      , baseURL = '/'+ window.location.href.split('/').slice(3, 5).join('/');
    trackselector.each(function(i){
      tracks.push($(trackselector[i]).val());
    });
    $.ajax({
      type: "POST"
    , url: baseURL 
    , data: {
        seqid: seqid
      , start: start
      , end: end
      , tracks: tracks
      }
    , dataType: "json"
    , success: function(data) {
        $("#tracks").empty();
        data.forEach(function(t){
          printTrack(t);
        });
        window.history.pushState({}, '',
          [baseURL, seqid, start, end, tracks.join('&')].join('/')
        );
      }
    });
    return false;
  });

});



/**
 * Print someinfo about a track
 *
 * @param {Object} track
 * @api private
 */
var printTrack = function(t){
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
function OnSelect(dropdown)
{
  var myindex  = dropdown.selectedIndex
  var SelValue = dropdown.options[myindex].value
  if (SelValue != 'Select a dataset') {
    var baseURL  = '/browse/'+SelValue
    top.location.href = baseURL;
    return true;
  }
  return false;
}
