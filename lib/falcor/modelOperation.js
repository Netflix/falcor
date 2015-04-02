var falcor = require('./Falcor');
var ModelResponse = require('./ModelResponse');
module.exports = function modelOperation(name) {
    return function() {

        var model = this, root = model._root,
            args = Array.prototype.slice.call(arguments),
            selector = args[args.length - 1];

        selector = typeof selector === "function" ? args.pop() : undefined;

        return ModelResponse.create(function(options) {

            var onNext = options.onNext.bind(options),
                onError = options.onError.bind(options),
                onCompleted = options.onCompleted.bind(options),
                isProgressive = options.isProgressive,
                valuesCount = selector && selector.length || 0;
            var operationalName = name;
            var disposed = false;
            var hasSelector = !!selector;
            var format = hasSelector && 'AsJSON' || options.format || 'AsPathMap';
            var isJSONG = format === 'AsJSONG';
            var seedRequired = isSeedRequired(format);
            var isValues = format === 'AsValues';
            var pathSetValues = [];
            var errors = [];
            var indices = [];
            var undefineds = [];
            var jsongPaths = [];
            var errorSelector = options.errorSelector || model._errorSelector;
            var atLeastOneValue = false;
            var shouldRequest = true;
            var shouldRoute = true;
            var isSlave = !!(model._dataSource || model._router);
            var routeMisses = {};
            var isFirstSet = name === 'set' && isSlave;
            var firstSetJSONGPaths;
            var firstSetModel = model;
            var firstSetRequested = [];

            if (hasSelector) {
                for (var i = 0; i < args.length; i++) {
                    if (i < valuesCount) {
                        pathSetValues[pathSetValues.length] = {};
                    }
                    undefineds[undefineds.length] = false;
                    indices[indices.length] = i;
                }
            } else if (seedRequired) {
                pathSetValues[0] = {};
                undefineds[0] = true;
            }

            function recurse(requested, relativePathSetValues) {
                if (disposed) { return; }
                var setSeed = false;

                // Note: We have to swap seeds for the first set since we must enforce jsong.
                // TODO: This does not consider setProgressively.
                if (isFirstSet) {
                    setSeed = [{}];

                    // If there is a bound path then we have to do some real magik
                    if (model._path && model._path.length) {
                        firstSetModel = model.clone(['_path', []]);
                    }
                }

                var operations = getOperationArgGroups(
                    model, requested, operationalName,
                    format, setSeed || relativePathSetValues, hasSelector,
                    !isFirstSet && isValues && onNext, errorSelector,
                    isFirstSet, model._path);
                var results = processOperations(
                    isFirstSet && firstSetModel || model, operations);
                isFirstSet && (firstSetJSONGPaths = []);

                errors = errors.concat(results.errors);
                atLeastOneValue = atLeastOneValue || results.valuesReceived;

                if (isFirstSet) {
                    operations.forEach(function(op) {
                        firstSetJSONGPaths = firstSetJSONGPaths.concat(op.values[0].paths);
                    });
                }
                var nextRequest = results.requestedMissingPaths;
                var missingLength = nextRequest.length;

                // There is never missing paths on a set since we set through values
                if (isFirstSet) {
                    missingLength = 1;
                    nextRequest = {jsong: setSeed[0], paths: firstSetJSONGPaths};
                }

                // no need to inform the user of the current state if in value mode
                if (isProgressive && missingLength && !isValues) {
                    emitValues();
                }

                // We access the router first before going off to the source.
                if (missingLength && model._router && shouldRoute) {
                    routerRecurse(nextRequest, results, relativePathSetValues);
                }

                // We contine looking into the modelSource if the router does not exist / shouldRoute
                // is no longer true.
                else if (missingLength && shouldRequest && model._dataSource) {
                    modelSourceRequest(nextRequest, results, relativePathSetValues);
                }

                // Once we have exhausted all external resources or found all data we
                // emit values and complete.
                else {
                    emitValues();
                    executeOnErrorOrCompleted();
                }
            }

            function routerRecurse(nextRequest, results, relativePathSetValues) {
                var incomingValues;
                var optPaths = results.optimizedMissingPaths;
                for (var i = 0; i < nextRequest.length; i++) {
                    nextRequest[i]._routerIndex = i;
                    optPaths[i]._routerIndex = i;
                }
                var opts = optPaths.filter(function(p) { return !PathLibrary.simplePathInMap(p, routeMisses); });
                if (opts.length && opts.length !== optPaths.length) {
                    var optMap = opts.reduce(function(acc, o) {
                        acc[o._routerIndex] = true;
                        return acc;
                    }, {});
                    nextRequest = nextRequest.filter(function(r) { return optMap[r._routerIndex]; });
                }

                if (opts.length) {
                    model._router[name](opts).
                        subscribe(function(jsongEnv) {
                            incomingValues = jsongEnv;
                            incomingValues.paths = nextRequest;
                        }, function(err) {
                            // TODO: Should this ever happen?
                        }, function() {
                            opts.forEach(function(p) { PathLibrary.pathToMap(p, routeMisses); });
                            completeRecursion(nextRequest, incomingValues, relativePathSetValues);
                        });
                } else {

                    // TODO: support both router and modelSource (note selector functions).
                    shouldRoute = false;
                    shouldRequest = false;
                    completeRecursion([], {jsong: {}, paths: [[]]}, relativePathSetValues);
                }
            }

            function modelSourceRequest(nextRequest, results, relativePathSetValues) {
                var incomingValues;
                var requestedPaths = isFirstSet ? nextRequest.paths : nextRequest;
                var observer = {
                    onNext: function(jsongEnvelop) {
                        incomingValues = jsongEnvelop;
                    },
                    onError: function(err) {
                        // When an error is thrown, all currently requested paths are
                        // inserted as errors and the output format is not needed.
                        // TODO: There must be a way to make this more efficient.
                        var out = model._setPathsAsValues.apply(null, [model].concat(
                            requestedPaths.
                                reduce(function(acc, r) {
                                    acc[0].push({
                                        path: r,
                                        value: err
                                    });
                                    return acc;
                                }, [[]]),
                            undefined,
                            model._errorSelector
                        ));
                        errors = errors.concat(out.errors);

                        // there could still be values within the cache
                        emitValues();
                        executeOnErrorOrCompleted();
                    },
                    onCompleted: function() {
                        shouldRequest = false;
                        completeRecursion(requestedPaths, incomingValues, relativePathSetValues);
                    }
                };

                if (name === 'set') {
                    model._request.set(nextRequest, observer);
                } else {
                    model._request.get(nextRequest, results.optimizedMissingPaths, observer);
                }
            }

            function completeRecursion(requestedPaths, incomingValues, relativePathSetValues) {
                var out = getOperationsPartitionedByPathIndex(
                    requestedPaths,
                    incomingValues,
                    indices,
                        !isFirstSet && hasSelector,
                        isFirstSet || seedRequired,
                    valuesCount,
                    isFirstSet,
                    args,
                    model._path
                );

                var newOperations = out.ops;
                indices = out.indices;

                operationalName = 'set';
                isFirstSet = false;

                // Note: We do not request missing paths again.
                if (hasSelector) {
                    var arr = [];
                    for (var i = 0; i < indices.length; i++) {
                        arr[arr.length] = relativePathSetValues[indices[i]];
                    }
                    recurse(newOperations, arr);
                } else if (seedRequired) {
                    recurse(newOperations, pathSetValues);
                } else {
                    recurse(newOperations, []);
                }
            }

            try {
                recurse(args, pathSetValues);
            } catch(e) {
                errors = [e];
                executeOnErrorOrCompleted();
            }

            function emitValues() {
                if (disposed) {
                    return;
                }

                root.allowSync = true;
                if (atLeastOneValue) {
                    if (hasSelector) {
                        if (valuesCount > 0) {
                            // they should be wrapped in json items
                            onNext(selector.apply(model, pathSetValues.map(function(x, i) {
                                if (undefineds[i]) {
                                    return undefined;
                                }

                                return x && x.json;
                            })));
                        } else {
                            onNext(selector.call(model));
                        }
                    } else if (!isValues && !model._progressive) {
                        // this means there is an onNext function that is not AsValues or progressive,
                        // therefore there must only be one onNext call, which should only be the 0
                        // index of the values of the array
                        onNext(pathSetValues[0]);
                    }
                }
                root.allowSync = false;
            }

            function executeOnErrorOrCompleted() {
                if (disposed) {
                    return;
                }

                root.allowSync = true;
                if (errors.length) {
                    onError(errors);
                } else {
                    onCompleted();
                }
                root.allowSync = false;
            }

            return {
                dispose: function() {
                    disposed = true;
                }
            };
        });
    }
}

