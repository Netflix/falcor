var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;

var BatchedRequest = require("./../request/BatchedRequest");

var falcorPathUtils = require("falcor-path-utils");
var iterateKeySet = falcorPathUtils.iterateKeySet;
var toPaths = falcorPathUtils.toPaths;
var array_map = require("./../support/array-map");

var set_json_graph_as_json_dense = require("./../set/set-json-graph-as-json-dense");
var set_json_values_as_json_dense = require("./../set/set-json-values-as-json-dense");

var empty_array = new Array(0);
var $error = require('./../types/error');

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

            model._path = empty_array;

            var result = set_json_graph_as_json_dense(model, [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], empty_array, errorSelector, comparator);

            jsonGraphEnvelope.paths = result.requestedPaths.concat(result.errors.map(getPath));

            model._path = bound;

            observer.onNext(jsonGraphEnvelope);
        },
        function onError(error) {

            model._path = empty_array;

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

            set_json_values_as_json_dense(model, array_map(paths, function (path) {
                return {
                    path: path,
                    value: error
                };
            }), empty_array, errorSelector, comparator);

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
