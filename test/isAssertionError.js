module.exports = function isAssertionError(e) {
    return e.hasOwnProperty('expected') && e.hasOwnProperty('actual');
};
