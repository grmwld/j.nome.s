/**
 * Draw a line from (x1;y1) to (x2;y2)
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {SVG} path
 */
Raphael.fn.lineTo = function(x1, y1, x2, y2){
  return this.path("M" + x1 + " " + y1 + "L" + x2 + " " + y2);
}

/**
 * Draw the background rules
 *
 * @param {Number} step
 * @param {Object} style
 */
Raphael.fn.drawBgRules = function(step, style){
  for (var x = 0.5; x <= this.width; x += step){
    this.lineTo(x, 0, x, this.height).attr(style);
  }
}

/**
 * Draw the labeled ruler
 *
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Object} style
 */
Raphael.fn.drawMainRuler = function(view_start, view_end, style) {
  var nf = new PHP_JS().number_format;
  var view_span = view_end - view_start;
  view_step = view_span / 5;
  this.lineTo(50, 2*this.height/3, this.width-50, 2*this.height/3).attr(style);
  for (var x = 50.5; x <= this.width-50; x += 40) {
    this.lineTo(x, 2*this.height/3-3, x, 2*this.height/3+3).attr(style);
  }
  for (var x = 50; x <= this.width-50; x += 200) {
    this.text(x, 12, nf(view_start+view_step*((x-50)/200)));
    this.lineTo(x+0.5, 2*this.height/3-8, x+0.5, 2*this.height/3+8).attr(style);
  }
}


