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
    this._pathObservers = [];

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
        // They are the same only if the following fields are the same.
        return cacheNode.value === messageNode.value &&
            cacheNode.$type === messageNode.$type &&
            cacheNode.$expires === messageNode.$expires;
    }
    return cacheNode === messageNode;
};

ModelRoot.prototype.onObserve = function(affectedPaths, affectedPathMap) {
    this._pathObservers.forEach(function(pathObserver) {
        if (pathMapsIntersect(pathObserver.pathMap, affectedPathMap)) {
            pathObserver.observer.onNext(affectedPaths);
        }
    });
};

ModelRoot.prototype.hasObservers = function() {
    return this._pathObservers.length > 0;
};

function pathMapsIntersect(left, right) {
    if (left === null && right === null) {
        return true;
    }
    if (typeof left !== "object" || typeof right !== "object") {
        return false;
    }
    var leftKeys = Object.keys(left);
    var key;
    for (var i = 0; i < leftKeys.length; i++) {
        key = leftKeys[i];
        if (pathMapsIntersect(left[key], right[key])) {
            return true;
        }
    }
    return false;
}

module.exports = ModelRoot;
