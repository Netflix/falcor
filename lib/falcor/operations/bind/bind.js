var pathSyntax = require('falcor-path-syntax');
var falcor = require('./../../Falcor');
var noop = function() {};

module.exports = function bind(boundPath) {
    var model = this, root = model._root,
        paths = new Array(arguments.length - 1),
        i = -1, n = arguments.length - 1;

    boundPath = pathSyntax.fromPath(boundPath);

    while(++i < n) {
        paths[i] = pathSyntax.fromPath(arguments[i + 1]);
    }

    if(root.allowSync <= 0 && n === 0) {
        throw new Error("Model#bind requires at least one value path.");
    }

    var syncBoundModelObs = falcor.Observable.create(function(observer) {
        var error;
        var boundModel;
        root.allowSync++;
        try {
            boundModel = model.bindSync(boundPath);
        } catch(e) {
            error = e;
        }
        if(boundModel && !error) {
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
                catchException(falcor.Observable.empty());
            }
            return falcor.Observable.returnValue(boundModel);
        }).
        catchException(function() {
            if(paths.length > 0) {
                var boundPaths = paths.map(function(path) {
                    return boundPath.concat(path);
                });
                boundPaths.push(noop);
                return model.get.
                    apply(model, boundPaths).
                    flatMap(model.bind(boundPath));
            }
            return falcor.Observable.empty();
        });
};
