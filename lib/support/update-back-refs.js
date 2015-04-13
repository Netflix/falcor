module.exports = update_back_refs;

var prefix = require("../types/internal-prefix");
var __ref = prefix + "ref";
var __version = prefix + "version";
var __generation = prefix + "generation";
var __refs_length = prefix + "refs_length";

var generation = require("./inc-generation");

function update_back_refs(node, version) {
    if(node && node[__version] !== version) {
        node[__version] = version;
        node[__generation] = generation();
        update_back_refs(node["../"], version);
        var i = -1, n = node[__refs_length] || 0;
        while(++i < n) {
            update_back_refs(node[__ref + i], version);
        }
    }
    return node;
}
