var __ref = require("./../internal/ref");
var __parent = require("./../internal/parent");
var __version = require("./../internal/version");
var __generation = require("./../internal/generation");
var __refs_length = require("./../internal/refs-length");

var generation = require("./../support/inc-generation");

module.exports = function update_back_refs(node, version) {
    if(node && node[__version] !== version) {
        node[__version] = version;
        node[__generation] = generation();
        update_back_refs(node[__parent], version);
        var i = -1, n = node[__refs_length] || 0;
        while(++i < n) {
            update_back_refs(node[__ref + i], version);
        }
    }
    return node;
}
