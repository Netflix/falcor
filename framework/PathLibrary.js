var PathLibrary = {
    simplePathToMap: simplePathToMap,
    pathToMap: pathToMap,
    simplePathInMap: simplePathInMap
};

function simplePathToMap(path, seed) {
    seed = seed || {};
    var curr = seed;
    for (var i = 0, len = path.length; i < len; i++) {
        if (curr[path[i]]) {
            curr = curr[path[i]];
        } else {
            curr = curr[path[i]] = {};
        }
    }
    return seed;
}

function pathToMap(path, seed, depth) {
    depth = depth || 0;
    var curr = path[depth];

    // Object / Array
    if (typeof curr === 'object') {
        if (Array.isArray(curr)) {
            curr.forEach(function(v) {
                if (!seed[v]) {
                    seed[v] = {};
                }
                if (depth < path.length) {
                    pathToMap(path, seed[v], depth + 1);
                }
            });
        } else {
            var from = curr.from || 0;
            var to = curr.to >= 0 ? curr.to : curr.length;
            for (var i = from; i <= to; i++) {
                if (!seed[i]) {
                    seed[i] = {};
                }
                if (depth < path.length) {
                    pathToMap(path, seed[i], depth + 1);
                }
            }
        }
    } else {
        if (depth < path.length) {
            if (!seed[curr]) {
                seed[curr] = {};
            }
            pathToMap(path, seed[curr], depth + 1);
        }
    }
}

function simplePathInMap(path, map) {
    var curr = map;
    for (var i = 0, len = path.length; i < len; i++) {
        if (curr[path[i]]) {
            curr = curr[path[i]];
        } else {
            return false;
        }
    }
    return true;
}
