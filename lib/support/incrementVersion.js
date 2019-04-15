var version = 1;
module.exports = function incrementVersion() {
    return version++;
};
module.exports.getCurrentVersion = function getCurrentVersion() {
    return version;
};
