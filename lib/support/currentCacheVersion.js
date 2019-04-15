var version = null;
exports.setVersion = function setCacheVersion(newVersion) {
    version = newVersion;
};
exports.getVersion = function getCacheVersion() {
    return version;
};

