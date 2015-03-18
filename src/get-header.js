function get(getFlavor) {
    return function innerGet(model, paths, valuesOrOnNext, errorSelector) {
        var results = _output();
        var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
        
        getFlavor(model, paths, valuesOrOnNext, inputFormat, results);
        
        if (errorSelector && results.errors.length) {
            var e, errors = results.errors;
            for (var i = 0, len = errors.length; i < len; i++) {
                e = errors[i];
                e.value = errorSelector(e.path, e.value);
            }
        }
        
        return results;
    };
}
function getAsValues(model, paths, onNext, inputFormat, results) {
    for (var i = 0, len = paths.length; i < len; i++) {
        walk(model, model._cache, model._cache, paths[0], 0, onNext, null, results, [], [], inputFormat, 'Values');
    }
}

function getAsPathMap(model, paths, values, inputFormat, results) {
    var valueNode;
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
}

function getAsJSON(model, paths, values, inputFormat, results) {
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
}

function getAsJSONG(model, paths, values, inputFormat, results) {
    var valueNode, jsong;
    if (values && values.length === 1 && !values[0].jsong) {
        jsong = {jsong: values[0], paths: []};
        results.values = [jsong];
        valueNode = jsong.jsong;
    } else {
        jsong = values[0];
        valueNode = jsong.jsong;
    }

    for (var i = 0, len = paths.length; i < len; i++) {
        walk(model, model._cache, model._cache, paths[i], 0, jsong, [], results, [], [], inputFormat, 'JSONG');
    }

    if (results.requestedPaths.length === 0) {
        results.values = [null];
    }
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
