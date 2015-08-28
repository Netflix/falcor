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
ModelRoot.prototype.comparator = function comparator(a, b) {
    if (hasOwn(a, "value") && hasOwn(b, "value")) {
        return a.value === b.value;
    }
    return a === b;
};

module.exports = ModelRoot;
