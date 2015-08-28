var pathSyntax = require("falcor-path-syntax");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;

module.exports = function pathMap(path, value, depth) {
    depth = depth || 0;
    path = pathSyntax.fromPath(path);
    if (depth < path.length) {
        var note = {};
        var node = {};
        var keySet = path[depth];
        var key = iterateKeySet(keySet, note);
        do {
            node[key] = pathMap(path, value, depth + 1);
            key = iterateKeySet(keySet, note);
        } while(!note.done);
        return node;
    } else {
        return value;
    }
};
