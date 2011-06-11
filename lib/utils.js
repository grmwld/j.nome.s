/**
 * Module dependencies
 */
var async = require('async');


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
 * Iterate over items in an array, and perform
 * a callback when all items have been processed
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Function} callback
 * @api public
 */
var forEachWhilst = function(arr, fn, callback){
  var count = 0;
  arr.forEach(function(e){
    fn(e, function(){ ++count; });
  });
  async.whilst(
    function(){ return count < arr.length }
  , function(cb){ setTimeout(cb, 100); }
  , function(err){ callback(err); }
  );
}

/**
 * Expose public functions, classes and methods
 */
exports.objectSize = objectSize;
exports.forEachWhilst = forEachWhilst;
