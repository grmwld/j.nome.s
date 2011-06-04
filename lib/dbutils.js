var mongoose = require('mongoose');

var connectdb = function(req, res, next){
  req.currentdb = mongoose.connect(
    'mongodb://localhost/' + req.params.dataset
  ).connections;
  req.currentdb = req.currentdb[req.currentdb.length-1]['db']
  next();
}

exports.connectdb = connectdb;
