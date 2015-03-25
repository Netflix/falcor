module.exports = {
    startup: startup,
    scrollGallery: scrollGallery,
    simple: simple,
    reference: reference,
    complex: complex,
    syncSimple: syncSimple,
    syncReference: syncReference
};
var noOp = function() {};
function syncSimple(model) {
    return function() {
        model.getValueSync(['videos', 1234, 'summary'])
    }
}
function syncReference(model) {
    return function() {
        model.getValueSync(['videos', 1234, 'summary'])
    }
}

function startup(model, format) {
    var startupRequest = [ ["startup"], ["appconfig"], ["languages"], ["geolocation"], ["user"], ["uiexperience"], ["lolomo", "summary"], ["lolomo", {"to": 60}, "summary"], ["lolomo", 0, "billboardData"], ["lolomo", 0, 0, "postcard"], ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]], ["profilesList", {"to": 4}, "summary"], ["profilesList", "summary"], ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]], ["profilesList", "availableAvatarsList", {"to": 18}, "summary"], ["profilesList", "availableAvatarsList", "summary"], ["profiles", "hasSeenPromoGate"], ["lolomo", "maxExperience"], ["lolomo", 0, 0, "evidence"], ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]] ];
    switch (format) {
        case 'JSON':
            return function() {
                model._getPathSetsAsJSON(model, startupRequest, [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]);
            };
        case 'JSONG':
            return function() {
                model._getPathSetsAsJSONG(model, startupRequest, [{}]);
            };
        case 'PathMap':
            return function() {
                model._getPathSetsAsPathMap(model, startupRequest, [{}]);
            };
        case 'Value':
            return function() {
                model._getPathSetsAsValues(model, startupRequest, noOp);
            };
    }
}
function scrollGallery(model, format) {
    var scollingRequest = [
        ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
        ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
        ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
        ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
    ];
    for (var i = 0; i < 40;)
    switch (format) {
        case 'JSON':
            return function() {
                model._getPathSetsAsJSON(model, scollingRequest, [{},{},{},{}]);
            };
        case 'JSONG':
            return function() {
                model._getPathSetsAsJSONG(model, scollingRequest, [{}]);
            };
        case 'PathMap':
            return function() {
                model._getPathSetsAsPathMap(model, scollingRequest, [{}]);
            };
        case 'Value':
            return function() {
                model._getPathSetsAsValues(model, scollingRequest, noOp);
            };
    }
}

function simple(model, format) {
    var simpleRequest = [
        ['videos', 1234, 'summary']
    ];
    switch (format) {
        case 'JSON':
            return function() {
                model._getPathSetsAsJSON(model, simpleRequest, [{}]);
            };
        case 'JSONG':
            return function() {
                model._getPathSetsAsJSONG(model, simpleRequest, [{}]);
            };
        case 'PathMap':
            return function() {
                model._getPathSetsAsPathMap(model, simpleRequest, [{}]);
            };
        case 'Value':
            return function() {
                model._getPathSetsAsValues(model, simpleRequest, noOp);
            };
    }
}
function reference(model, format) {
    var referenceRequest = [
        ['genreList', 0, 0, 'summary']
    ];
    switch (format) {
        case 'JSON':
            return function() {
                model._getPathSetsAsJSON(model, referenceRequest, [{}]);
            };
        case 'JSONG':
            return function() {
                model._getPathSetsAsJSONG(model, referenceRequest, [{}]);
            };
        case 'PathMap':
            return function() {
                model._getPathSetsAsPathMap(model, referenceRequest, [{}]);
            };
        case 'Value':
            return function() {
                model._getPathSetsAsValues(model, referenceRequest, noOp);
            };
    }
}
function complex(model, format) {
    var complexRequest = [
        ['genreList', 0, {to:9}, 'summary']
    ];
    switch (format) {
        case 'JSON':
            return function() {
                model._getPathSetsAsJSON(model, complexRequest, [{}]);
            };
        case 'JSONG':
            return function() {
                model._getPathSetsAsJSONG(model, complexRequest, [{}]);
            };
        case 'PathMap':
            return function() {
                model._getPathSetsAsPathMap(model, complexRequest, [{}]);
            };
        case 'Value':
            return function() {
                model._getPathSetsAsValues(model, complexRequest, noOp);
            };
    }
}

