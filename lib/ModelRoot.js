var is_function = require("./support/is-function");
var ImmediateScheduler = require("./schedulers/ImmediateScheduler");

function ModelRoot(options) {

    options = options || {};

    this.syncRefCount = 0;
    this.expired = options.expired || [];
    this.unsafeMode = options.unsafeMode || false;
    this.collectionScheduler = options.collectionScheduler || new ImmediateScheduler();

    if(is_function(options.comparator)) {
        this.comparator = options.comparator;
    }

    if(is_function(options.errorSelector)) {
        this.errorSelector = options.errorSelector;
    }

    if(is_function(options.onChange)) {
        this.onChange = options.onChange;
    }
};

ModelRoot.prototype.errorSelector = function errorSelector(x, y) { return y; };
ModelRoot.prototype.comparator = function comparator(a, b) {
    if (Boolean(a) && typeof a === "object" && a.hasOwnProperty("value") &&
        Boolean(b) && typeof b === "object" && b.hasOwnProperty("value")) {
        return a.value === b.value;
    }
    return a === b;
};

module.exports = ModelRoot;