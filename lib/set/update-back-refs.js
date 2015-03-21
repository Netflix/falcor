module.exports = update_back_refs;

var generation = require("../support/inc-generation");

function update_back_refs(node, version) {
    if(node && node.__version !== version) {
        node.__version = version;
        node.__generation = generation();
        update_back_refs(node["../"], version);
        var i = -1, n = node.__refs_length || 0;
        while(++i < n) {
            update_back_refs(node["__ref" + i], version);
        }
    }
    return node;
}
