var stream = require('stream');
class LogStream extends stream.Writable {
    constructor(options) {
        super (options);
    }
    _write(chunk, encoding, next) {
        next();
    }
}
module.exports.logStream = new LogStream({decodeStrings: true});
module.exports.set = function() {};
module.exports.error = function() {};
