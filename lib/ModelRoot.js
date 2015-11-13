var isFunction = require("./support/isFunction");
var hasOwn = require("./support/hasOwn");
var ImmediateScheduler = require("./schedulers/ImmediateScheduler");

function ModelRoot(o) {

    var options = o || {};

    this.syncRefCount = 0;
    this.expired = options.expired || [];
    this.unsafeMode = options.unsafeMode || false;
    this.collectionScheduler = options.collectionScheduler || new ImmediateScheduler();
    this.cache = {};

    if (isFunction(options.comparator)) {
        this.comparator = options.comparator;
    }

    if (isFunction(options.errorSelector)) {
        this.errorSelector = options.errorSelector;
    }

    if (isFunction(options.onChange)) {
        this.onChange = options.onChange;
    }
}

ModelRoot.prototype.errorSelector = function errorSelector(x, y) {
    return y;
};
ModelRoot.prototype.comparator = function comparator(cacheNode, messageNode) {
    if (hasOwn(cacheNode, "value") && hasOwn(messageNode, "value")) {
        // it does not matter if they are equal or not, the expires metadata
        // is not equivalent.
        if (cacheNode.$expires !== messageNode.$expires) {
            return false;
        }

        return cacheNode.value === messageNode.value;
    }
    return cacheNode === messageNode;
};

module.exports = ModelRoot;