function fastCollapse(paths) {
    return paths.reduce(function(acc, p) {
        var curr = acc[0];
        if (!curr) {
            acc[0] = p;
        } else {
            p.forEach(function(v, i) {
                // i think
                if (typeof v === 'object') {
                    v.forEach(function(value) {
                        curr[i][curr[i].length] = value;
                    });
                }
            });
        }
        return acc;
    }, []);
}

falcor.__Internals.fastCollapse = fastCollapse;

// TODO: There is a performance win.  If i request from the core the requested paths,
// then i should not have to collapse the JSON paths.
function convertArgumentsToFromJSONG(args, remoteMessage, boundPath) {
    var newArgs = [];
    for (var i = 0, len = args.length; i < len; i++) {
        var argI = args[i];
        var paths;
        if (isJSONG(argI)) {
            paths = argI.paths;
        } else if (isPathOrPathValue(argI)) {
            paths = [argI.path || argI];
        } else {
            paths = collapse(argI);
        }
        newArgs[newArgs.length] = {
            jsong: remoteMessage.jsong,
            paths: paths,
            boundPath: boundPath && boundPath.length && boundPath || undefined
        };
    }


    return newArgs;
}

function getOperationsPartitionedByPathIndex(requestedPaths, incomingValues, previousIndices, hasSelector, seedRequired, valuesCount, isFirstSet, originalArgs, boundPath) {
    var newOperations = [];
    var indices = [];

    if (isFirstSet) {
        indices = previousIndices;
        newOperations = convertArgumentsToFromJSONG(originalArgs, incomingValues, boundPath);
    } else {
        requestedPaths.forEach(function (r) {
            var op = newOperations[newOperations.length - 1];
            if (!op) {
                op = newOperations[newOperations.length] = {jsong: incomingValues.jsong, paths: []};
            }
            if (hasSelector) {
                if (typeof r.pathSetIndex !== 'undefined') {
                    var pathSetIndex = r.pathSetIndex;
                    var absoluteIndex = previousIndices[pathSetIndex];
                    var hasIndex = typeof absoluteIndex === 'number' && absoluteIndex < valuesCount;
                    if (op && op.pathSetIndex !== pathSetIndex && typeof op.pathSetIndex !== 'undefined') {
                        if (op && op.paths.length > 1) {
                            op.paths = fastCollapse(op.paths);
                        }
                        op = newOperations[newOperations.length] = {jsong: incomingValues.jsong, paths: []};
                        op.pathSetIndex = pathSetIndex;
                        hasIndex && (indices[indices.length] = absoluteIndex);
                    } else if (typeof op.pathSetIndex === 'undefined') {
                        hasIndex && (op.pathSetIndex = pathSetIndex);
                        hasIndex && (indices[indices.length] = absoluteIndex);
                    }
                }
            } else if (seedRequired) {
                // single seed white board
            } else {
                // isValues
            }
            op.paths[op.paths.length] = r;
            op.boundPath = op.boundPath || boundPath && boundPath.length && boundPath || undefined;
        });

        // Note: We have fast collapsed all operations at their closing for the next operation.
        // so the last one needs to be collapsed
        if (hasSelector) {
            var op = newOperations[newOperations.length - 1];
            if (op && op.paths.length > 1) {
                op.paths = fastCollapse(op.paths);
            }
        }
    }

    return {ops: newOperations, indices: indices};
}

