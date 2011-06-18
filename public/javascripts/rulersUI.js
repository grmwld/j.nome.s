/**
 * Draw a line from (x1;y1) to (x2;y2)
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {SVG}
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
  var rules = this.set();
  for (var x = 0.5; x <= this.width; x += step){
    rules.push(this.lineTo(x, 0, x, this.height).attr(style).toBack());
  }
  return rules;
}

/**
 * Draw a document
 *
 * @param {Object} doc
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Object} style
 */
Raphael.fn.drawDocument = function(doc, view_start, view_end, layer, style) {
  view_span = view_end - view_start;
  var nf = new PHP_JS().number_format
    , rel_start = (((Math.max(doc.start, view_start) - view_start) / view_span) * (this.width-100)) + 50
    , rel_end = (((Math.min(doc.end, view_end) - view_start) / view_span) * (this.width-100)) + 50
    , rel_doc_length = rel_end - rel_start
    , d = this.rect(rel_start, 35+35*layer, rel_doc_length, 10).attr(style);
  d.attr({title:[
    'ID : ' + doc._id,
    'From : ' + nf(doc.start),
    'To : ' + nf(doc.end),
    'Spanning : ' + nf(doc.end - doc.start)
  ].join('\n')});
}
