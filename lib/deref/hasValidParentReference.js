var __parent = require("./../internal/parent");
var __invalidated = require("./../internal/invalidated");
module.exports = function isValidDeref() {
    var reference = this._fromReference;
    if (reference && (reference[__parent] === undefined ||
                      reference[__invalidated])) {
        return false;
    }

    return true;
};
