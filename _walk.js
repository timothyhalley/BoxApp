//
//	Documenation:
//		* https://www.npmjs.com/package/walkdir
//		* Install --> npm install walkdir
//	Arguments
//		* walkdir(path, [options], [callback]);
//		* walkdir.sync(path, [options], [callback]);
//
//	http://expressjs.com/en/advanced/developing-template-engines.html
//	http://paularmstrong.github.io/node-templates/
//	http://ejs.co/
//

var w = require('walkdir');
var p = require('path');
var l = require('./_log.js');

// Note: WALKDIR --> options
var options = {
	"follow_symlinks": false, // default is off  
	"no_recurse": false, // only recurse one level deep 
	"max_depth": undefined // only recurse down to max_depth. if you need more than no_recurse 
};

//
// Local Module helper functions
// Note: use _MISC.js for broader usecases
//
function prn(fname, stat) {
	l.log('\n\n\nhello: ', fname, " ", stat["size"]);
}

//async with path callback 
exports.getDirs = function(dir) {

	var d = [];
	var i = 0;

	w(dir, function(dirs, stat) {

		// if (p.basename(path) === '.DS_Store') {
		// 	console.log('ignore: ', path, " ", stat.isFile());
		// } else {
		// 	console.log('found: ', path, " ", stat.isFile());
		// }

		//l.logInfo("# of directories found " + i);
		d.push(dirs);
		i = ++i;

	});

	return d;

};

exports.sndDirs = function(dir, next) {

	var q = w(dir);
	var i = 0;
	var sobj = [];

	var pobj;
	var bdir;
	var nobj;
	var sdir;

	q.on('directory', function(dirPath, stat) {

		i = ++i;
		l.logDebug(i + " " + dirPath + " [" + stat["size"] + "] is a dir: " + stat.isDirectory());
		//debugger
		//get root filename and filepath
		pobj = p.parse(dirPath);
		//nobj = pobj.dir.match(bdir);
		//sdir = dirPath.slice(nobj.)

		// Add file to JSON obj
		sobj = JSON.parse(JSON.stringify(stat));
		sobj.name = dirPath;
		sobj.isFile = stat.isFile();
		next(JSON.stringify(sobj));

	});

	q.on('end', function(dirPath, stat) {
		this.end();
		l.logInfo("Finished... Number of directories = " + i);
		next("FINISHED!");
	});

};

exports.getFiles = function(dir) {

	var q = w(dir);
	var r = new RegExp(".*\.pdf");
	var i = 0;
	var s = 0;

	q.on('path', function(filename, stat) {
		i = ++i;
		l.log("running... " + stat["size"]);
		//console.log("object count: ", i);
	});

	q.on('file', function(filename, stat) {
		if (r.test(p.basename(filename))) {
			s = ++stat["size"];
		};
	});

	q.on('end', function(filename, stat) {
		this.end();
		l.logInfo("Finished... ");
		l.logInfo("\nNumber of objects = " + i + "\nTotal byte count = " + formatSizeUnits(s));
	});

	return q;
};