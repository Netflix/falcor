var FModel = function(cache) {
    this._cache = cache;
    this._boxed = false;
    this._root = {size: 0};
};

FModel.prototype = {
    _getAsValues: F_getAsValues,
    _getAsPathMap: F_getAsPathMap,
    _getAsJSON: F_getAsJSON
};
function F_getAsValues(model, paths, onNext) {
    var result = _output();

    paths.forEach(function(p) {
        walk(model, model._cache, model._cache, p, 0, onNext, null, result, [], [], 'Values');
    });

    return result;
}

function F_getAsPathMap(model, paths, values) {
    var result = _output();
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

function F_getAsJSON(model, paths, values) {
    var result = _output();
    if (values) {
        result.values = values;
    }

    paths.forEach(function(p, i) {
        var valueNode;
        if (values[i]) {
            valueNode = values[i];
        }
        walk(model, model._cache, model._cache, p, 0, valueNode, [], result, [], [], 'JSON');
    });

    if (result.requestedPaths.length === 0) {
        result.values = [null];
    }

    return result;
}


function now() {
    return Date.now();
}

function _output() {
    return {
        values: [],
        errors: [],
        requestedPaths: [],
        optimizedPaths: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: []
    };
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
