module.exports = function(node, dest) {
    var nodeRefsLength = node["__refs_length"] || 0,
        destRefsLength = dest["__refs_length"] || 0,
        i = -1, ref;
    while(++i < nodeRefsLength) {
        ref = node["__ref" + i];
        if(ref !== undefined) {
            ref[__CONTEXT] = dest;
            dest["__ref" + (destRefsLength + i)] = ref;
            node["__ref" + i] = undefined;
        }
    }
    dest["__refs_length"] = nodeRefsLength + destRefsLength;
    node["__refs_length"] = ref = undefined;
}