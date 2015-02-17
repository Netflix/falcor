var through = require("through2").obj;
module.exports = function(opts) {
    var prefix = new Buffer(opts.prefix + "\n" || "");
    var postfix = new Buffer("\n" + opts.postfix || "");
    return through(function(file, enc, cb) {
        if (file.isNull()) {
            return cb();
        }
        if (file.isBuffer()) {
            file.contents = Buffer.concat([prefix, file.contents, postfix]);
        }
        if (file.isStream()) {
            file.contents = [prefix, file.contents.toString(), postfix].join("");
        }
        this.push(file);
        return cb();
    });
};