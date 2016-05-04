//
//	Documenation:
//
//
var passport = require('passport'),
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

//Node Modules
var _ = require('lodash');

// Project Modules
var _l = require('./_log.js');

// ------------------- Passport authentication   --------------------
//
// Box authentication based on -->
//		https://github.com/bluedge/passport-box/tree/master/examples/login)
//
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


// ------------------- File and Folder Functions --------------------
exports.searchBox = function(userID, svals, opts, next) {

  /**
   * Provides a simple way of finding items that are accessible in a given user’s Box account.
   * @summary Search a user's account.
   * @see {@link https://developers.box.com/docs/#search}
   * @param {string} query - The search keyword.
   * @param {?OptsSearch} opts - Additional search options.
   * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
   * @param {?RequestConfig} [config] - Configure the request behaviour.
   */
  //search: function (query, opts, done, config) {

  // _(search).forEach(function(val){
  //   _l.logInfo("Search item --> " + val);
  // });
  //sfld = "folder";
  var connection = box.getConnection(userID);

  connection.ready(function() {
      var sparam = "query=" + svals;
      _l.logWarn("Here is the search token --> " + sparam);
      connection.search(sparam, opts, function(err, result) {
          if (err) {
              next(err);
          } else {
              next(result);
          }
      });
  });
}

exports.getFolderItems = function(userID, boxFolderID, next) {

    /**
     * Retrieves the full metadata about a folder,
     * including information about when it was last updated as well as the files and folders
     * contained in it. The root folder of a Box account is always represented by the id “0″.
     * @summary Get Information About a Folder.
     * @see {@link https://developers.box.com/docs/#folders-get-information-about-a-folder}
     * @param {number} id - The folder's ID.
     * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
     * @param {?RequestHeaders} [headers] - Additional headers.
     * @param {?RequestConfig} [config] - Configure the request behaviour.
     */
    // getFolderInfo: function(id, done, headers, config) {
    //     if (!_.isNumber(parseInt(id, 10))) {
    //         return done(new Error('id must be specified.'));
    //     }
    //     this._request(['folders', id], 'GET', done, null, null, null, headers, null, config);
    // },
    var boxFolderList = [];
    var connection = box.getConnection(userID);

    connection.ready(function() {
        connection.getFolderInfo(boxFolderID = 0, function(err, result) {
            if (err) {
                next(err);
            } else {
                next(result);
            }
        });
    });
}


exports.writeFile = function(msg) {
    _l.log(msg);
};

exports.createFolder = function(boxFolderName, boxParentID) {

	/**
	 * Used to create a new empty folder. The new folder will be created inside of the
	 * specified parent folder.
	 * @summary Create a New Folder.
	 * @see {@link https://developers.box.com/docs/#folders-create-a-new-folder}
	 * @param {string} name - The folder's name.
	 * @param {number} parent_id - The parent folder's ID.
	 * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
	 * @param {?RequestConfig} [config] - Configure the request behaviour.
	 */
	//createFolder: function (name, parent_id, done, config) {

		var connection = box.getConnection(userID);

    connection.ready(function() {
        connection.createFolder(boxFolderName, boxParentID, function(err, result) {
            if (err) {
                boxFolderList = err;
            } else {
                boxFolderList = result;
            }
        });
    });
};

//write this item to box
// var opts = {
// 		user: req.user
// };
// var fields = {
// 	name: "LEGAL_TEST",
// 	description: "@Concur @Tim Halley @Architecture Team"
// };

// if (req.user) {
// 		var connection = box.getConnection(req.user.login);
// 		connection.ready(function() {
// 				// id = 0 (root) or file number 7670081530
// 				//connection.getFolderInfo(7670081530, function(err, result) {
// 				// ****
// 				//createFolder: function (name, parent_id, done, config) {
// 				// ****
// 				//connection.createFolder("BOXAPI_TEST", 0, function(err, result) {
// 				// ****
// 				// Update folder information
// 				// {"type":"folder","id":"7670081530","sequence_id":"0","etag":"0","name":"LEGAL_TEST"}
// 				//updateFolder: function (id, fields, done, headers, config) {
// 				//connection.updateFolder(7670081530, fields, function(err, result) {
// 				connection.uploadFile(file_name, parent_id, opts, function(err, result) {
// 						if (err) {
// 								opts.body = err;
// 						} else {
// 								opts.body = result;
// 						}
// 				});
// 		});
// } else {
// 		l.logDebug("You are not logged in!!!");
// }
