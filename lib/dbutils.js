var mongoose = require('mongoose');


/**
 * Connects to a database with mongoose
 *
 * @param {String} dbname
 * @api private
 */
var connectdb = function(dbname){
  mongoose.connect('mongodb://localhost/' + dbname);
}

/**
 * Change the database to which the application is connected
 *
 * @param {String} database name
 * @api private
 */
var changedb = function(dbname){
  mongoose.connection.db.databaseName = dbname;
}

/**
 * Updates the session stored dataset name
 *
 * @param {Object} request
 * @api private
 */
var updateSessionDataset = function(req){
  req.session.dataset = mongoose.connection.db.databaseName;
}

/**
 * Middleware used to connect to a specific database
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Function} callback
 * @api public
 */
var connect = function(req, res, next){
  var dbname = req.params.dataset;
  if (req.session.dataset != dbname){
    if (!req.session.dataset){
      connectdb(dbname);
      updateSessionDataset(req);
    }
    else {
      changedb(dbname);
      updateSessionDataset(req);
    }
  }
  next();
}

exports.connect = connect;
