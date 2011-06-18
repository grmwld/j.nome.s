/**
 * Class emcapsulating navigation elements
 */
var Navigation = function(){
  this.overviewNavigation = new OverviewNavigation(this, "overviewnavigation", 1101, 50);
  this.ratioZoom = new RatioZoom(this, "ratiozoom", 1101, 50);
  this.zoomNavigation = new ZoomNavigation(this, "zoomnavigation", 1101, 50);
};

/**
 * Display all navigation elements
 * 
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 */
Navigation.prototype.display = function(start, end, meta, style) {
  var self = this;
  self.overviewNavigation.display(start, end, meta, style);
  self.ratioZoom.display(self.overviewNavigation.selected, style);
  self.zoomNavigation.display(start, end, style);
};

/**
 * Refresh all navigation elements
 * 
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 */
Navigation.prototype.refresh = function(start, end, meta, style){
  var self = this;
  self.overviewNavigation.refresh(start, end, meta, style);
  self.ratioZoom.refresh(self.overviewNavigation.selected, style);
  self.zoomNavigation.refresh(start, end, style);
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
var OverviewNavigation = function(container, anchor, width, height){
  this.container = container;
  this.anchor = anchor;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.bgrules = undefined;
  this.ruler = undefined;
  this.selected = undefined;
  this.selectableArea = undefined;
};

/**
 * Display the overview of the seqid.
 * This method instanciates the canvas and draws in it.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 * @see OverviewNavigation.draw()
 */
OverviewNavigation.prototype.display = function(start, end, meta, style){
  var self = this;
  self.canvas = Raphael(self.anchor, self.width, self.height);
  self.bgrules = self.canvas.drawBgRules(10, style.bgrules);
  self.selectableArea = self.canvas.explorableArea(0, meta.length, style.selectionspan, function(start, end){
    fetchTracksData(start, end);
    self.container.refresh(start, end, meta, style);
  });
  self.draw(start, end, meta, style);
};

/**
 * Draw the overview of the seqid.
 * This method draws in the canvas previously instanciated.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 */
OverviewNavigation.prototype.draw = function(start, end, meta, style){
  var self = this;
  self.ruler = self.canvas.drawMainRuler(0, meta.length, style.ruler);
  self.selected = self.canvas.currentSpan(start, end, meta.length, style.selectedspan);
  self.selectableArea.toBack();
  self.selected.toBack();
  self.ruler.toBack();
  self.bgrules.toBack();
};

/**
 * Clear the element.
 * This only removes the potentially modified elements,
 * that is the ruler and the selected area.
 */
OverviewNavigation.prototype.clear = function(){
  var self = this;
  self.ruler.remove();
  self.selected.remove();
};

/**
 * Refresh the view.
 * This calls the clear() and draw() methods back-to-back
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} metadata
 * @param {Object} style
 * @see OverviewNavigation.clear()
 * @see OverviewNavigation.draw()
 */
OverviewNavigation.prototype.refresh = function(start, end, meta, style){
  var self = this;
  self.clear();
  self.draw(start, end, meta, style);
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
var ZoomNavigation = function(container, anchor, width, height){
  this.container = container;
  this.anchor = anchor;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.bgrules = undefined;
  this.ruler = undefined;
  this.selectableArea = undefined;
};

/**
 * Display the zoomed view of the seqid.
 * This method instanciates the canvas and draws in it.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} style
 * @see ZoomNavigation.draw()
 */
ZoomNavigation.prototype.display = function(start, end, style) {
  var self = this;
  self.canvas = Raphael(self.anchor, self.width, self.height);
  self.bgrules = self.canvas.drawBgRules(10, style.bgrules);
  self.selectableArea = self.canvas.explorableArea(start, end, style.selectionspan);
  self.selectableArea = self.canvas.explorableArea(start, end, style.selectionspan, function(start, end){
    fetchTracksData(start, end);
    self.container.refresh(start, end, meta, style);
  });
  self.draw(start, end, style);
};

/**
 * Draw the zoomed view of the seqid.
 * This method draws in the canvas previously instanciated.
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} style
 */
ZoomNavigation.prototype.draw = function(start, end, style){
  var self = this;
  self.ruler = self.canvas.drawMainRuler(start, end, style.ruler);
  self.selectableArea.toBack();
  self.ruler.toBack();
  self.bgrules.toBack();
};

/**
 * Clear the element.
 * This only removes the potentially modified elements,
 * that is the ruler.
 */
ZoomNavigation.prototype.clear = function(){
  var self = this;
  self.ruler.remove();
};

/**
 * Refresh the view.
 * This calls the clear() and draw() methods back-to-back
 *
 * @param {Number} start
 * @param {Number} end
 * @param {Object} style
 * @see ZoomNavigation.clear()
 * @see ZoomNavigation.draw()
 */
ZoomNavigation.prototype.refresh = function(start, end, style){
  var self = this;
  self.clear();
  self.draw(start, end, style);
}



/**
 * Ratio effect between the overview and the zoomed view
 * The containing navigation must be specified in order to bind events.
 *
 * @param {Function} container
 * @param {String} anchor
 * @param {Number} width
 * @param {Number} height
 */
var RatioZoom = function(container, anchor, width, height){
  this.container = container;
  this.anchor = anchor;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.bgrules = undefined;
  this.ratio = undefined;
};

/**
 * Display the ratio.
 * This method instanciates the canvas and draws in it.
 *
 * @param {Array} current_span
 * @param {Object} style
 * @see RatioZoom.draw()
 */
RatioZoom.prototype.display = function(cur_span, style){
  var self = this;
  self.canvas = Raphael(self.anchor, self.width, self.height);
  self.ratio = self.canvas.set();
  self.bgrules = self.canvas.drawBgRules(10, style.bgrules);
  self.draw(cur_span, style);
};

/**
 * Draw the ratio.
 * This method draws in the canvas previously instanciated.
 *
 * @param {Array} current_span
 * @param {Object} style
 */
RatioZoom.prototype.draw = function(cur_span, style){
  var self = this;
  self.ratio = self.canvas.drawRatio(cur_span, style);
  self.bgrules.toBack();
};

/**
 * Clear the element.
 * This only removes the potentially modified elements,
 * that is the ratio lines.
 */
RatioZoom.prototype.clear = function(){
  var self = this;
  self.ratio.remove();
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
RatioZoom.prototype.refresh = function(cur_span, style){
  var self = this;
  self.clear();
  self.draw(cur_span, style);
}
