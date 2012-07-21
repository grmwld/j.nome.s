/**
 * Class emcapsulating navigation elements
 */
var Navigation = function() {
  this.overviewNavigation = new OverviewNavigation(this, 'overviewnavigation', 1101, 50);
  this.ratioZoom = new RatioZoom(this, 'ratiozoom', 1101, 50);
  this.zoomNavigation = new ZoomNavigation(this, 'zoomnavigation', 1101, 50);
  this.separator = new Separator(this,  'separator', 1101, 15);
};

/**
 * Display all navigation elements
 * 
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 */
Navigation.prototype.display = function(seqid, start, end) {
  var self = this;
  getGlobalStyle(function(style) {
    getSeqidMetadata(seqid, function(meta) {
      self.overviewNavigation.display(start, end, meta, style);
      self.ratioZoom.display(self.overviewNavigation.ui.selected, style);
      self.zoomNavigation.display(start, end, meta, style);
      self.separator.display(style);
    });
  });
};

/**
 * Refresh all navigation elements
 * 
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 */
Navigation.prototype.refresh = function(seqid, start, end) {
  var self = this;
  getGlobalStyle(function(style) {
    getSeqidMetadata(seqid, function(meta) {
      self.overviewNavigation.refresh(start, end, meta, style);
      self.ratioZoom.refresh(self.overviewNavigation.ui.selected, style);
      self.zoomNavigation.refresh(start, end, meta, style);
    });
  });
};



/**
 * Base view of the seqid
 * The containing navigation must be specified in order to bind events.
 *
 * @param {Function} container
 * @param {String} anchor
 * @param {Number} width
 * @param {Number} height
 */
var BaseNavigation = function(container, anchor, width, height) {
  this.container = container;
  this.anchor = anchor;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.bgrules = undefined;
  this.ui = {
    ruler: undefined,
    selectableArea: undefined
  }
};

/**
 * Display the navigation ruler.
 * This method instanciates the canvas and draws in it.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 * @see BaseNavigation.draw()
 */
BaseNavigation.prototype.display = function(start, end, meta, style) {
  var self = this;
  self.canvas = Raphael(self.anchor, self.width, self.height);
  self.bgrules = self.canvas.drawBgRules(10, style.bgrules);
  self.draw(start, end, meta, style);
};

/**
 * Actually draw the navigation element.
 * This method draws in the canvas previously instanciated.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 */
BaseNavigation.prototype.draw = function(start, end, meta, style) {
  throw new Error('No draw methos implemented');
};

/**
 * Clear the element.
 * This only removes the potentially modified elements,
 * that is the ruler and the selected area.
 */
BaseNavigation.prototype.clear = function() {
  var self = this;
  for (ui in self.ui) {
    self.ui[ui].remove();
  }
};

/**
 * Refresh the view.
 * This calls the clear() and draw() methods back-to-back
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 * @see BaseNavigation.clear()
 * @see BaseNavigation.draw()
 */
BaseNavigation.prototype.refresh = function(start, end, meta, style){
  var self = this;
  self.clear();
  self.draw(start, end, meta, style);
};



/**
 * Overview of the seqid
 * The containing navigation must be specified in order to bind events.
 *
 * @param {Function} container
 * @param {String} anchor
 * @param {Number} width
 * @param {Number} height
 */
var OverviewNavigation = function(container, anchor, width, height) {
  BaseNavigation.call(this, container, anchor, width, height);
  this.ui.selected = undefined;
};
OverviewNavigation.prototype = new BaseNavigation;

/**
 * Draw the overview of the seqid.
 * This method draws in the canvas previously instanciated.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 */
OverviewNavigation.prototype.draw = function(start, end, meta, style) {
  var self = this;
  self.ui.ruler = self.canvas.drawMainRuler(0, meta.length, style.ruler);
  self.ui.selected = self.canvas.currentSpan(start, end, meta.length, style.selectedspan);
  self.ui.selectableArea = self.canvas.explorableArea(0, meta.length, style.selectionspan, function(start, end) {
    fetchTracksData(meta._id, start, end, true);
    self.container.refresh(meta._id, start, end);
  });
  self.ui.selectableArea.toBack();
  self.ui.selected.toBack();
  self.ui.ruler.toBack();
  self.bgrules.toBack();
};



/**
 * Zoomed view of the seqid
 * The containing navigation must be specified in order to bind events.
 *
 * @param {Function} container
 * @param {String} anchor
 * @param {Number} width
 * @param {Number} height
 */
var ZoomNavigation = function(container, anchor, width, height) {
  BaseNavigation.call(this, container, anchor, width, height);
};
ZoomNavigation.prototype = new BaseNavigation;

/**
 * Draw the zoomed view of the seqid.
 * This method draws in the canvas previously instanciated.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} style
 */
