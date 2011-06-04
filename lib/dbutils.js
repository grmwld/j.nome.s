var mongoose = require('mongoose');

var connectdb = function(req, res, next){
  console.log(req.params.dataset);
  console.log(req.session.dataset);
  if (req.params.dataset != req.session.dataset){
    mongoose.disconnect();
    mongoose.connect('mongodb://localhost/' + req.params.dataset);
    req.session.dataset = mongoose.connection.name;
  }
  next();
}

exports.connectdb = connectdb;
