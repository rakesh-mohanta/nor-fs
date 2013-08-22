/* Generic Node.js Database Library */
"use strict";

var FS = require('fs');
var Q = require('q');
var extend = require('extend');
var bindings = require('./qfs.js');
var FileDescriptor = require('./FileDescriptor.js');

/** FileSystem module constructor */
function FileSystem() {
}

/* Setup methods */

/* These are fs functions which do not return anything and therefore should return instance of FileSystem instead */
['rename', 'ftruncate', 'truncate', 'chown', 'fchown', 'lchown',
 'chmod', 'fchmod', 'lchmod', 'link', 'symlink', 'unlink', 'rmdir', 
 'mkdir', 'close', 'utimes', 'fsync', 'futimes', 'writeFile', 'appendFile'].forEach(function(key) {
	if(bindings[key] === undefined) {
		console.warn('Warning! bindings.' + key + ' is missing! Skipped it.');
		return;
	}
	FileSystem.prototype[key] = function() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var p = bindings[key].apply(bindings, args);
		p.then(function() {
			return self;
		});
		return extend.promise( [FileSystem, FileDescriptor], p);
	};
});

/* These are functions when successful will return single object and therefore should return it */
['stat', 'lstat', 'fstat', 'readlink', 'realpath', 'readdir', 'readFile', 'exists'].forEach(function(key) {
	if(bindings[key] === undefined) {
		console.warn('Warning! bindings.' + key + ' is missing! Skipped it.');
		return;
	}
	FileSystem.prototype[key] = function() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var p = bindings[key].apply(bindings, args);
		return extend.promise( [FileSystem, FileDescriptor], p);
	};
});

/* These are functions when successful will return single FD and therefore should return instance of FileDescriptor */
['open'].forEach(function(key) {
	if(bindings[key] === undefined) {
		console.warn('Warning! bindings.' + key + ' is missing! Skipped it.');
		return;
	}
	FileSystem.prototype[key] = function() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var p = bindings[key].apply(bindings, args);
		p.then(function(fd) {
			return new FileDescriptor(fd);
		});
		return extend.promise( FileDescriptor, p);
	};
});

// Exports
module.exports = FileSystem;

/* EOF */