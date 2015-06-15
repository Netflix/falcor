var Rx = require("falcor-observable");
var Observable = Rx.Observable;
var GetRequest = require("falcor/request/GetRequest");

var prefix = require("falcor/internal/prefix");
var get_type = require("falcor/support/get-type");
var is_object = require("falcor/support/is-object");

function RequestQueue(model, scheduler) {
    this.total = 0;
    this.model = model;
    this.requests = [];
    this.scheduler = scheduler;
}

RequestQueue.prototype.get = function getRequest(paths) {
    return Observable
        .fromArray(this.distributePaths(paths, this.requests, GetRequest))
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
        .subscribeOn(this.scheduler);
};

RequestQueue.prototype.set = function setRequest(jsonGraphEnvelope) {
    return this.model._source.set(jsonGraphEnvelope);
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
            pathRequests[++pathRequestsIndex] = request.getSourceObservable();
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