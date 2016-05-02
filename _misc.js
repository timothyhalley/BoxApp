//
//	Documenation:
//		* Project helper functions
//	Arguments
//
//	Note: DO NOT USE GLOBALS HERE!
//			leverage provided API in framework
//			express: app.locals res.locals etc...
//			nodejs.org api globals: __dirname, etc...
//
//	Style guide: http://nodeguide.com/style.html
//
//	Look HERE FIRST --> Real world helper functions --> http://underscorejs.org/
//

//
//	formatSizeUnits = return nice string to ready bytes
//
exports.formatSizeUnits = function(bytes) {

	if (bytes >= 1000000000) {
		bytes = (bytes / 1000000000).toFixed(2) + ' GB';
	} else if (bytes >= 1000000) {
		bytes = (bytes / 1000000).toFixed(2) + ' MB';
	} else if (bytes >= 1000) {
		bytes = (bytes / 1000).toFixed(2) + ' KB';
	} else if (bytes > 1) {
		bytes = bytes + ' bytes';
	} else if (bytes == 1) {
		bytes = bytes + ' byte';
	} else {
		bytes = '0 byte';
	}
	return bytes;

}