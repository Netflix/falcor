var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var collapse = require("./../support/collapse");
var permuteKey = require('./../support/permuteKey');

var is_array = Array.isArray;
var is_object = require("./../support/is-object");
var is_primitive = require("./../support/is-primitive");

var __count = require("./../internal/count");

/**
 *
 * @private
 */
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

    if (parent == null) {
        return false;
    }

    var key, node;
    var keyset = path[index];
    var is_keyset = is_object(keyset);
    var memo = false;

    // Determines if the key needs to go through permutation or not.
    // All object based keys require this.
    if (is_keyset) {
        memo = {
            isArray: is_array(keyset),
            arrOffset: 0,
            done: false
        };
        key = permuteKey(keyset, memo);
    } else {
        key = keyset;
    }

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

        if (memo && !memo.done) {
            key = permuteKey(keyset, memo);
        }
    } while (memo && !memo.done);

    return true;
};

Request.prototype.removePath = function removePathFromRequest(path, parent, index, count) {

    index = index || 0;
    count = count || path.length - 1;
    parent = parent || this.pathmaps[count + 1];

    if (parent == null) {
        return true;
    }

    var key, node, deleted = 0;
    var keyset = path[index];
    var is_keyset = is_object(keyset);
    var memo = false;

    // Determines if the key needs to go through permutation or not.
    // All object based keys require this.
    if (is_keyset) {
        memo = {
            isArray: is_array(keyset),
            arrOffset: 0,
            done: false
        };
        key = permuteKey(keyset, memo);
    } else {
        key = keyset;
    }

    do {
        node = parent[key];
        if (node == null) {
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
            if ((parent[key] = (node || 1) - 1) === 0) {
                delete parent[key];
            }
            deleted += 1;
            this.length -= 1;
        }

        if (memo && !memo.done) {
            key = permuteKey(keyset, memo);
        }
    } while (memo && !memo.done);

    return deleted;
};

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
    var queueDisposable = Disposable.create(function () {
        if (!isDisposed) {
            isDisposed = true;
            queue && queue._remove(request);
        }
    });

    var disposables = new CompositeDisposable(sourceSubscription, queueDisposable);

    sourceSubscription.setDisposable(
        this.model._source[this.method](this.getSourceArgs())
        .subscribe(this.getSourceObserver(observer)));

    return disposables;
};

module.exports = Request;
