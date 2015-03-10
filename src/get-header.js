function F_getAsValues(model, paths, onNext) {
    var result = _output();
    var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';

    for (var i = 0, len = paths.length; i < len; i++) {
        walk(model, model._cache, model._cache, paths[0], 0, onNext, null, result, [], [], inputFormat, 'Values');
    }

    return result;
}

function F_getAsPathMap(model, paths, values) {
    var result = _output();
    var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
    var valueNode;
    if (values && values.length === 1) {
        valueNode = {json: values[0]};
        result.values = [valueNode];
        valueNode = valueNode.json;
    }

    for (var i = 0, len = paths.length; i < len; i++) {
        walk(model, model._cache, model._cache, paths[i], 0, valueNode, [], result, [], [], inputFormat, 'PathMap');
    }

    // is this correct?
    if (result.requestedPaths.length === 0) {
        result.values = [null];
    }

    return result;
}

function F_getAsJSON(model, paths, values) {
    var result = _output();
    var inputFormat = Array.isArray(paths[0]) ? 'Paths' : 'JSON';
    if (values) {
        result.values = values;
    } else {
        values = [];
    }

    for (var i = 0, len = paths.length; i < len; i++) {
        var valueNode;
        if (values[i]) {
            valueNode = values[i];
        }
        walk(model, model._cache, model._cache, paths[i], 0, valueNode, [], result, [], [], inputFormat, 'JSON');
    }

    if (result.requestedPaths.length === 0) {
        result.values = [null];
    }

    return result;
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
