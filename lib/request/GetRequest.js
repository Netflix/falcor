var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;

var BatchedRequest = require("falcor/request/BatchedRequest");

var collapse = require("falcor/support/collapse")
var array_map = require("falcor/support/array-map");

var set_json_graph_as_json_dense = require("falcor/set/set-json-graph-as-json-dense");
var set_json_values_as_json_dense = require("falcor/set/set-json-values-as-json-dense");

var empty_array = new Array(0);

function GetRequest() {
    BatchedRequest.call(this);
}

GetRequest.create = BatchedRequest.create;

GetRequest.prototype = Object.create(BatchedRequest.prototype);
GetRequest.prototype.constructor = GetRequest;

GetRequest.prototype.method = "get";

GetRequest.prototype.getSourceArgs = function getSourceArgs() {
    return (this.paths = collapse(this.pathmaps));
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

            set_json_graph_as_json_dense(model, [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], empty_array, errorSelector, comparator);

            model._path = bound;

            observer.onNext(jsonGraphEnvelope);
        },
        function onError(error) {

            model._path = empty_array;

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

module.exports = GetRequest;