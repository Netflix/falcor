module.exports = function(walk) {
    return function getAsJSON(model, paths, values) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
        if (values) {
            results.values = values;
        } else {
            values = [];
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            var valueNode;
            if (values[i]) {
                valueNode = values[i];
            }
            walk(model, model._cache, model._cache, paths[i], 0, valueNode, [], results, [], [], inputFormat, 'JSON');
        }

        if (results.requestedPaths.length === 0) {
            results.values = [null];
        }
        return results;
    };
};

