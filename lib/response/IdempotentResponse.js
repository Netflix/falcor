var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;

var ModelResponse = require("./../response/ModelResponse");

var pathSyntax = require("falcor-path-syntax");

var getSize = require("./../support/getSize");
var collectLru = require("./../lru/collect");

var arrayClone = require("./../support/array-clone");
var __version = require("./../internal/version");

var isArray = Array.isArray;
var isPathValue = require("./../support/isPathValue");
var isJSONEnvelope = require("./../support/isJSONEnvelope");
var isJSONGraphEnvelope = require("./../support/isJSONGraphEnvelope");

function IdempotentResponse(subscribe) {
    Observable.call(this, subscribe);
}

IdempotentResponse.create = ModelResponse.create;

IdempotentResponse.prototype = Object.create(Observable.prototype);
IdempotentResponse.prototype.constructor = IdempotentResponse;

IdempotentResponse.prototype.subscribeCount = 0;
IdempotentResponse.prototype.subscribeLimit = 10;

IdempotentResponse.prototype.initialize = function initializeResponse() {
};

IdempotentResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {
    return this;
};

IdempotentResponse.prototype.ensureCollect = function ensureCollect(model) {
    var ensured = this.finally(function ensureCollect() {

        var modelRoot = model._root;
        var modelCache = modelRoot.cache;

        modelRoot.collectionScheduler.schedule(function collectThisPass() {
            collectLru(modelRoot, modelRoot.expired, getSize(modelCache),
                model._maxSize, model._collectRatio, modelCache[__version]);
        });
    });

    return new this.constructor(function(observer) {
        return ensured.subscribe(observer);
    });
};

module.exports = IdempotentResponse;
