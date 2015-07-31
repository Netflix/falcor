var fastCopy = require("./../../get/util/support").fastCopy;

module.exports = function spreadJSON(root, bins, binArg) {
    var bin = binArg || [];
    if (!bins.length) {
        bins.push(bin);
    }
    if (!root || typeof root !== "object" || root.$type) {
        return [];
    }
    var keys = Object.keys(root);
    if (keys.length === 1) {
        bin.push(keys[0]);
        spreadJSON(root[keys[0]], bins, bin);
    } else {
        for (var i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];
            var nextBin = fastCopy(bin);
            nextBin.push(k);
            bins.push(nextBin);
            spreadJSON(root[k], bins, nextBin);
        }
    }
};
