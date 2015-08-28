var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;

var BatchedRequest = require("./../request/BatchedRequest");

var falcorPathUtils = require("falcor-path-utils");
var toPaths = falcorPathUtils.toPaths;
var arrayMap = require("./../support/array-map");

var setJSONGraphs = require("./../set/setJSONGraphs");
var setPathValues = require("./../set/setPathValues");

var emptyArray = new Array(0);
var $error = require("./../types/error");

function GetRequest() {
    BatchedRequest.call(this);
}

GetRequest.create = BatchedRequest.create;

GetRequest.prototype = Object.create(BatchedRequest.prototype);
GetRequest.prototype.constructor = GetRequest;

GetRequest.prototype.method = "get";

GetRequest.prototype.getSourceArgs = function getSourceArgs() {
    this.paths = toPaths(this.pathmaps);
    return this.paths;
};

GetRequest.prototype.getSourceObserver = function getSourceObserver(observer) {

    var model = this.model;
    var bound = model._path;
    var paths = this.paths;
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var comparator = modelRoot.comparator;

    return BatchedRequest.prototype.getSourceObserver.call(this, Observer.create(
        function onNext(jsonGraphEnvelope) {

            model._path = emptyArray;

            var optimizedPaths = setJSONGraphs(model, [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], null, errorSelector, comparator);

            jsonGraphEnvelope.paths = optimizedPaths;

            model._path = bound;

            observer.onNext(jsonGraphEnvelope);
        },
        function onError(errorArg) {

            var error = errorArg;
            model._path = emptyArray;

            // Converts errors to objects, a more friendly storage
            // of errors.
            if (error instanceof Error) {
                error = {
                    message: error.message
                };
            }

            // Not all errors are value $types.
            if (!error.$type) {
                error = {
                    $type: $error,
                    value: error
                };
            }

            setPathValues(model, arrayMap(paths, function(path) {
                return {
                    path: path,
                    value: error
                };
            }), null, errorSelector, comparator);

            model._path = bound;

            observer.onError(error);
        },
        function onCompleted() {
            observer.onCompleted();
        }
    ));
};

function getPath(pv) {
    return pv.path;
}

module.exports = GetRequest;