function getOperationArgGroups(model, ops, name, format, values, hasSelector, onNext, errorSelector, isFirstSet, boundPath) {
    var opFormat = (isFirstSet && 'AsJSONG' || format);
    var seedRequired = isSeedRequired(opFormat);
    var isValues = !seedRequired;
    var valuesIndex = 0, valueEnvelope;
    return ops.
        map(cloneIfPathOrPathValue).
        reduce(function(groups, argument, index) {
            var group = groups[groups.length - 1],
                type  = isPathOrPathValue(argument) ? "PathSets" :
                    isJSONG(argument) ? "JSONGs" : "PathMaps",
                groupType = group && group.type,
                methodName = name + type + opFormat;

            var op = model['_' + methodName];

            if (type !== groupType) {
                group = groups[groups.length] = [];
            }

            group.boundPath = type === "JSONGs" && argument.boundPath || undefined;

            if (groupType === null || type !== groupType) {
                group.methodName = methodName;
                group.format = opFormat;
                group.type = type;
                group.op = op;
                group.isSeedRequired = seedRequired;
                group.isValues = isValues;
                group.values = [];
                group.onNext = onNext;
                group.valuesOffset = valuesIndex;
                group.errorSelector = errorSelector;
            }

            if (isFirstSet && boundPath && boundPath.length) {
                group[group.length] = appendBoundPathToArgument(boundPath, argument, type);
            } else {
                group[group.length] = argument;
            }

            valueEnvelope = values[valuesIndex];
            // TODO: There is no consideration of isFirstSet which is required.
            if (hasSelector && valuesIndex < values.length) {
                group.values.push(valueEnvelope);
                valuesIndex++;
            } else if (seedRequired) {
                group.values[0] = values[0];
            }

            return groups;
        }, []);
}

