var ModelResponse = require("falcor/response/ModelResponse");

var Rx = require("falcor-observable");
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

function GetResponse(subscribe) {
    ModelResponse.call(this, subscribe);
}

GetResponse.method = "get";
GetResponse.create = ModelResponse.create;

GetResponse.prototype = Object.create(ModelResponse.prototype);
GetResponse.prototype.constructor = GetResponse;

var empty_array = new Array(0);
var set_json_graph_as_json_dense = require("falcor/set/set-json-graph-as-json-dense");

GetResponse.prototype.updateProgressively = require("falcor/response/updateProgressively");
GetResponse.prototype.invokeSourceRequest = function invokeSourceRequest() {

    var source = this;

    return new this.constructor(function remoteSubscribe(observer) {

        var isDisposed = false;
        var subscription = new SerialDisposable();
        var disposables = new CompositeDisposable(subscription, Disposable.create(function () {
            isDisposed = true;
        }));

        var destOnNext = observer.onNext;
        var destOnError = observer.onError;
        var destOnCompleted = observer.onCompleted;

        observer.onNext = onNext;
        observer.onError = onError;
        observer.onCompleted = onCompleted;

        subscription.setDisposable(source.subscribe(observer));

        return disposables;

        function onNext(x) {
            if (isDisposed === true) {
                return;
            }
            destOnNext.call(observer, x);
        }

        function onError(e) {
            if (isDisposed === true) {
                return;
            }
            if(e && e.isResponseObserver) {
                if (e.subscribeCount > e.subscribeLimit) {
                    destOnError.call(observer, "Loop kill switch thrown.");
                } else {
                    subscription.setDisposable(request_optimized_paths(e, observer));
                }
            } else {
                destOnError.call(observer, e);
            }
        }

        function onCompleted() {
            if (isDisposed === true) {
                return;
            }
            destOnCompleted.call(observer);
        }

        function request_optimized_paths(sourceObserver, observer) {

            var model = sourceObserver.model;
            var requestQueue = model._request;
            var requested = sourceObserver.requestedMissingPaths;
            var optimized = sourceObserver.optimizedMissingPaths;
            var disposables = new CompositeDisposable();
            
            disposables.add((requestQueue.get(optimized).subscribe(function(jsonGraphEnvelope) {

                jsonGraphEnvelope.paths = requested;

                set_json_graph_as_json_dense(model, [jsonGraphEnvelope], empty_array);

                sourceObserver.errors.length = 0;
                sourceObserver.requestedPaths.length = 0;
                sourceObserver.optimizedPaths.length = 0;
                sourceObserver.requestedMissingPaths.length = 0;
                sourceObserver.optimizedMissingPaths.length = 0;

                disposables.add(source.subscribe(observer));
            }));
            
            return disposables;
        }
    });
};

module.exports = GetResponse;