$(document).ready(function() {

  /**
   * Handle browsing from main form.
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
    $.post(baseURL, {
      seqid: seqid
    , start: start
    , end: end
    , tracks: tracks
    }, function(data) {
      $("#tracks").empty();
      $("#tracks").append(JSON.stringify(data));
      window.history.pushState({}, '',
        [baseURL, seqid, start, end, tracks.join('&')].join('/')
      );
    });
    return false;
  });

});


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
