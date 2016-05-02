var mdb = require('mongoose');
// BRING IN YOUR SCHEMAS & MODELS
var fileSchema = new mdb.Schema({

    name:   {type: String, required: true},
    dev:    {type: Number},
    ino:    {type: Number},
    mode:   {type: Number},
    nlink:  {type: Number},
    uid:    {type: Number},
    gid:    {type: Number},
    rdev:   {type: Number},
    size:   {type: Number},
    blksize: {type: Number},
    blocks: {type: Number},
    atime:  {type: Date},
    mtime:  {type: Date},
    ctime:  {type: Date},
    birthtime: {type: Date},
    recdate: {type: Date}

});

var dbfile = mdb.model('dbfile', fileSchema);
module.exports = dbfile;