var Rx = require("rx/dist/rx");
var pathSyntax = require("falcor-path-syntax");

module.exports = function deref(boundPathArg) {

    var model = this;
    var pathsIndex = -1;
    var pathsCount = arguments.length - 1;
    var paths = new Array(pathsCount);

    var boundPath = pathSyntax.fromPath(boundPathArg);

    while (++pathsIndex < pathsCount) {
        paths[pathsIndex] = pathSyntax.fromPath(arguments[pathsIndex + 1]);
    }

    if (pathsCount === 0) {
        throw new Error("Model#deref requires at least one value path.");
    }

    return Rx.Observable.defer(function() {
        return derefSync(model, boundPath);
    }).
    flatMap(function(boundModel) {
        if (Boolean(boundModel)) {
            if (pathsCount > 0) {
                var ofBoundModel = Rx.Observable.of(boundModel);

                return boundModel.get.
                    apply(boundModel, paths).
                    catch(ofBoundModel).
                    concat(ofBoundModel).
                    last();
            }
            return Rx.Observable.return(boundModel);
        } else if (pathsCount > 0) {
            var modifiedPaths = paths.map(function(path) {
                return boundPath.concat(path);
            });

            // Fill the cache with the request.
            return model.
                get.apply(model, modifiedPaths).

                // We concat the deref sync operation afterwords.
                // Any errors will be forwarded onto the caller.
                concat(Rx.Observable.defer(function() {
                    return derefSync(model, boundPath);
                })).
                last().

                // 'x' has to exist.  Cannot be falsy.  Must be model.
                filter(function(x) { return x });
        }
        return Rx.Observable.empty();
    });
};

function derefSync(model, boundPath) {
    var value;
    var errorHappened = false;
    try {
        ++model._root.syncRefCount;
        value = model._derefSync(boundPath);
    } catch (e) {
        value = e;
        errorHappened = true;
    } finally {
        --model._root.syncRefCount;
    }
    return errorHappened ?
        Rx.Observable.throw(value) :
        Rx.Observable.return(value);
}
