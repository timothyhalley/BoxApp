//
// - Concur Architecture Team: Move files to box via NODE project
//
// Box authentication based on --> https://github.com/bluedge/passport-box/tree/master/examples/login)
//
var express = require('express'),
    passport = require('passport'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    multer = require('multer');
var cookieParser = require('cookie-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),
    BoxStrategy = require('passport-box').Strategy,
    box_sdk = require('box-sdk');

var box = box_sdk.Box();

var BOX_CLIENT_ID = "ikjvh6ba6sku3d6oaf908f92lng5posn";
var BOX_CLIENT_SECRET = "mzMx2HWLOnxnR0XTEA8YqMA4yeXz0R1h";

var _w = require('./_walk.js');
var _m = require('./_misc.js');
var _l = require('./_log.js');


var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/BoxApp';
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

//var ejs = require('./libs/ejs.js')

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Box profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the BoxStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and 37signals
//   profile), and invoke a callback with a user object.
passport.use(new BoxStrategy({
    clientID: BOX_CLIENT_ID,
    clientSecret: BOX_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/box/callback"
        //callbackURL: "https://www.box.com/api/oauth2/authorize"
}, box.authenticate()));

// Express Framework!
var app = express();
var router = express.Router();
var upload = multer(); // for parsing multipart/form-data

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan());
app.use(cookieParser());
app.use(bodyParser());
//app.use(bodyParser.urlencoded({extended:true}));
//app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
    secret: 'legal beagle'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(router);
app.use(express.static(__dirname + '/public'));
app.use('/favicon.ico', express.static(__dirname + '/images/favicon.ico'));

// Startup Globals Definitions
app.locals.inputDir = __dirname + '/data';
app.locals.title = "BoxApp";

//
// Routes --
app.get('/', function(req, res) {
    var opts = {
        user: req.user
    };
    if (req.user) {
        var connection = box.getConnection(req.user.login);
        connection.ready(function() {
            connection.getFolderItems(0, null, function(err, result) {
                if (err) {
                    opts.body = err;
                } else {
                    opts.body = result;
                }
                res.render('index', opts);
            });
        });
    } else {
        res.render('index', opts);
    }
});

app.get('/account', ensureAuthenticated, function(req, res) {
    res.render('account', {
        user: req.user
    });
});

app.get('/login', function(req, res) {
    res.render('login', {
        user: req.user
    });
});

// GET /auth/Box
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Box authentication will involve
//   redirecting the user to Box.com.  After authorization, Box
//   will redirect the user back to this application at /auth/box/callback
app.get('/auth/box',
    passport.authenticate('box'),
    function(req, res) {
        // The request will be redirected to Box for authentication, so this
        // function will not be called.
    });

// GET /auth/box/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/box/callback',
    passport.authenticate('box', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//
//  ****************************************************************************
// about page
app.get('/about', function(req, res) {
    res.render('about');
});

//
//  ****************************************************************************
// Setup page
app.get('/setup', function(req, res) {
    res.render('setup', {
        ejs_title: app.locals.title,
        ejs_currentDir: app.locals.inputDir,
        ejs_inputDir: "./",
        ejs_boxLocation: app.locals.boxLocation
    });
});

app.post('/setup', function(req, res, next) {
    // req.body object has your form values
    _l.log("Directory = " + req.body.req_inputDir);
    _l.log("JSON stringify = " + JSON.stringify(req.body));
    app.locals.inputDir = req.body.req_inputDir;
    app.locals.boxLocation = req.body.req_boxLocation;
    res.redirect('/setup');
});

//
//  ****************************************************************************
// Start Route proecessing
app.get('/start', function(req, res) {

    var list = [];
    var i = 0;
    var sobj;
    var rdir;

    //var dirs = _w.getDirs(app.locals.inputDir);
    _w.sndDirs(app.locals.inputDir, function(dirs) {

        if (dirs !== "FINISHED!") {

            sobj = JSON.parse(dirs);
            sobj['name'] = sobj['name'].substr(sobj['name'].search(app.locals.inputDir.split("/").pop()), sobj['name'].length)
            list.push(sobj['name']);

            //write this to mongodb
            var fdata = new fileData(sobj);
            fdata.save();

            //write this item to box
            var opts = {
                user: req.user
            };
            var fields = {
              name: "LEGAL_TEST",
              description: "@Concur @Tim Halley @Architecture Team"
            };

            if (req.user) {
                var connection = box.getConnection(req.user.login);
                connection.ready(function() {
                    // id = 0 (root) or file number 7670081530
                    //connection.getFolderInfo(7670081530, function(err, result) {
                    // ****
                    //createFolder: function (name, parent_id, done, config) {
                    // ****
                    //connection.createFolder("BOXAPI_TEST", 0, function(err, result) {
                    // ****
                    // Update folder information
                    // {"type":"folder","id":"7670081530","sequence_id":"0","etag":"0","name":"LEGAL_TEST"}
                    //updateFolder: function (id, fields, done, headers, config) {
                    //connection.updateFolder(7670081530, fields, function(err, result) {
                    connection.uploadFile(file_name, parent_id, opts, function(err, result) {
                        if (err) {
                            opts.body = err;
                        } else {
                            opts.body = result;
                        }
                    });
                });
            } else {
                l.logDebug("You are not logged in!!!");
            }


        } else {

            res.render('start', {
                ejs_Title: app.locals.title,
                ejs_CurPath: app.locals.inputDir,
                ejs_TotalFiles: list.length,
                ejs_Files: list

            });
        }
    })
});

app.get('/get-data', function(req, res, next) {
    fileData.find()
        .then(function(doc) {
            res.render('get-data', {
                ejs_items: doc
            });
        });
});

app.post('/get-data', function(req, res, next) {

    var fileinfo = {
        name: "this is a new file",
        date: date,
        time: time
    };

    //var data = new
    app.locals.inputDir = req.body.req_inputDir;
    res.redirect('/get-data');

});

app.get('/boxapi', function(req, res) {
    var opts = {
        user: req.user
    };
    var fields = {
      name: "LEGAL_TEST",
      description: "@Concur @Tim Halley @Architecture Team"
    };
    //var fields
    //var parent_id = 7670081530;
    //var file_name = "./package_json";

    if (req.user) {
        var connection = box.getConnection(req.user.login);
        connection.ready(function() {
            // id = 0 (root) or file number 7670081530
            //connection.getFolderInfo(7670081530, function(err, result) {
            // ****
            //createFolder: function (name, parent_id, done, config) {
            // ****
            //connection.createFolder("BOXAPI_TEST", 0, function(err, result) {
            // ****
            // Update folder information
            // {"type":"folder","id":"7670081530","sequence_id":"0","etag":"0","name":"LEGAL_TEST"}
            //updateFolder: function (id, fields, done, headers, config) {
            connection.updateFolder(7670081530, fields, function(err, result) {
            //connection.uploadFile(file_name, parent_id, opts, function(err, result) {
                if (err) {
                    opts.body = err;
                } else {
                    opts.body = result;
                }
                res.render('boxapi', opts);
            });
        });
    } else {
        res.render('boxapi', opts);
    }
});

app.post('/boxapi', function(req, res, next) {

    var fileinfo = {
        name: "this is a new file",
        date: date,
        time: time
    };

    //var data = new

    app.locals.inputDir = req.body.req_inputDir;
    res.redirect('/get-data');

});

app.post('/start', function(req, res, next) {
    // req.body object has your form values
    _l.log("Directory = " + req.body.req_inputDir);
    _l.log("JSON stringify = " + JSON.stringify(req.body));
    app.locals.inputDir = req.body.req_inputDir;
    res.redirect('/start');
});

// Count Files
// http://blog.shinetech.com/2011/08/26/asynchronous-code-design-with-node-js/
app.get('/status', function(req, res) {

    fileData.find()
        .then(function(docs) {

            res.render('status', {

                ejs_Title: app.locals.title,
                ejs_CurPath: app.locals.inputDir,
                ejs_TotalFiles: docs.length,
                ejs_Files: docs

            });
        });
});

//
//  ****************************************************************************
// DEBUG THIS! page
var clubs = [{
    clubname: 'Manchester United',
    type: 3
}, {
    clubname: 'Colorado Rapids',
    type: 5
}, {
    clubname: 'Seattle Sounders FC',
    type: 10
}, {
    clubname: 'Denver Broncos',
    type: 20
}];

app.get('/debug', function(req, res) {
    res.render('debug', {
        ejs_Title: app.locals.title,
        ejs_clubs: clubs
    });
    _l.logInfo('Values sent to Debug Page: ', app.locals.title);
});

app.post('/debug', function(req, res, next) {
    // req.body object has your form values
    console.log("DEBUG: Club Name = " + req.body.clubname);
    console.log("DEBUG: Club Type = " + req.body.clubtype);
    console.log("DEGUG: JSON stringify = " + JSON.stringify(req.body));
    console.log("DEBUG: base URL = " + req.originalUrl);

    console.log("DEBUG: cookies = " + req.cookies.name);
    console.log("DEBUG: hostname = " + req.hostname);
    console.log("DEBUG: IP = " + req.ip);
    console.log("DEBUG: One value = " + req.body.clubname[0]);
    app.locals.title = req.body.clubname[0];

    console.log("DEBUG: App Local = " + app.locals.title);
});

app.listen(3000);


//******************* SAVE

//
//  ****************************************************************************
// Start Directory proecessing
// app.get('/start', function(req, res) {

//     //var dirs = [];

//     var dirs = _w.getDirs(app.locals.inputDir);

//     //_l.log("In START --> " + dirs.length + "\nHere are the DIRS from WALK --> " + dirs + "\n\n\n");
//     //debugger
//     if (dirs.length == 0) {
//         dirs = ['pending async'];
//     }

//     res.render('start', {

//         ejs_Title: app.locals.title,
//         ejs_CurPath: app.locals.inputDir,
//         ejs_TotalFiles: dirs.length,
//         ejs_Files: dirs,
//         ejs_Test: dirs

//     });
// });

// app.post('/start', function(req, res, next) {
//     // req.body object has your form values
//     console.log("DEBUG: Directory = " + req.body.req_inputDir);
//     console.log("DEGUG: JSON stringify = " + JSON.stringify(req.body));
//     app.locals.inputDir = req.body.req_inputDir;
//     res.redirect('/start');
// });
