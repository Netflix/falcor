var Rx = require("rx/dist/rx");
var Observer = Rx.Observer;

var Request = require("./../request/Request");

var arrayMap = require("./../support/array-map");

var setJsonGraphAsJsonDense = require("./../set/set-json-graph-as-json-dense");
var setJsonValuesAsJsonDense = require("./../set/set-json-values-as-json-dense");

var emptyArray = new Array(0);

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
SetRequest.prototype.insertPath = function() {
    return false;
};
SetRequest.prototype.removePath = function() {
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

            model._path = emptyArray;

            var result = setJsonGraphAsJsonDense(model._materialize(), [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], emptyArray, errorSelector, comparator);

            jsonGraphEnvelope.paths = result.requestedPaths.concat(result.errors.map(getPath));

            model._path = bound;

            observer.onNext(jsonGraphEnvelope);
        },
        function onError(error) {

            model._path = emptyArray;

            setJsonValuesAsJsonDense(model._materialize(), arrayMap(paths, function(path) {
                return {
                    path: path,
                    value: error
                };
            }), emptyArray, errorSelector, comparator);

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

module.exports = SetRequest;
