var is_function = require("falcor/support/is-function");
var ImmediateScheduler = require("falcor/schedulers/ImmediateScheduler");

function ModelRoot(options) {
    options = options || {};
    this.expired = options.expired || [];
    this.syncRefCount = options.syncRefCount || 0;
    this.unsafeMode = options.unsafeMode || false;
    this.collectionScheduler = options.collectionScheduler || new ImmediateScheduler();
    this.pendingPromises = options.pendingPromises || {};
    this.pendingPromiseID = 0;
    this.onChange = options.onChange || undefined;
};

ModelRoot.prototype.guardPromiseCollect = function guardPromiseCollect(promise, onNext, onError) {
    var id = ++this.pendingPromiseID;
    var pending = this.pendingPromises;
    pending[id] = true;
    return promise.then(
        function(x) {
            onNext(x);
            var collect = pending[id];
            pending[id] = false;
            if(is_function(collect)) {
                collect();
            }
        },
        function(e) {
            onError(e);
            var collect = pending[id];
            pending[id] = false;
            if(is_function(collect)) {
                collect();
            }
        })
};

module.exports = ModelRoot;