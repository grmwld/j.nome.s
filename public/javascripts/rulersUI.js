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

/**
 * Add a selectable area to a Paper.
 */
Raphael.fn.explorableArea = function(view_start, view_end, style) {
  var gs, ge;
  var view_span = view_end - view_start;
  var a = this.rect(0, 0, this.width, this.height).attr({
    'fill-opacity': 0,
    'stroke-opacity': 0,
    fill: "#eee"
  });
  a.drag(
    // Mouse move
    function(dx, dy, x, y, e) {
      if (dx > 0) { 
        this.selector.attr({x:this.selector.ox, width:dx-1});
      } else {
        this.selector.attr({x:e.offsetX+1, width:-dx});
      }
    },
    // Mouse down
    function(x, y, e) {
      if (!e.offsetX) {
        e.offsetX = e.clientX - $(e.target).position().left;
      }
      gs = Math.floor((((e.offsetX-50)/(this.paper.width-100)) * view_span) + view_start);
      this.selector = this.paper.rect(e.offsetX, 0, 1, this.attr("height")).attr(style); 
      this.selector.ox = this.selector.attr("x");
    },
    // Mouse up
    function(e) {
      this.selector.remove();
      if (!e.offsetX) {
        // TODO : Fix bug in Firefox
        e.offsetX = e.clientX - $(e.target).position().left;
      }
      ge = Math.floor((((e.offsetX-50)/(this.paper.width-100)) * view_span) + view_start);
      var goto_start = Math.min(gs, ge), goto_end = Math.max(gs, ge);
      // Span selection
      if (goto_start != goto_end) {
        fetchTracksData(goto_start, goto_end);
      }
      // Location click
      else {
        var i_span = Math.floor(($('#input_end').attr('value')
                               - $('#input_start').attr('value')) / 2);
        fetchTracksData(goto_start-i_span, goto_end+i_span);
      }
    }
  );
}
