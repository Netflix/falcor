var getBoundValue = require('./getBoundValue');
module.exports = function(walk) {
    return function getAsJSONG(model, paths, values) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
        if (values && values.length === 1 && !values[0].jsong) {
            values[0].jsong = {};
            values[0].paths = [];
            results.values = values;
        }
        var cache = model._cache;
        if (model._path.length) {
            throw 'Cannot get JSONG while bound to a path.';
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            walk(model, cache, cache, paths[i], 0, values[0], [], results, [], [], inputFormat, 'JSONG');
        }

        if (results.requestedPaths.length === 0) {
            results.values = [null];
        }
        return results;
    };
};

