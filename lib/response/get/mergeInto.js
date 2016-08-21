module.exports = mergeInto;

/* eslint-disable camelcase */
function mergeInto(dest, node) {

    var destValue, nodeValue,
        key, keys = Object.keys(node),
        index = -1, length = keys.length;

    while (++index < length) {

        key = keys[index];

        if (key !== "$__path" &&
            key !== "$__refPath" &&
            key !== "$__toReference") {

            nodeValue = node[key];
            destValue = dest[key];

            if (destValue !== nodeValue) {
                if (destValue === undefined || "object" !== typeof nodeValue) {
                    dest[key] = nodeValue;
                }
                else {
                    mergeInto(destValue, nodeValue);
                }
            }
        }
    }

    var $__path = node.$__path;

    if ($__path) {
        dest.$__path = $__path;
        var $__refPath = node.$__refPath;
        var $__toReference = node.$__toReference;
        if ($__refPath && $__toReference) {
            dest.$__refPath = $__refPath;
            dest.$__toReference = $__toReference;
        }
    }

    return dest;
}
/* eslint-enable */
