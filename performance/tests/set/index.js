module.exports = {
    simple: simple,
    reference: reference
};

function simple(model, format) {
    var simpleRequest = [{
        path: ['videos', 1234, 'summary'],
        value: 42
    }];
    var value = 42;
    switch (format) {
        case 'JSON':
            return function() {
                model._setPathSetsAsJSON(model, simpleRequest, [{}]);
            };
        case 'JSONG':
            return function() {
                model._setPathSetsAsJSONG(model, simpleRequest, [{}]);
            };
        case 'PathMap':
            return function() {
                model._setPathSetsAsPathMap(model, simpleRequest, [{}]);
            };
        case 'Value':
            return function() {
                model._setPathSetsAsValues(model, simpleRequest, []);
            };
    }
}
function reference(model, format) {
    var referenceRequest = [{
        path: ['genreList', 0, 0, 'summary'],
        value: 42
    }];
    switch (format) {
        case 'JSON':
            return function() {
                model._setPathSetsAsJSON(model, referenceRequest, [{}]);
            };
        case 'JSONG':
            return function() {
                model._setPathSetsAsJSONG(model, referenceRequest, [{}]);
            };
        case 'PathMap':
            return function() {
                model._setPathSetsAsPathMap(model, referenceRequest, [{}]);
            };
        case 'Value':
            return function() {
                model._setPathSetsAsValues(model, referenceRequest, []);
            };
    }
}
