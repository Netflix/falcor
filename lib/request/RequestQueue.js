var Rx = require("rx/dist/rx");;
var Observable = Rx.Observable;
var SerialDisposable = Rx.SerialDisposable;

var GetRequest = require("falcor/request/GetRequest");
var SetRequest = require("falcor/request/SetRequest");

var prefix = require("falcor/internal/prefix");
var get_type = require("falcor/support/get-type");
var is_object = require("falcor/support/is-object");
var array_clone = require("falcor/support/array-clone");

function RequestQueue(model, scheduler) {
    this.total = 0;
    this.model = model;
    this.requests = [];
    this.scheduler = scheduler;
}

RequestQueue.prototype.get = function getRequest(paths) {

    var requests = this.distributePaths(paths, this.requests, GetRequest);

    return (Observable.create(function(observer) {

        var m = new SerialDisposable();

        m.setDisposable(Observable.fromArray(requests.map(function(request) {
            return request.getSourceObservable();
        })).subscribe(observer));

        return function dispose() {
            m.dispose();
            var paths2 = array_clone(paths);
            var pathCount = paths2.length;
            var requestIndex = -1;
            var requestCount = requests.length;
            while(pathCount > 0 && ++requestIndex < requestCount) {
                var request = requests[requestIndex];
                if(!request.pending) {
                    continue;
                }
                var pathIndex = -1;
                while(++pathIndex < pathCount) {
                    var path = paths2[pathIndex];
                    if(request.removePath(path)) {
                        paths2.splice(pathIndex--, 1);
                        if(--pathCount === 0) {
                            break;
                        }
                    }
                }
            }
        };
    })
    .mergeAll()
    .reduce(this.mergeJSONGraphs, {
        index: -1,
        jsonGraph: {}
    })
    .map(function (response) {
        return {
            paths: paths,
            index: response.index,
            jsonGraph: response.jsonGraph
        };
    })
    .subscribeOn(this.scheduler));
};

RequestQueue.prototype.set = function setRequest(jsonGraphEnvelope) {
    return SetRequest.create(this.model, jsonGraphEnvelope);
}

RequestQueue.prototype._remove = function removeRequest(request) {
    var requests = this.requests;
    var index = requests.indexOf(request);
    if (index != -1) {
        requests.splice(index, 1);
    }
};

RequestQueue.prototype.distributePaths = function distributePathsAcrossRequests(paths, requests, RequestType) {

    var model = this.model;
    var pathsIndex = -1;
    var pathsCount = paths.length;

    var requestIndex = -1;
    var requestCount = requests.length;
    var participatingRequests = [];
    var pendingRequest;

    insert_path: while (++pathsIndex < pathsCount) {

        var path = paths[pathsIndex];
        var request = undefined;

        requestIndex = -1;

        while (++requestIndex < requestCount) {
            request = requests[requestIndex];
            if (request.insertPath(path, request.pending)) {
                participatingRequests[requestIndex] = request;
                continue insert_path;
            }
        }

        if (!pendingRequest) {
            pendingRequest = RequestType.create(this, model, this.total++);
            requests[requestIndex] = pendingRequest;
            participatingRequests[requestCount++] = pendingRequest;
        }

        pendingRequest.insertPath(path, false);
    }

    var pathRequests = [];
    var pathRequestsIndex = -1;

    requestIndex = -1;

    while (++requestIndex < requestCount) {
        request = participatingRequests[requestIndex];
        if (request != null) {
            pathRequests[++pathRequestsIndex] = request;
        }
    }

    return pathRequests;
};

RequestQueue.prototype.mergeJSONGraphs = function mergeJSONGraphs(aggregate, response) {

    var depth = 0;
    var contexts = [];
    var messages = [];
    var keystack = [];
    var latestIndex = aggregate.index;
    var responseIndex = response.index;

    aggregate.index = Math.max(latestIndex, responseIndex);

    contexts[-1] = aggregate.jsonGraph || {};
    messages[-1] = response.jsonGraph || {};

    recursing: while (depth > -1) {

        var context = contexts[depth - 1];
        var message = messages[depth - 1];
        var keys = keystack[depth - 1] || (keystack[depth - 1] = Object.keys(message));

        while (keys.length > 0) {

            var key = keys.pop();

            if (key[0] === prefix) {
                continue;
            }

            if (context.hasOwnProperty(key)) {
                var node = context[key];
                var nodeType = get_type(node);
                var messageNode = message[key];
                var messageType = get_type(messageNode);
                if (is_object(node) && is_object(messageNode) && !nodeType && !messageType) {
                    contexts[depth] = node;
                    messages[depth] = messageNode;
                    depth += 1;
                    continue recursing;
                } else if (responseIndex > latestIndex) {
                    context[key] = messageNode;
                }
            } else {
                context[key] = message[key];
            }
        }

        depth -= 1;
    }

    return aggregate;
};

module.exports = RequestQueue;