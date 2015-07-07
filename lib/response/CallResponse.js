var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var ModelResponse = require("falcor/response/ModelResponse");

var pathSyntax = require("falcor-path-syntax");

var $ref = require("falcor/types/ref");

function CallResponse(subscribe) {
    Observable.call(this, subscribe || subscribeToResponse);
}

CallResponse.create = ModelResponse.create;

CallResponse.prototype = Object.create(Observable.prototype);
CallResponse.prototype.constructor = CallResponse;

CallResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {
    return this;
};

CallResponse.prototype.ensureCollect = function ensureCollect(model, initialVersion, pendingPromiseID) {
    return this;
};

CallResponse.prototype.initialize = function initialize_response() {
    return this;
};

function subscribeToResponse(observer) {

    var args = this.args;
    var model = this.model;
    var selector = this.selector;

    var callPath = pathSyntax.fromPath(args[0]);
    var callArgs = args[1] || [];
    var suffixes = (args[2] || []).map(pathSyntax.fromPath);
    var extraPaths = (args[3] || []).map(pathSyntax.fromPath);

    var rootModel = model.clone({
        _path: []
    });
    var localRoot = rootModel.withoutDataSource();
    var dataSource = model._source;
    var boundPath = model._path;
    var boundCallPath = boundPath.concat(callPath);
    var boundThisPath = boundCallPath.slice(0, -1);

    var setCallValuesObs = model
        .withoutDataSource()
        .get(callPath, function (localFn) {
            return {
                model: rootModel.bindSync(boundThisPath).boxValues(),
                localFn: localFn
            };
        })
        .flatMap(getLocalCallObs)
        .defaultIfEmpty(getRemoteCallObs(dataSource))
        .mergeAll()
        .flatMap(setCallEnvelope);

    var disposables = new CompositeDisposable();

    disposables.add(setCallValuesObs.last().subscribe(function (envelope) {
            var paths = envelope.paths;
            var invalidated = envelope.invalidated;
            if (selector) {
                paths.push(function () {
                    return selector.call(model, paths);
                });
            }
            var innerObs = model.get.apply(model, paths);
            if (observer.outputFormat === "AsJSONG") {
                innerObs = innerObs.toJSONG().doAction(function (envelope) {
                    envelope.invalidated = invalidated;
                });
            }
            disposables.add(innerObs.subscribe(observer));
        },
        function (e) {
            observer.onError(e);
        }
    ));

    return disposables;

    function getLocalCallObs(tuple) {

        var localFn = tuple && tuple.localFn;

        if (typeof localFn === "function") {

            var localFnModel = tuple.model;
            var localThisPath = localFnModel._path;

            var remoteGetValues = localFn
                .apply(localFnModel, callArgs)
                .reduce(aggregateFnResults, {
                    values: [],
                    references: [],
                    invalidations: [],
                    localThisPath: localThisPath
                })
                .flatMap(setLocalValues)
                .flatMap(getRemoteValues);

            return Observable["return"](remoteGetValues);
        }

        return Observable.empty();

        function aggregateFnResults(results, pathValue) {
            var localThisPath = results.localThisPath;
            if (Boolean(pathValue.invalidated)) {
                results.invalidations.push(localThisPath.concat(pathValue.path));
            } else {
                var path = pathValue.path;
                var value = pathValue.value;
                if (Boolean(value) && typeof value === "object" && value.$type === $ref) {
                    results.references.push({
                        path: prependThisPath(path),
                        value: pathValue.value
                    });
                } else {
                    results.values.push({
                        path: prependThisPath(path),
                        value: pathValue.value
                    });
                }
            }
            return results;
        }

        function setLocalValues(results) {
            var values = results.values.concat(results.references);
            if (values.length > 0) {
                return localRoot.set
                    .apply(localRoot, values)
                    .toJSONG()
                    .map(function (envelope) {
                        return {
                            results: results,
                            envelope: envelope
                        };
                    });
            } else {
                return Observable["return"]({
                    results: results,
                    envelope: {
                        jsonGraph: {},
                        paths: []
                    }
                });
            }
        }

        function getRemoteValues(tuple) {

            var envelope = tuple.envelope;
            var results = tuple.results;
            var values = results.values;
            var references = results.references;
            var invalidations = results.invalidations;

            var rootValues = values.map(pluckPath).map(prependThisPath);
            var rootSuffixes = references.reduce(prependRefToSuffixes, []);
            var rootExtraPaths = extraPaths.map(prependThisPath);
            var rootPaths = rootSuffixes.concat(rootExtraPaths);
            var envelopeObs;

            if (rootPaths.length > 0) {
                envelopeObs = rootModel.get.apply(rootModel, rootValues.concat(rootPaths)).toJSONG();
            } else {
                envelopeObs = Observable["return"](envelope);
            }

            return envelopeObs.doAction(function (envelope) {
                envelope.invalidated = invalidations;
            });
        }

        function prependRefToSuffixes(refPaths, refPathValue) {
            var refPath = refPathValue.path;
            refPaths.push.apply(refPaths, suffixes.map(function (pathSuffix) {
                return refPath.concat(pathSuffix);
            }));
            return refPaths;
        }

        function pluckPath(pathValue) {
            return pathValue.path;
        }

        function prependThisPath(path) {
            return boundThisPath.concat(path);
        }
    }

    function getRemoteCallObs(dataSource) {

        if (dataSource && typeof dataSource === "object") {
            return dataSource
                .call(callPath, callArgs, suffixes, extraPaths)
                .map(invalidateLocalValues);
            // .flatMap(invalidateLocalValues);
        }

        return Observable.empty();

        function invalidateLocalValues(envelope) {
            var invalidations = envelope.invalidated;
            if (invalidations && invalidations.length) {
                rootModel.invalidate.apply(rootModel, invalidations);
                // return rootModel
                //     .invalidate
                //     .apply(rootModel, invalidations)
                //     .map(function () {
                //         return envelope;
                //     });
            }
            // return Observable["return"](envelope);
            return envelope;
        }
    }

    function setCallEnvelope(envelope) {
        return localRoot.set(envelope, function () {
            return {
                invalidated: envelope.invalidated,
                paths: envelope.paths.map(function (path) {
                    return path.slice(boundPath.length);
                })
            };
        });
    }
};

module.exports = CallResponse;