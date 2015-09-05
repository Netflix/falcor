var Rx = require("rx/dist/rx") && require("rx/dist/rx.aggregates");
var Observable = Rx.Observable;
var CompositeDisposable = Rx.CompositeDisposable;

var ModelResponse = require("./../response/ModelResponse");
var InvalidSourceError = require("./../errors/InvalidSourceError");

var pathSyntax = require("falcor-path-syntax");

var $ref = require("./../types/ref");

function CallResponse(subscribe) {
    Observable.call(this, subscribe || subscribeToResponse);
}

CallResponse.create = ModelResponse.create;

CallResponse.prototype = Object.create(Observable.prototype);
CallResponse.prototype.constructor = CallResponse;

CallResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {
    return this;
};

CallResponse.prototype.ensureCollect = function ensureCollect(model) {
    return this;
};

CallResponse.prototype.initialize = function initializeResponse() {
    return this;
};

function toObservable(x) {
    return Rx.Observable.defer(function() {
        return x;
    });
}

function subscribeToResponse(observer) {

    var args = this.args;
    var model = this.model;

    var callPath = pathSyntax.fromPath(args[0]);
    var callArgs = args[1] || [];
    var suffixes = (args[2] || []).map(pathSyntax.fromPath);
    var extraPaths = (args[3] || []).map(pathSyntax.fromPath);

    var rootModel = model._clone({
        _path: []
    });
    var localRoot = rootModel.withoutDataSource();
    var boundPath = model._path;
    var boundCallPath = boundPath.concat(callPath);
    var boundThisPath = boundCallPath.slice(0, -1);

    var setCallValuesObs = toObservable(
            model.withoutDataSource().get(callPath)
        )
        .map(function(data) {
            var curr = data.json;
            var depth = -1;
            var length = callPath.length;

            while (curr && ++depth < length) {
                curr = curr[callPath[depth]];
            }
            var boundModel = rootModel._derefSync(boundThisPath).boxValues();
            return {
                model: boundModel,
                localFn: curr
            };
        })
        .flatMap(getLocalCallObs)
        .defaultIfEmpty(getRemoteCallObs(model._source))
        .mergeAll()
        .flatMap(setCallEnvelope);

    var disposables = new CompositeDisposable();

    disposables.add(setCallValuesObs.subscribe(function(envelope) {
            var paths = envelope.paths;
            var invalidated = envelope.invalidated;
            var innerObs = model.get.apply(model, paths);
            if (observer.outputFormat === "AsJSONG") {
                innerObs = toObservable(innerObs._toJSONG()).doAction(function(envelope2) {
                    envelope2.invalidated = invalidated;
                });
            }
            disposables.add(innerObs.subscribe(observer));
        },
        function(e) {
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

            return Observable.return(remoteGetValues);
        }

        return Observable.empty();

        function aggregateFnResults(results, pathValue) {
            if (Boolean(pathValue.invalidated)) {
                results.invalidations.push(results.localThisPath.concat(pathValue.path));
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
                return toObservable(localRoot.set.
                        apply(localRoot, values).
                        _toJSONG())
                    .map(function(envelope) {
                        return {
                            results: results,
                            envelope: envelope
                        };
                    });
            } else {
                return Observable.return({
                    results: results,
                    envelope: {
                        jsonGraph: {},
                        paths: []
                    }
                });
            }
        }

        function getRemoteValues(tuple2) {

            var envelope = tuple2.envelope;
            var results = tuple2.results;
            var values = results.values;
            var references = results.references;
            var invalidations = results.invalidations;

            var rootValues = values.map(pluckPath).map(prependThisPath);
            var rootSuffixes = references.reduce(prependRefToSuffixes, []);
            var rootExtraPaths = extraPaths.map(prependThisPath);
            var rootPaths = rootSuffixes.concat(rootExtraPaths);
            var envelopeObs;

            if (rootPaths.length > 0) {
                envelopeObs = toObservable(rootModel.get.apply(rootModel, rootValues.concat(rootPaths))._toJSONG());
            } else {
                envelopeObs = Observable.return(envelope);
            }

            return envelopeObs.doAction(function(envelope2) {
                envelope2.invalidated = invalidations;
            });
        }

        function prependRefToSuffixes(refPaths, refPathValue) {
            var refPath = refPathValue.path;
            refPaths.push.apply(refPaths, suffixes.map(function(pathSuffix) {
                return refPath.concat(pathSuffix);
            }));
            return refPaths;
        }

        function pluckPath(pathValue) {
            return pathValue.path;
        }
    }

    function getRemoteCallObs(dataSource) {

        if (dataSource && typeof dataSource === "object") {
            return Rx.Observable.defer(function() {
                var obs;
                try {
                    obs = dataSource.call(boundCallPath, callArgs, suffixes, extraPaths);
                } catch (e) {
                    obs = Observable.throw(new InvalidSourceError(e));
                }
                return obs;
            }).map(invalidateLocalValues);
        }

        return Observable.empty();

        function invalidateLocalValues(envelope) {
            var invalidations = envelope.invalidated;
            if (invalidations && invalidations.length) {
                rootModel.invalidate.apply(rootModel, invalidations);
            }
            return envelope;
        }
    }

    function setCallEnvelope(envelope) {
        return toObservable(localRoot.set(envelope)).
            reduce(function(acc) { return acc; }, null).
            map(function() {
                return {
                    invalidated: envelope.invalidated,
                    paths: envelope.paths.map(function(path) {
                        return path.slice(boundPath.length);
                    })
                };
            });
    }

    function prependThisPath(path) {
        return boundThisPath.concat(path);
    }
}

module.exports = CallResponse;