ZoomNavigation.prototype.draw = function(start, end, meta, style) {
  var self = this;
  self.ui.ruler = self.canvas.drawMainRuler(start, end, style.ruler);
  self.ui.selectableArea = self.canvas.explorableArea(start, end, style.selectionspan, function(start, end) {
    fetchTracksData(meta._id, start, end, true);
    self.container.refresh(meta._id, start, end);
  });
  self.ui.selectableArea.toBack();
  self.ui.ruler.toBack();
  self.bgrules.toBack();
};



/**
 * Ratio effect between the overview and the zoomed view
 * The containing navigation must be specified in order to bind events.
 *
 * @param {Function} container
 * @param {String} anchor
 * @param {Number} width
 * @param {Number} height
 */
var RatioZoom = function(container, anchor, width, height) {
  BaseNavigation.call(this, container, anchor, width, height);
  this.ui = {
    ratio: undefined
  }
};
RatioZoom.prototype = new BaseNavigation;

/**
 * Display the ratio.
 * This method instanciates the canvas and draws in it.
 *
 * @param {Array} current_span
 * @param {Object} style
 * @see RatioZoom.draw()
 */
RatioZoom.prototype.display = function(cur_span, style) {
  var self = this;
  self.canvas = Raphael(self.anchor, self.width, self.height);
  self.bgrules = self.canvas.drawBgRules(10, style.bgrules);
  self.ui.ratio = self.canvas.set();
  self.draw(cur_span, style);
};

/**
 * Draw the ratio.
 * This method draws in the canvas previously instanciated.
 *
 * @param {Array} current_span
 * @param {Object} style
 */
RatioZoom.prototype.draw = function(cur_span, style) {
  var self = this;
  self.ui.ratio = self.canvas.drawRatio(cur_span, style);
  self.bgrules.toBack();
};

/**
 * Refresh the view.
 * This calls the clear() and draw() methods back-to-back
 *
 * @param {Array} current_span
 * @param {Object} style
 * @see RatioZoom.clear()
 * @see RatioZoom.draw()
 */
RatioZoom.prototype.refresh = function(cur_span, style) {
  var self = this;
  self.clear();
  self.draw(cur_span, style);
}



/**
 * Separator
 *
 * @param {Function} container
 * @param {String} anchor
 * @param {Number} width
 * @param {Number} height
 */
var Separator = function(container, anchor, width, height) {
  this.container = container;
  this.anchor = anchor;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.bgrules = undefined;
};

/**
 * Display the separator.
 *
 * @param {Object} style
 */
Separator.prototype.display = function(style) {
  var self = this;
  self.canvas = Raphael(self.anchor, self.width, self.height);
  self.bgrules = self.canvas.drawBgRules(10, style.bgrules);
};



/**
 * Convert base pair to pixel coordinates according to the current min and max
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
var bp2px = function(bp_pos, view_start, view_end, canvas_width) {
  var canvas_width = typeof canvas_width === 'undefined' ? 1100 : canvas_width;
  var view_span = view_end - view_start;
  return Math.round((((Math.max(bp_pos, view_start) - view_start) / view_span) * (canvas_width-100)) + 50);
}


/**
 * Get the step of the ruler's ticks (in base pairs) according to the current
 * span
 *
 * @param {Number} view_start
 * @param {Number} view_end
 * @returns {Number}
 */
var getTickStep = function(view_start, view_end) {
  var span = view_end - view_start;
  var log10span = Math.log(span) / Math.LN10;
  var flog10span = Math.floor(log10span);
  var pflog10span = Math.pow(10, flog10span);
  var a = Math.ceil(span / pflog10span);
  return a * Math.pow(10, (flog10span - 1));
}


/**
 * Draw the labeled ruler
 *
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Object} style
 */
