//
// - Concur Architecture Team: Move files to box via NODE project
var express = require('express'),
    passport = require('passport'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    methodOverride = require('method-override');

// Node Modules Utils
var fs = require('fs');


// Project Modules
var _w = require('./_walk.js');
var _m = require('./_misc.js');
var _l = require('./_log.js');
var _b = require('./_boxapi.js');
var _d = require('./_dbapi.js');

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
    var boxFolderID = 0; //Root level
    var opts = {
        user: req.user,
        body: "BOX.COM -->"
    };
    if (req.user) {
        _b.getFolderItems(req.user.login, boxFolderID, function(err, result) {
            if (err) {
                opts.body = err;
            } else {
                opts.body = result;
            }
            res.render('index', opts);
        });

    } else {
        _l.logWarn("You are not logged in...");
        res.render('index', opts);
    };
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
app.get('/setup', ensureAuthenticated, function(req, res) {
    res.render('setup', {
        ejs_title: app.locals.title,
        ejs_currentDir: app.locals.inputDir,
        ejs_inputDir: app.locals.inputDir,
        ejs_boxLocation: app.locals.boxLocation,
        ejs_searchItems: null
    });
});

app.post('/setup', function(req, res, next) {
    // req.body object has your form values
    _l.log("Directory = " + req.body.req_inputDir);
    _l.log("JSON stringify = " + JSON.stringify(req.body));
    app.locals.inputDir = req.body.req_inputDir;
    app.locals.boxLocation = req.body.req_boxLocation;

    // check if Directory path is valid
    fs.stat(app.locals.inputDir, (err, stat) => {
        if (err) {
            _l.logWarn("Input Dir is invalid!");
        } else {
            _.logWarn("Is this a directory --> " + stat.isDirectory());
        }

    });

    // Check box folder and return ID
    var opts = {
        type: "folder"
    };
    if (req.user) {
        _b.searchBox(req.user.login, app.locals.boxLocation, opts, function(err, result) {
            if (err) {
                opts.body = err;
                _l.logErr("Error of search is ... - ", err);
            } else {
                opts.body = result;
                _l.logInfo("Results of search is ... - " + result);
            }
            res.render('setup', {
                ejs_title: app.locals.title,
                ejs_currentDir: app.locals.inputDir,
                ejs_inputDir: app.locals.inputDir,
                ejs_boxLocation: app.locals.boxLocation,
                ejs_searchItems: opts.body
            });
        });
    } else {
        res.redirect('/login');
    }
});

//
//  ****************************************************************************
// Start Route
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
            _d.dbSaveInfo(sobj);
            // var fdata = new fileData(sobj);
            // fdata.save();

            //write this to BOX.com
            if (sobj['isFile']) {
                _b.writeFile("This should be a file... " + sobj['name']);
            } else {
                _b.writeDir("This should be a directory... " + sobj['name']);
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
    file_Data.find()
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
