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

    var fullPaths = paths.map(function(x) {
        return boundPath.concat(x);
    });

    if (modelRoot.syncRefCount <= 0 && pathsCount === 0) {
        throw new Error("Model#deref requires at least one value path.");
    }

    // First prefetch all the data then makes the
    return model.
        get.apply(model, fullPaths).
        catch(Rx.Observable.empty()).
        concat(Rx.Observable.defer(function() {
            return derefSync(model, boundPath);
        })).
        takeLast(1).
        filter(function(x) {
            return x !== undefined;
        });
};

function derefSync(model, derefPath) {
    var value;
    var errorHappened = false;
    try {
        ++model._root.syncRefCount;
        value = model._derefSync(derefPath);
    } catch (e) {
        value = e;
        errorHappened = true;
    } finally {
        --model._root.syncRefCount;
    }

    if (errorHappened) {
        return Rx.Observable.throw(value);
    }
    return Rx.Observable.return(value);
}
