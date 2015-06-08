var noop = require("falcor/support/noop");
var Rx = require("falcor-observable");
var pathSyntax = require('falcor-path-syntax');
var InvalidModelError = require('falcor/errors/InvalidModelError');

module.exports = function bind(boundPath) {
    var model = this;
    var root = model._root;
    var paths = new Array(arguments.length - 1);
    var argsIndex = -1;
    var argsCount = arguments.length - 1;

    boundPath = pathSyntax.fromPath(boundPath);

    while(++argsIndex < argsCount) {
        paths[argsIndex] = pathSyntax.fromPath(arguments[argsIndex + 1]);
    }

    if(root.allowSync <= 0 && argsCount === 0) {
        throw new Error("Model#bind requires at least one value path.");
    }

    var syncBoundModelObs = Rx.Observable.create(function(observer) {
        var error;
        var boundModel;
        root.allowSync++;
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
        --root.allowSync;
    });

    return syncBoundModelObs.
        flatMap(function(boundModel) {
            if(paths.length > 0) {
                return boundModel.get.apply(boundModel, paths.concat(function() {
                    return boundModel;
                })).
                catchException(Rx.Observable.empty());
            }
            return Rx.Observable.returnValue(boundModel);
        }).
        catchException(function(e) {

            if (e instanceof InvalidModelError) {
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
            return Rx.Observable.empty();
        });
};
