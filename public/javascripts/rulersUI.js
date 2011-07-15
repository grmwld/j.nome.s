/**
 * Draw a line from (x1;y1) to (x2;y2)
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {SVG}
 */
Raphael.fn.lineTo = function(x1, y1, x2, y2) {
  return this.path("M" + x1 + " " + y1 + "L" + x2 + " " + y2);
};

/**
 * Draw the background rules
 *
 * @param {Number} step
 * @param {Object} style
 */
Raphael.fn.drawBgRules = function(step, style) {
  var rules = this.set();
  for (var x = 0.5; x <= this.width; x += step){
    rules.push(this.lineTo(x, 0, x, this.height).attr(style).toBack());
  }
  return rules;
};
