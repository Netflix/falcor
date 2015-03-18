var walk = require('./getWalk');

module.exports = function getAsValues(model, paths, onNext) {
    var results = {
        values: [],
        errors: [],
        requestedPaths: [],
        optimizedPaths: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: []
    };
    var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';

    for (var i = 0, len = paths.length; i < len; i++) {
        walk(model, model._cache, model._cache, paths[i], 0, onNext, null, results, [], [], inputFormat, 'Values');
    }
    return results;
}

