/**
 * Compute the size (number of elements) of a given object
 *
 * @param {Object} object
 * @return {Number} size
 * @api public
 */
var objectSize = function(object) {
  var size = 0
    , key;
  for (key in object){
    if (object.hasOwnProperty(key)){
      size++;
    }
  }
  return size;
}


/**
 * Expose public functions, classes and methods
 */
exports.objectSize = objectSize;
