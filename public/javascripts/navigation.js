var Navigation = function(){
  this.overviewNavigation = new OverviewNavigation(this, "overviewnavigation", 1101, 50);
  this.ratioZoom = new RatioZoom(this, "ratiozoom", 1101, 50);
  this.zoomNavigation = new ZoomNavigation(this, "zoomnavigation", 1101, 50);
};

Navigation.prototype.display = function(start, end, meta, style) {
  var self = this;
  self.overviewNavigation.display(start, end, meta, style);
  self.ratioZoom.display(self.overviewNavigation.selected, style);
  self.zoomNavigation.display(start, end, style);
};

Navigation.prototype.refresh = function(start, end, meta, style){
  var self = this;
  self.overviewNavigation.refresh(start, end, meta, style);
  self.ratioZoom.refresh(self.overviewNavigation.selected, style);
  self.zoomNavigation.refresh(start, end, style);
};


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

OverviewNavigation.prototype.draw = function(start, end, meta, style){
  var self = this;
  self.ruler = self.canvas.drawMainRuler(0, meta.length, style.ruler);
  self.selected = self.canvas.currentSpan(start, end, meta.length, style.selectedspan);
  self.selectableArea.toBack();
  self.selected.toBack();
  self.ruler.toBack();
  self.bgrules.toBack();
};

OverviewNavigation.prototype.clear = function(){
  var self = this;
  self.ruler.remove();
  self.selected.remove();
};

OverviewNavigation.prototype.refresh = function(start, end, meta, style){
  var self = this;
  self.clear();
  self.draw(start, end, meta, style);
};


var RatioZoom = function(container, anchor, width, height){
  this.container = container;
  this.anchor = anchor;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.bgrules = undefined;
  this.ratio = undefined;
};

RatioZoom.prototype.display = function(cur_span, style){
  var self = this;
  self.canvas = Raphael(self.anchor, self.width, self.height);
  self.ratio = self.canvas.set();
  self.bgrules = self.canvas.drawBgRules(10, style.bgrules);
  self.draw(cur_span, style);
};

RatioZoom.prototype.draw = function(cur_span, style){
  var self = this;
  self.ratio = self.canvas.drawRatio(cur_span, style);
  self.bgrules.toBack();
};

RatioZoom.prototype.clear = function(){
  var self = this;
  self.ratio.remove();
};

RatioZoom.prototype.refresh = function(cur_span, style){
  var self = this;
  self.clear();
  self.draw(cur_span, style);
}


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

ZoomNavigation.prototype.draw = function(start, end, style){
  var self = this;
  self.ruler = self.canvas.drawMainRuler(start, end, style.ruler);
  self.selectableArea.toBack();
  self.ruler.toBack();
  self.bgrules.toBack();
};

ZoomNavigation.prototype.clear = function(){
  var self = this;
  self.ruler.remove();
};

ZoomNavigation.prototype.refresh = function(start, end, style){
  var self = this;
  self.clear();
  self.draw(start, end, style);
}

