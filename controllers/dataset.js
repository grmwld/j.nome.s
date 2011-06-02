var mongoose = require('mongoose');


function connectToDataset(req, res, next){
  req.currentDataset = mongoose.createConnection(
    'localhost'
  , req.params.dataset
  );
  next();
}

var show = function(req, res){
  connectToDataset(req, res, function(){
    console.log(req.currentDataset);
    res.send('show dataset ' + req.currentDataset.name);
  });
};

exports.show = show;
