$(document).ready(function() {

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

  /**
   * Handle browse form.
   */
  $("#submit").click(function() {
    var seqid = $('#seqid').val()
      , start = $('#start').val()
      , end = $('#end').val();
    $.post("/browse/Xentr42", {
      seqid: seqid
    , start: start
    , end: end
    }, function(data) {
      $("#tracks").empty();
      $("#tracks").append(JSON.stringify(data));
      //for (var i in data){
        //console.log(data[i]);
        //$("#tracks").append(data[i]);
      //}
    });
    return false;
  });

});
