var removeNode = require("./remove-node");
var updateBackRefs = require("./update-back-refs");

module.exports = function(opts, node, offset) {
    var child, version = opts.version, lru = opts.lru;
    while(child = node) {
        node = child["../"];
        if((child.$size = (child.$size || 0) - offset) <= 0 && node != null) {
            removeNode(lru, node, child, child.__key);
        } else if(child.__version !== version) {
            updateBackRefs(child, version);
        }
    }
}