var $ref = require("../../../types/ref");
var falcor = require("../../Falcor");
var Observable = falcor.Observable;
var pathSyntax = require('falcor-path-syntax');
var ModelResponse = require('./../../ModelResponse');

function mapPathSyntax(path) {
    if(typeof path === "string") {
        return pathSyntax(path);
    }
    return path;
}

module.exports = function call(path, args, suffixes, extraPaths, selector) {

    var model = this;
    
    args && Array.isArray(args) || (args = []);
    suffixes && Array.isArray(suffixes) || (suffixes = []);
    extraPaths = Array.prototype.slice.call(arguments, 3);
    if (typeof (selector = extraPaths[extraPaths.length - 1]) !== "function") {
        selector = undefined;
    } else {
        extraPaths = extraPaths.slice(0, -1);
    }

    path = mapPathSyntax(path);
    suffixes = suffixes.map(mapPathSyntax);
    extraPaths = extraPaths.map(mapPathSyntax);

    return ModelResponse.create(function (options) {

        var rootModel = model.clone(["_path", []]);
        var localRoot = rootModel.withoutDataSource();
        var dataSource = model._dataSource;
        var boundPath = model._path;
        var callPath = boundPath.concat(path);
        var thisPath = callPath.slice(0, -1);
        
        var localFnObs = model.
            withoutDataSource().
            get(path, function(localFn) {
                return {
                    model: rootModel.bindSync(thisPath).boxValues(),
                    localFn: localFn
                };
            });
        
        var localFnCallObs = localFnObs.flatMap(getLocalCallObs);
        
        var localOrRemoteCallObs = localFnCallObs.
            defaultIfEmpty(getRemoteCallObs(dataSource)).
            mergeAll();
        
        var setCallValuesObs = localOrRemoteCallObs.flatMap(setCallEnvelope);
        
        var innerDisposable;
        var disposable = setCallValuesObs.last().subscribe(function (envelope) {
            var paths = envelope.paths;
            var invalidated = envelope.invalidated;
            if (selector) {
                paths.push(function () {
                    return selector.call(model, paths);
                });
            }
            var innerObs = model.get.apply(model, paths);
            if(options.format === "AsJSONG") {
                innerObs = innerObs.toJSONG().doAction(function(envelope) {
                    envelope.invalidated = invalidated;
                });
            }
            innerDisposable = innerObs.subscribe(options);
        },
        function (e) { options.onError(e); });

        return {
            dispose: function () {
                disposable && disposable.dispose();
                innerDisposable && innerDisposable.dispose();
                disposable = undefined;
                innerDisposable = undefined;
            }
        };
        
        function getLocalCallObs(tuple) {

            var localFn = tuple && tuple.localFn;

            if (typeof localFn === "function") {

                var localFnModel = tuple.model;
                var localThisPath = localFnModel._path;
                var localFnCallObs = localFn.apply(localFnModel, args);
                var localFnResults = localFnCallObs.reduce(aggregateFnResults, {
                    values: [],
                    references: [],
                    invalidations: [],
                    localThisPath: localThisPath
                });
                var localSetValues = localFnResults.flatMap(setLocalValues);
                var remoteGetValues = localSetValues.flatMap(getRemoteValues);

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
                if(values.length > 0) {
                    return localRoot.set.
                        apply(localRoot, values).
                        toJSONG().
                        map(function(envelope) {
                            return { results: results, envelope: envelope };
                        });
                } else {
                    return Observable["return"]({
                        results: results,
                        envelope: { jsong: {}, paths: [] }
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
                
                debugger;
                
                if(rootPaths.length > 0) {
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
                return thisPath.concat(path);
            }
        }
        
        function getRemoteCallObs(dataSource) {
            if(dataSource && typeof dataSource === "object") {
                return dataSource.
                    call(path, args, suffixes, extraPaths).
                    flatMap(invalidateLocalValues);
            }
            
            return Observable.empty();
            
            function invalidateLocalValues(envelope) {
                var invalidations = envelope.invalidated;
                if(invalidations && invalidations.length) {
                    return rootModel.invalidate.
                        apply(rootModel, invalidations).
                        map(function() { return envelope; })
                }
                return Observable["return"](envelope);
            }
        }

        function setCallEnvelope(envelope) {
            return localRoot.set(envelope, function () {
                return {
                    invalidated: envelope.invalidated,
                    paths: envelope.paths.map(function (path) {
                        return path.slice(boundPath.length);
                    })
                }
            });
        }

    });
};