var mdb = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/BoxApp';

var _l = require('../_log.js');

mdb.connect(dbURI);

// CONNECTION EVENTS
mdb.connection.on('connected', function() {
    _l.logInfo('Mongoose connected to ' + dbURI);
});
mdb.connection.on('error', function(err) {
    _l.logInfo('Mongoose connection error: ' + err);
});
mdb.connection.on('disconnected', function() {
    _l.logInfo('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    mdb.connection.close(function() {
        _l.logInfo('Mongoose disconnected through ' + msg);
        callback();
    });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});
// For Heroku app termination
// process.on('SIGTERM', function() {
//     gracefulShutdown('Heroku app termination', function() {
//         process.exit(0);
//     });
// });