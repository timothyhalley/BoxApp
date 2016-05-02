//
//	Documenation:
//
//
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/BoxApp';

var _l = require('./_log.js');

mongoose.connect(dbURI);
mongoose.connection.on('connected', function() {
    _l.logInfo('Mongoose connected to ' + dbURI);
});
var Schema = mongoose.Schema;
var fileSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    isFile: {
        type: Boolean
    },
    dev: {
        type: Number
    },
    ino: {
        type: Number
    },
    mode: {
        type: Number
    },
    nlink: {
        type: Number
    },
    uid: {
        type: Number
    },
    gid: {
        type: Number
    },
    rdev: {
        type: Number
    },
    size: {
        type: Number
    },
    blksize: {
        type: Number
    },
    blocks: {
        type: Number
    },
    atime: {
        type: Date
    },
    mtime: {
        type: Date
    },
    ctime: {
        type: Date
    },
    birthtime: {
        type: Date
    },
    recdate: {
        type: Date
    }

}, {
    collection: 'file-data'
});

var fileData = mongoose.model('fileData', fileSchema);

exports.dbSaveInfo = function(fsInfo) {
    var fdata = new fileData(fsInfo);
    fdata.save();
    _l.log("Send some nice info to mongoDB :");
};
