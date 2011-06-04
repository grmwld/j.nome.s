function OnSelect(dropdown)
{
  var myindex  = dropdown.selectedIndex
  var SelValue = dropdown.options[myindex].value
  if (SelValue != 'Select a dataset') {
    var baseURL  = '/datasets/'+SelValue
    top.location.href = baseURL;
    return true;
  }
  return false;
}
