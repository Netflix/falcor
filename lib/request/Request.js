var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var collapse = require("falcor/support/collapse");
var permute_keyset = require("falcor/support/permute-keyset");
var keyset_to_key = require("falcor/support/keyset-to-key");

var is_array = Array.isArray;
var is_object = require("falcor/support/is-object");
var is_primitive = require("falcor/support/is-primitive");

var __count = require("falcor/internal/count");

function Request() {
    this.length = 0;
    this.pending = false;
    this.pathmaps = [];
    Observable.call(this, this._subscribe);
}

Request.create = function create(queue, model, index) {
    var request = new this();
    request.queue = queue;
    request.model = model;
    request.index = index;
    return request;
};

Request.prototype = Object.create(Observable.prototype);

Request.prototype.constructor = Request;

Request.prototype.insertPath = function insertPathIntoRequest(path, union, parent, index, count) {

    index = index || 0;
    count = count || path.length - 1;
    parent = parent || this.pathmaps[count + 1] || (this.pathmaps[count + 1] = Object.create(null));

    if(parent == null) {
        return false;
    }

    var key, node;
    var keyset = path[index];
    var is_keyset = is_object(keyset);
    var run_once = false;

    while(is_keyset && permute_keyset(keyset) && (run_once = true) || (run_once = !run_once)) {
        key = keyset_to_key(keyset, is_keyset);
        node = parent[key];
        if(index < count) {
            if(node == null) {
                if(union) {
                    return false;
                }
                node = parent[key] = Object.create(null);
            }
            if(this.insertPath(path, union, node, index + 1, count) === false) {
                return false;
            }
        } else {
            parent[key] = (node || 0) + 1;
            this.length += 1;
        }
    }
    return true;
};

Request.prototype.removePath = function removePathFromRequest(path, parent, index, count) {

    index = index || 0;
    count = count || path.length - 1;
    parent = parent || this.pathmaps[count + 1];

    if(parent == null) {
        return true;
    }

    var key, node, deleted = 0;
    var keyset = path[index];
    var is_keyset = is_object(keyset);
    var run_once = false;

    while(is_keyset && permute_keyset(keyset) && (run_once = true) || (run_once = !run_once)) {
        key = keyset_to_key(keyset, is_keyset);
        node = parent[key];
        if(node == null) {
            continue;
        } else if(index < count) {
            deleted += this.removePath(path, node, index + 1, count);
            var emptyNodeKey = void 0;
            for(emptyNodeKey in node) {
                break;
            }
            if(emptyNodeKey === void 0) {
                delete parent[key];
            }
        } else {
            if((parent[key] = (node || 1) - 1) === 0) {
                delete parent[key];
            }
            deleted += 1;
            this.length -= 1;
        }
    }

    return deleted;
};

Request.prototype.getSourceObserver = function getSourceObserver(observer) {
    var request = this;
    return Observer.create(
        function onNext(envelope) {
            envelope.jsonGraph = envelope.jsonGraph ||
                envelope.jsong  ||
                envelope.values ||
                envelope.value;
            envelope.index = request.index;
            observer.onNext(envelope);
        },
        function onError(e) {
            observer.onError(e);
        },
        function onCompleted() {
            observer.onCompleted();
        });
};

Request.prototype._subscribe = function _subscribe(observer) {

    var request = this;
    var queue = this.queue;

    request.pending = true;

    var isDisposed = false;
    var sourceSubscription = new SerialDisposable();
    var queueDisposable = Disposable.create(function () {
        if (!isDisposed) {
            isDisposed = true;
            queue && queue._remove(request);
        }
    });

    var disposables = new CompositeDisposable(sourceSubscription, queueDisposable);

    sourceSubscription.setDisposable(
        this.model._source[this.method](this.getSourceArgs())
            .subscribe(
                this.getSourceObserver(observer)
    ));

    return disposables;
};

module.exports = Request;