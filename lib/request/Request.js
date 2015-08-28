var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;
var InvalidSourceError = require("./../errors/InvalidSourceError");

var falcorPathUtils = require("falcor-path-utils");
var iterateKeySet = falcorPathUtils.iterateKeySet;

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

Request.prototype.insertPath = function insertPathIntoRequest(path, union, parentArg, indexArg, countArg) {

    var index = indexArg || 0;
    var count = countArg || path.length - 1;
    var parent = parentArg || this.pathmaps[count + 1] || (this.pathmaps[count + 1] = Object.create(null));

    if (parent === void 0 || parent === null) {
        return false;
    }

    var key, node;
    var keySet = path[index];
    var iteratorNote = {};
    key = iterateKeySet(keySet, iteratorNote);

    // Determines if the key needs to go through permutation or not.
    // All object based keys require this.

    do {
        node = parent[key];
        if (index < count) {
            if (node == null) {
                if (union) {
                    return false;
                }
                node = parent[key] = Object.create(null);
            }
            if (this.insertPath(path, union, node, index + 1, count) === false) {
                return false;
            }
        } else {
            parent[key] = (node || 0) + 1;
            this.length += 1;
        }

        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (!iteratorNote.done);

    return true;
};

/* eslint-disable guard-for-in */
Request.prototype.removePath = function removePathFromRequest(path, parentArg, indexArg, countArg) {

    var index = indexArg || 0;
    var count = countArg || path.length - 1;
    var parent = parentArg || this.pathmaps[count + 1];

    if (parent === void 0 || parent === null) {
        return true;
    }

    var key, node, deleted = 0;
    var keySet = path[index];
    var iteratorNote = {};

    key = iterateKeySet(keySet, iteratorNote);
    do {
        node = parent[key];
        if (node === void 0 || node === null) {
            continue;
        } else if (index < count) {
            deleted += this.removePath(path, node, index + 1, count);
            var emptyNodeKey = void 0;
            for (emptyNodeKey in node) {
                break;
            }
            if (emptyNodeKey === void 0) {
                delete parent[key];
            }
        } else {
            node = parent[key] = (node || 1) - 1;
            if (node === 0) {
                delete parent[key];
            }
            deleted += 1;
            this.length -= 1;
        }

        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (!iteratorNote.done);

    return deleted;
};
/* eslint-enable */

Request.prototype.getSourceObserver = function getSourceObserver(observer) {
    var request = this;
    return Observer.create(
        function onNext(envelope) {
            envelope.jsonGraph = envelope.jsonGraph ||
                envelope.jsong ||
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
    var queueDisposable = Disposable.create(function() {
        if (!isDisposed) {
            isDisposed = true;
            if (queue) {
                queue._remove(request);
            }
        }
    });

    var disposables = new CompositeDisposable(sourceSubscription, queueDisposable);

    try {
        sourceSubscription.setDisposable(
            this.model._source[this.method](this.getSourceArgs())
            .subscribe(this.getSourceObserver(observer)));
    } catch (e) {

        // We need a way to communicate out to the rest of the world that
        // this error needs to continue its propagation.
        throw new InvalidSourceError(e);
    }

    return disposables;
};

module.exports = Request;
