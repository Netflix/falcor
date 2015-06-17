var noop = require("falcor/support/noop");
var Rx = require("rx/dist/rx");;
var is_path_value = require('falcor/support/is-path-value');
var pathSyntax = require('falcor-path-syntax');
var InvalidModelError = require('falcor/errors/InvalidModelError');

module.exports = function bind(boundPath) {

    var model = this;
    var modelRoot = model._root;
    var pathsIndex = -1;
    var pathsCount = arguments.length - 1;
    var paths = new Array(pathsCount);

    boundPath = pathSyntax.fromPath(boundPath);

    while(++pathsIndex < pathsCount) {
        paths[pathsIndex] = pathSyntax.fromPath(arguments[pathsIndex + 1]);
    }

    if(modelRoot.syncRefCount <= 0 && pathsCount === 0) {
        throw new Error("Model#bind requires at least one value path.");
    }

    return Rx.Observable.defer(function() {
        var value;
        var errorHappened = false;
        try {
            ++modelRoot.syncRefCount;
            value = model.bindSync(boundPath);
        } catch(e) {
            value = e;
            errorHappened = true;
        } finally {
            --modelRoot.syncRefCount;
            return errorHappened ?
                Rx.Observable["throw"](value) :
                Rx.Observable["return"](value)
        }
    }).
    flatMap(function(boundModel) {
        if(Boolean(boundModel)) {
            if(pathsCount > 0) {
                return boundModel.get.apply(boundModel, paths.concat(function() {
                    return boundModel;
                }))["catch"](Rx.Observable.empty());
            }
            return Rx.Observable["return"](boundModel);
        } else if(pathsCount > 0) {
            return model.get.apply(model, paths.map(function(path) {
                    return boundPath.concat(path);
                }).concat(function() {
                    return model.bindSync(boundPath);
                }));
        }
        return Rx.Observable.empty();
    });
};
