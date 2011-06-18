var Navigation = function(){
  this.overviewnavigation = new OverviewNavigation("overviewnavigation", 1101, 50);
};

Navigation.prototype.draw = function(start, end, style) {
  this.overviewNavigation = Raphael("overviewnavigation", 1101, 50);
  this.ratiozoom = Raphael("ratiozoom", 1101, 50);
  this.zoomNavigation = Raphael("zoomnavigation", 1101, 50);
  this.separator = Raphael("separator", 1101, 10);
  this.currentSpan = null;
  this.overviewNavigation.drawBgRules(10, style.bgrules);
  overviewNavigation.drawMainRuler(0, seqidMD.length, style.ruler);
  currentSpan = overviewNavigation.currentSpan(start, end, seqidMD.length, style.selectedspan);
  overviewNavigation.explorableArea(0, seqidMD.length, style.selectionspan);
  ratiozoom.drawBgRules(10, style.bgrules);
  ratiozoom.drawRatio(currentSpan);
  zoomNavigation.drawBgRules(10, style.bgrules);
  zoomNavigation.drawMainRuler(start, end, style.ruler);
  zoomNavigation.explorableArea(start, end, style.selectionspan);
  separator.drawBgRules(10, style.bgrules);
};


var OverviewNavigation = function(anchor, width, height){
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
  this.canvas = Raphael(this.anchor, this.width, this.height);
  this.bgrules = this.canvas.drawBgRules(10, style.bgrules);
  this.selectableArea = this.canvas.explorableArea(0, meta.length, style.selectionspan);
  this.draw(start, end, meta, style);
};

OverviewNavigation.prototype.draw = function(start, end, meta, style){
  this.ruler = this.canvas.drawMainRuler(0, meta.length, style.ruler);
  this.selected = this.canvas.currentSpan(start, end, meta.length, style.selectedspan);
  this.selectableArea.toBack();
  this.selected.toBack();
  this.ruler.toBack();
  this.bgrules.toBack();
};

OverviewNavigation.prototype.clear = function(){
  this.ruler.remove();
  this.selected.remove();
};

OverviewNavigation.prototype.refresh = function(start, end, meta, style){
  this.clear();
  this.draw(start, end, meta, style);
};


var RatioZoom = function(anchor, width, height){
  this.anchor = anchor;
  this.width = width;
  this.height = height;
  this.canvas = undefined;
  this.bgrules = undefined;
  this.ratio = undefined;
};

RatioZoom.prototype.display = function(cur_span, style){
  this.canvas = Raphael(this.anchor, this.width, this.height);
  this.ratio = this.canvas.set();
  this.bgrules = this.canvas.drawBgRules(10, style.bgrules);
  this.draw(cur_span, style);
};

RatioZoom.prototype.draw = function(cur_span, style){
  this.ratio = this.canvas.drawRatio(cur_span, style);
  //var sx1 = cur_span.attrs.x
    //, sy1 = 0
    //, sx2 = 50
    //, sy2 = this.height
    //, ex1 = cur_span.attrs.x + cur_span.attrs.width
    //, ey1 = 0
    //, ex2 = this.width - 50
    //, ey2 = this.height;
  //this.ratio.push(this.canvas.lineTo(sx1, sy1, sx2, sy2).attr(style));
  //this.ratio.push(this.canvas.lineTo(ex1, ey1, ex2, ey2).attr(style));
};

RatioZoom.prototype.clear = function(){
  this.ratio.remove();
};

RatioZoom.prototype.refresh = function(cur_span, style){
  this.clear();
  this.draw(cur_span, style);
}
