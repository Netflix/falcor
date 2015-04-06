var isJSONG = require('./isJSONG');
var isPathValue = require('./isPathOrPathValue');

module.exports =  mergeBoundPath;

function mergeBoundPath(arg, boundPath) {
    return isJSONG(arg) && mergeBoundPathIntoJSONG(arg, boundPath) ||
        isPathValue(arg) && mergeBoundPathIntoPathValue(arg, boundPath) ||
        mergeBoundPathIntoJSON(arg, boundPath);
}

function mergeBoundPathIntoJSONG(jsongEnv, boundPath) {
    var newJSONGEnv = {jsong: jsongEnv.jsong, paths: jsongEnv.paths};
    if (boundPath.length) {
        var paths = [];
        for (i = 0, len = jsongEnv.paths.length; i < len; i++) {
            paths[i] = boundPath.concat(jsongEnv.paths[i]);
        }
        newJSONGEnv.paths = paths;
    }

    return newJSONGEnv;
}

function mergeBoundPathIntoJSON(arg, boundPath) {
    var newArg = arg;
    if (boundPath.length) {
        newArg = {};
        for (var i = 0, len = boundPath.length - 1; i < len; i++) {
            newArg[boundPath[i]] = {};
        }
        newArg[boundPath[i]] = arg;
    }

    return newArg;
}

function mergeBoundPathIntoPathValue(arg, boundPath) {
    return {
        path: boundPath.concat(arg.path),
        value: arg.value
    };
}
