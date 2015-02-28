var FModel = function(cache) {
    this._cache = cache;
    this._boxed = false;
    this._root = {size: 0};
};

FModel.prototype = {
    _getPathsAsValues: F_getPathsAsValues,
    _getPathsAsPathMap: F_getPathsAsPathMap
};
function F_getPathsAsValues(model, paths, onNext) {
    var result = {
        values: [],
        errors: [],
        requestedPaths: [],
        optimizedPaths: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: []
    };

    paths.forEach(function(p) {
        walk(model, model._cache, model._cache, p, 0, onNext, null, result, [], [], 'Values');
    });

    return result;
}

function F_getPathsAsPathMap(model, paths, values) {
    var result = {
        values: [],
        errors: [],
        requestedPaths: [],
        optimizedPaths: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: []
    };
    var valueNode;
    if (values && values.length === 1) {
        valueNode = {json: values[0]};
        result.values = [valueNode];
        valueNode = valueNode.json;
    }

    paths.forEach(function(p) {
        walk(model, model._cache, model._cache, p, 0, valueNode, [], result, [], [], 'PathMap');
    });

    // is this correct?
    if (result.requestedPaths.length === 0) {
        result.values = [null];
    }

    return result;
}


function now() {
    return Date.now();
}

if (typeof module !== 'undefined') {
    module.exports = FModel;
    if (require.main === module) {
        var Cache = require('./test/data/Cache');
        var model = new FModel(Cache());

        var results = model._getPathsAsValues(model, [['genreList', 0, 0, 'summary']], function(x) {
            debugger;
        });
        debugger;
    }
}
