var dir = require('node-dir');

exports.getFiles = function(curDir) {
    return new Promise(function(resolve, reject) {
        dir.paths(dir, function(err, paths) {
            if (err) throw err;
            return paths.files;
        });
    })
}

exports.getFiles = function(curDir) {
    return new Promise(function(resolve, reject) {
        dir.paths(dir, function(err, paths) {
            if (err) throw err;
            return paths.dirs;
        });
    })
}