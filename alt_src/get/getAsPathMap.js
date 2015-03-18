var walk = require('./getWalk');

module.exports = function getAsPathMap(model, paths, values) {
    var valueNode;
    var results = {
        values: [],
        errors: [],
        requestedPaths: [],
        optimizedPaths: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: []
    };
    var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
    if (values && values.length === 1) {
        valueNode = {json: values[0]};
        results.values = [valueNode];
        valueNode = valueNode.json;
    }

    for (var i = 0, len = paths.length; i < len; i++) {
        walk(model, model._cache, model._cache, paths[i], 0, valueNode, [], results, [], [], inputFormat, 'PathMap');
    }

    if (results.requestedPaths.length === 0) {
        results.values = [null];
    }
    return results;
}

