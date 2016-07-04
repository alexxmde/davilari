var mongoose = require('mongoose');

var url = 'mongodb://localhost:27017/davilari';

function Connection () {
  this.connect = function (cb) {
    mongoose.connect(url);

    mongoose.set('debug', true);

    var conn = mongoose.connection;

    conn.once('open', function () {
      cb(null, mongoose);
    });

    conn.on('error', function (err) {
      cb(err);
    });
    
  };

  this.mongoose = mongoose;
}

module.exports = new Connection();