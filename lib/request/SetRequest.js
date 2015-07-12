var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;

var Request = require("./../request/Request");

var array_map = require("./../support/array-map");

var set_json_graph_as_json_dense = require("./../set/set-json-graph-as-json-dense");
var set_json_values_as_json_dense = require("./../set/set-json-values-as-json-dense");

var empty_array = new Array(0);

function SetRequest() {
    Request.call(this);
}

SetRequest.create = function create(model, jsonGraphEnvelope) {
    var request = new SetRequest();
    request.model = model;
    request.jsonGraphEnvelope = jsonGraphEnvelope;
    return request;
};

SetRequest.prototype = Object.create(Request.prototype);
SetRequest.prototype.constructor = SetRequest;

SetRequest.prototype.method = "set";
SetRequest.prototype.insertPath = function () {
    return false;
};
SetRequest.prototype.removePath = function () {
    return 0;
};

SetRequest.prototype.getSourceArgs = function getSourceArgs() {
    return this.jsonGraphEnvelope;
};

SetRequest.prototype.getSourceObserver = function getSourceObserver(observer) {

    var model = this.model;
    var bound = model._path;
    var paths = this.jsonGraphEnvelope.paths;
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var comparator = modelRoot.comparator;

    return Request.prototype.getSourceObserver.call(this, Observer.create(
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

module.exports = SetRequest;