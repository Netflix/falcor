var Rx = require("falcor-observable");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var collapse = require("falcor/support/collapse")
var is_object = require("falcor/support/is-object");

function Request(subscribe) {
    this.pathmap = {};
    Observable.call(this, subscribe);
}

Request.create = function create(queue, model, index) {
    var request = new this.constructor(_subscribe);
    request.queue = queue;
    request.model = model;
    request.index = index;
    return request;
}

Request.prototype = Object.create(Observable.prototype);

Request.prototype.getSourceMethod = function getSourceMethod() {
    throw new Error("A Request subclass must specify a source method.");
};

Request.prototype.getSourceArgs = function getSourceArgs() {
    throw new Error("A Request subclass must specify source arguments.");
};

Request.prototype.getSourceObservable = function getSourceObservable() {
    return this;
};

Request.prototype.insertPath = function insertPathIntoRequest(path, union) {

    var parent = this.pathmap;
    var key, node;
    var keyIndex = -1;
    var keyCount = path.length - 1;

    while (++keyIndex < keyCount) {
        key = path[keyIndex];
        node = parent[key];
        if (is_object(node)) {
            parent = node;
        } else if (union) {
            return false;
        } else {
            parent[key] = parent = {};
        }
    }

    key = path[keyIndex];
    parent[key] = true;

    return true;
};

function _subscribe(observer) {

    var source = this.model._source;

    if (!source) {
        observer.onCompleted();
        return Disposable.empty;
    }

    var queue = this.queue;
    var request = this;

    var isDisposed = false;
    var sourceSubscription = new SerialDisposable();
    var queueDisposable = Disposable.create(function () {
        if (!isDisposed) {
            isDisposed = true;
            request.queue = undefined;
            request.model = undefined;
            request.index = undefined;
            request.pathmap = undefined;
            queue._remove(request);
        }
    });

    var disposables = new CompositeDisposable(sourceSubscription, queueDisposable);

    sourceSubscription.setDisposable(source[this.getSourceMethod()](this.getSourceArgs()).subscribe(
        function onNext(x) {
            observer.onNext(x);
        },
        function onError(e) {
            queueDisposable.dispose();
            observer.onError(e);
        },
        function onCompleted() {
            queueDisposable.dispose();
            observer.onCompleted();
        }
    ));

    return disposables;
};

module.exports = Request;