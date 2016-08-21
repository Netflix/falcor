var unicodePrefix = require("./../internal/unicodePrefix");

module.exports = clone;

function clone(node) {

    var key, keys = Object.keys(node),
        json = {}, index = -1, length = keys.length;

    while (++index < length) {
        key = keys[index];
        if (key.charAt(0) === unicodePrefix) {
            continue;
        }
        json[key] = node[key];
    }

    return json;
}
