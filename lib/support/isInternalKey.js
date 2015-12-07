var __parent = require("./../internal/parent");
var __key = require("./../internal/key");
var __version = require("./../internal/version");
var __prev = require("./../internal/prev");
var __next = require("./../internal/next");

/**
 * If the key passed in is an internal key.  We will use a simple checking to
 * prevent infinite recursion on some machines.
 *
 * @param {String} x -
 * @private
 * @returns {Boolean}
 */
module.exports = function isInternalKey(x) {
    return x === __parent ||
        x === __key ||
        x === __version ||
        x === __prev ||
        x === __next ||
        x === "$size";
};
