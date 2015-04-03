module.exports = function mergeBoundPath(model, jsongEnv) {
    var boundPath = model._path;
    var paths = [];
    if (boundPath.length) {
        for (i = 0, len = jsongEnv.paths.length; i < len; i++) {
            paths[i] = boundPath.concat(jsongEnv.paths[i]);
        }
    } else {
        paths = jsongEnv.paths;
    }

    return paths;
};
