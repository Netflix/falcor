var noop = require("falcor/support/noop");
var Rx = require("falcor-observable");
var is_path_value = require('falcor/support/is-path-value');
var pathSyntax = require('falcor-path-syntax');
var InvalidModelError = require('falcor/errors/InvalidModelError');

module.exports = function bind(boundPath) {
    var model = this;
    var modelRoot = model._root;
    var paths = new Array(arguments.length - 1);
    var argsIndex = -1;
    var argsCount = arguments.length - 1;

    boundPath = pathSyntax.fromPath(boundPath);

    while(++argsIndex < argsCount) {
        paths[argsIndex] = pathSyntax.fromPath(arguments[argsIndex + 1]);
    }

    if(modelRoot.syncRefCount <= 0 && argsCount === 0) {
        throw new Error("Model#bind requires at least one value path.");
    }

    var syncBoundModelObs = Rx.Observable.create(function(observer) {
        var error;
        var boundModel;
        modelRoot.syncRefCount++;
        try {
            boundModel = model.bindSync(boundPath);
        } catch(e) {
            error = e;
        }
        if (boundModel && !error) {
            observer.onNext(boundModel);
            observer.onCompleted();
        } else {
            observer.onError(error);
        }
        --modelRoot.syncRefCount;
    });

    return syncBoundModelObs.
        flatMap(function(boundModel) {
            if(paths.length > 0) {
                return boundModel.get.apply(boundModel, paths.concat(function() {
                    return boundModel;
                }))[
                "catch"](Rx.Observable.empty());
            }
            return Rx.Observable["return"](boundModel);
        })[
        "catch"](function(e) {

            if(e instanceof InvalidModelError) {
                throw e;
            }

            if(paths.length > 0) {
                var boundPaths = paths.map(function(path) {
                    return boundPath.concat(path);
                });
                boundPaths.push(noop);
                return model.get.
                    apply(model, boundPaths).
                    flatMap(model.bind(boundPath));
            }

            return Rx.Observable["throw"]([e]);
        });
};