Raphael.fn.drawMainRuler = function(view_start, view_end, style) {
  var nf = new PHP_JS().number_format
  var view_span = view_end - view_start;
  var view_step = getTickStep(view_start, view_end);
  var first_tick = view_start - (view_start % view_step) + view_step;
  var px_first_tick = bp2px(first_tick, view_start, view_end);
  var px_step = bp2px(first_tick+view_step, view_start, view_end) - bp2px(first_tick, view_start, view_end);
  var px_minor_tick_step = px_step / 10;
  var left_text;
  var right_text;
  var tick_text;
  var ruler = this.set();
  // draw the horizontal axis
  ruler.push(this.lineTo(50, 2*this.height/3, this.width-50, 2*this.height/3).attr(style));
  // Add ticks at min and max
  left_text = this.text(50, 12, nf(view_start));
  ruler.push(left_text);
  ruler.push(this.lineTo(50.5, 2*this.height/3-8, 50.5, 2*this.height/3+8).attr(style));
  right_text = this.text(this.width-50, 12, nf(view_end));
  ruler.push(right_text);
  ruler.push(this.lineTo(this.width-49.5, 2*this.height/3-8, this.width-49.5, 2*this.height/3+8).attr(style));
  // Add intermediate ticks
  for (var x = px_first_tick+0.5, c = 0; x <= this.width-50; x += px_step, ++c) {
    // major ticks
    ruler.push(this.lineTo(x, 2*this.height/3-8, x, 2*this.height/3+8).attr(style));
    tick_text = this.text(x, 12, nf(first_tick + view_step * c ));
    if (Raphael.isBBoxIntersect(tick_text.getBBox(), left_text.getBBox())
        || Raphael.isBBoxIntersect(tick_text.getBBox(), right_text.getBBox())) {
      tick_text.remove();
    }
    else {
      ruler.push(tick_text);
    }
    // minor ticks
    for (var j = x, xf = Math.min(x+px_step, this.width-49.5); j < xf; j += px_minor_tick_step) {
      ruler.push(this.lineTo(j, 2*this.height/3-3, j, 2*this.height/3+3).attr(style));
    }
  }
  // leftmost minor ticks
  for (var x = px_first_tick-px_minor_tick_step; x > 50.5; x -= px_minor_tick_step) {
    ruler.push(this.lineTo(x, 2*this.height/3-3, x, 2*this.height/3+3).attr(style));
  }
  return ruler;
}

/**
 * Display 2 lines going from the current selection in the overview to the local view
 *
 * @param {Number} cur_span
 * @param {Object} style
 */
Raphael.fn.drawRatio = function(cur_span, style) {
  var sx1 = cur_span.attrs.x;
  var sy1 = 0;
  var sx2 = 50;
  var sy2 = this.height;
  var ex1 = cur_span.attrs.x + cur_span.attrs.width;
  var ey1 = 0;
  var ex2 = this.width - 50;
  var ey2 = this.height;
  var ratio = this.set();
  ratio.push(this.lineTo(sx1, sy1, sx2, sy2).attr(style));
  ratio.push(this.lineTo(ex1, ey1, ex2, ey2).attr(style));
  return ratio;
}

/**
 * Display the area currently selected
 *
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Number} tot_length
 * @param {Object} style
 * @return {SVG}
 */
Raphael.fn.currentSpan = function(view_start, view_end, tot_length, style) {
  var view_span = view_end - view_start;
  var rel_start = (((view_start) / tot_length) * (this.width-100)) + 50;
  var rel_end = (((view_end) / tot_length) * (this.width-100)) + 50;
  var rel_doc_length = rel_end - rel_start;
  return this.rect(rel_start, 1, rel_doc_length, this.height-2).attr(style);
}

/**
 * Add a selectable area to a Paper.
 *
 * @param {Number} view_start
 * @param {Number} view_end
 * @param {Object} style
 */
Raphael.fn.explorableArea = function(view_start, view_end, style, callback) {
  var gs, ge;
  var view_span = view_end - view_start;
  var a = this.rect(0, 0, this.width, this.height).attr({
        'fill-opacity': 0,
        'stroke-opacity': 0,
        fill: '#eee'
      });
  a.drag(
    // Mouse move
    function(dx, dy, x, y, e) {
      e.offsetX = e.offsetX ? e.offsetX : e.clientX-$(e.target).position().left;
      if (dx > 0) { 
        this.selector.attr({
          x: this.selector.ox
        , width: dx-1
        });
      } else {
        this.selector.attr({
          x: e.offsetX+1
        , width: -dx
        });
      }
    },
    // Mouse down
    function(x, y, e) {
      e.offsetX = e.offsetX ? e.offsetX : e.clientX-$(e.target).position().left;
      gs = Math.floor((((e.offsetX-50)/(this.paper.width-100)) * view_span) + view_start);
      this.selector = this.paper.rect(e.offsetX, 1, 1, this.attr('height')-2).attr(style); 
      this.selector.ox = this.selector.attr('x');
    },
    // Mouse up
    function(e) {
      var goto_start
        , goto_end;
      e.offsetX = e.offsetX ? e.offsetX : e.clientX-$(e.target).position().left;
      ge = Math.floor((((e.offsetX-50)/(this.paper.width-100)) * view_span) + view_start);
      goto_start = Math.min(gs, ge);
      goto_end = Math.max(gs, ge);
      this.selector.remove();
      // Span selection
      if (goto_start != goto_end) {
        sanitizeInputPos(goto_start, goto_end, function(start, end) {
          callback(start, end);
        });
      }
      // Location click
      else {
        var i_span = Math.floor(($('#end').val() - $('#start').val()) / 2);
        sanitizeInputPos(goto_start-i_span, goto_end+i_span, function(start, end) {
          callback(start, end);
        });
      }
    }
  );
  return a;
}
