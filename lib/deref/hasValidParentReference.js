var __parent = require("./../internal/parent");
var __invalidated = require("./../internal/invalidated");
module.exports = function fromWhenceYeCame() {
    var reference = this._referenceContainer;

    // was invalid before even derefing.
    if (reference === false) {
        return false;
    }

    // Its been disconnected (set over or collected) from the graph.
    if (reference && reference[__parent] === undefined) {
        return false;
    }

    // The reference has expired but has not been collected from the graph.
    if (reference && reference[__invalidated]) {
        return false;
    }

    return true;
};
