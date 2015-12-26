var prefix = require("./../internal").prefix;
var $modelCreated = require("./../internal").modelCreated;

/**
 * Determines if the key passed in is an internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */
module.exports = function isInternalKey(x) {
    return x === "$size" || x === $modelCreated || (x && x.charAt(0) === prefix);
};
