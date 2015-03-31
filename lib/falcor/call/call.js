var ModelResponse = require('./../ModelResponse');
function call(path, args, suffixes, paths, selector) {

    var model = this;
    args && Array.isArray(args) || (args = []);
    suffixes && Array.isArray(suffixes) || (suffixes = []);
    paths = Array.prototype.slice.call(arguments, 3);
    if (typeof (selector = paths[paths.length - 1]) !== "function") {
        selector = undefined;
    } else {
        paths = paths.slice(0, -1);
    }

    return ModelResponse.create(function (options) {

        var rootModel = model.clone(["_path", []]),
            localRoot = rootModel.withoutDataSource(),
            dataSource = model._dataSource,
            boundPath = model._path,
            callPath = boundPath.concat(path),
            thisPath = callPath.slice(0, -1);

        var disposable = model.
            getValue(path).
            flatMap(function (localFn) {
                if (typeof localFn === "function") {
                    return Rx.Observable.return(localFn.
                        apply(rootModel.bindSync(thisPath), args).
                        map(function (pathValue) {
                            return {
                                path: thisPath.concat(pathValue.path),
                                value: pathValue.value
                            };
                        }).
                        toArray().
                        flatMap(function (pathValues) {
                            return localRoot.set.
                                apply(localRoot, pathValues).
                                toJSONG();
                        }).
                        flatMap(function (envelope) {
                            return rootModel.get.apply(rootModel,
                                envelope.paths.reduce(function (paths, path) {
                                    return paths.concat(suffixes.map(function (suffix) {
                                        return path.concat(suffix);
                                    }));
                                }, []).
                                    concat(paths.reduce(function (paths, path) {
                                        return paths.concat(thisPath.concat(path));
                                    }, []))).
                                toJSONG();
                        }));
                }
                return Rx.Observable.empty();
            }).
            defaultIfEmpty(dataSource.call(path, args, suffixes, paths)).
            mergeAll().
            subscribe(function (envelope) {
                var invalidated = envelope.invalidated;
                if (invalidated && invalidated.length) {
                    invalidatePaths(rootModel, invalidated, undefined, model._errorSelector);
                }
                disposable = localRoot.
                    set(envelope, function () {
                        return model;
                    }).
                    subscribe(function (model) {
                        var getPaths = envelope.paths.map(function (path) {
                            return path.slice(boundPath.length);
                        });
                        if (selector) {
                            getPaths[getPaths.length] = function () {
                                return selector.call(model, getPaths);
                            };
                        }
                        disposable = model.get.apply(model, getPaths).subscribe(options);
                    });
            });

        return {
            dispose: function () {
                disposable && disposable.dispose();
                disposable = undefined;
            }
        };
    });
}