function appendBoundPathToArgument(boundPath, argument, type) {
    // Clones on PathValues so we can mutate.
    if (type === 'Paths') {
        if (argument.path) {
            argument.path = boundPath.concat(argument.path);
            return argument;
        }
        return boundPath.concat(argument);
    }

    else if (type === 'PathMaps') {
        var prefix = {};
        var curr = prefix;
        for (var i = 0, len = boundPath.length; i < len - 1; i++) {
            curr[boundPath[i]] = {};
            curr = curr[boundPath[i]];
        }

        prefix[boundPath[i]] = argument;
        return prefix;
    }

    var paths = [];
    for (var i = 0, len = argument.paths.length; i < len; i++) {
        paths[paths.length] = boundPath.concat(argument.paths[i]);
    }
    return {jsong: argument.jsong, paths: paths};
}

function processOperations(model, operations) {
    // no value has to be kept track of since its all in the 'values' array that is attached
    // to each operation
    return operations.reduce(function(memo, operation) {

        var boundPath = model._path;

        if(boundPath.length > 0 && operation.format === "AsJSONG") {
            throw new Error("It is not legal to use the JSON Graph format from a bound Model. JSON Graph format can only be used from a root model.");
        }

        var results = operation.isValues ?
            operation.op(model, operation, operation.onNext, operation.errorSelector, operation.boundPath) :
            operation.op(model, operation, operation.values, operation.errorSelector, operation.boundPath);
        var missing = results.requestedMissingPaths;
        var offset = operation.valuesOffset;

        for (var i = 0, len = missing.length; i < len; i++) {
            missing[i].boundPath = boundPath;
            missing[i].pathSetIndex += offset;
        }

        memo.requestedMissingPaths = memo.requestedMissingPaths.concat(missing);
        memo.optimizedMissingPaths = memo.optimizedMissingPaths.concat(results.optimizedMissingPaths);
        memo.errors = memo.errors.concat(results.errors);
        memo.valuesReceived = memo.valuesReceived || results.requestedPaths.length > 0;

        return memo;
    }, {
        errors: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: [],
        valuesReceived: false
    });
}

function not() {
    var fns = Array.prototype.slice.call(arguments);
    return function() {
        var args = arguments;
        return !fns.every(function(fn) {
            return fn.apply(null, args);
        });
    };
}

function isPathOrPathValue(x) {
    return !!(Array.isArray(x)) || (
        x.hasOwnProperty("path") && x.hasOwnProperty("value"));
}

function isJSONG(x) {
    return x.hasOwnProperty("jsong");
}

function isSeedRequired(format) {
    return format === 'AsJSON' || format === 'AsJSONG' || format === 'AsPathMap';
}

function cloneIfPathOrPathValue(x) {
    return (Array.isArray(x) && x.concat()) || (
        x.hasOwnProperty("path") && x.hasOwnProperty("value") && (
        x.path = x.path.concat()) && x || x) || x;
}

