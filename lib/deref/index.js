var Rx = require("rx/dist/rx");
var pathSyntax = require("falcor-path-syntax");

module.exports = function deref(boundPathArg) {

    var model = this;
    var modelRoot = model._root;
    var pathsIndex = -1;
    var pathsCount = arguments.length - 1;
    var paths = new Array(pathsCount);

    var boundPath = pathSyntax.fromPath(boundPathArg);

    while (++pathsIndex < pathsCount) {
        paths[pathsIndex] = pathSyntax.fromPath(arguments[pathsIndex + 1]);
    }

    if (modelRoot.syncRefCount <= 0 && pathsCount === 0) {
        throw new Error("Model#deref requires at least one value path.");
    }

    return Rx.Observable.defer(function() {
        var value;
        var errorHappened = false;
        try {
            ++modelRoot.syncRefCount;
            value = model._derefSync(boundPath);
        } catch (e) {
            value = e;
            errorHappened = true;
        } finally {
            --modelRoot.syncRefCount;
            return errorHappened ?
                Rx.Observable.throw(value) :
                Rx.Observable.return(value);
        }
    }).
    flatMap(function(boundModel) {
        if (Boolean(boundModel)) {
            if (pathsCount > 0) {
                return boundModel.get.
                    apply(boundModel, paths).
                    map(function() {
                        return boundModel;
                    }).
                    catch(Rx.Observable.empty());
            }
            return Rx.Observable.return(boundModel);
        } else if (pathsCount > 0) {
            return model.
                get.apply(model, paths.map(function(path) {
                    return boundPath.concat(path);
                })).
                map(function() {
                    return model.deref(boundPath);
                }).
                mergeAll();
        }
        return Rx.Observable.empty();
    });
};
