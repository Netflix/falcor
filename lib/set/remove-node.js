var unlink = require("./unlink");
var deleteBackRefs = require("./delete-back-refs");
var splice = require("../lru/splice");

module.exports = function(lru, parent, node, key) {
    if(node != null && typeof node === "object") {
        var type  = node.$type || undefined;
        var value = !!type ? node.value : node;
        if(type == "reference") {
            unlink(value);
        }
        deleteBackRefs(node);
        splice(lru, node);
        parent[key] = node["./"] = node["../"] = node["/"] = undefined;
    }
    return node;
}