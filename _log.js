//
//	Documenation:
//
//		* https://www.npmjs.com/package/better-console
//
//		* console.log, console.warn, console.error, console.info, console.debug, console.dir, console.trace
//
//		* add require("./_log.js") to modules
//
//		Note: https://nodejs.org/docs/latest/api/punycode.html for conversions...
//			http://apps.timwhitlock.info/emoji/tables/unicode
//			https://www.punycoder.com/
//
//
var log = require('better-console');
var pc = require('punycode');

//
//	emoji adds
//
var EYES = pc.toUnicode('xn--lp8h');
var BUGS = pc.toUnicode('xn--jo8h');
var UHNO = pc.toUnicode('xn--738h')
var HOURGLASS = pc.toUnicode('xn--koh');
var MICROSCOPE = pc.toUnicode('xn--cw8h');
var BOMB = pc.toUnicode('xn--fs8h');

exports.log = function(msg) {
	if (msg.isArray) {
		msg = msg.toString();
	}
 	log.log(EYES + " " + msg);
};
exports.logWarn = function(msg) {
    log.warn(BOMB + " " + msg);
};
exports.logErr = function(msg) {
    log.error(UHNO + " " + msg);
};
exports.logClr = function() {
    log.clear();
};
exports.logInfo = function(msg) {
    log.info(msg);
};
exports.logDebug = function(msg) {
    log.debug(MICROSCOPE + " " + msg);
};
exports.logTime = function(timer) {
    log.time(timer);
};
exports.logTimeEnd = function(timer) {
    log.timeEnd(timer);
};
exports.logDir = function(myobj) {
    log.dir(myobj);
};

//	Documenation:
//		* https://www.npmjs.com/package/single-line-log
//	SLL --> Methods:
//		* .clear() --> Clears the log (i.e., writes a newline).
//		* .stdout --> Outputs to process.stdout.
//		* .stderr --> Outputs to process.stderr.
//
//var log = require('single-line-log').stdout;

//SSL --> Module export
// exports.logstd = function(msg) {
// 	log(msg);
// };
// exports.logerr = function(msg) {
// 	log(msg);
// };
// exports.logmsg = function(msg) {
// 	console.log(msg);
// };
// exports.logclr = function() {
// 	log.clear();
// };
