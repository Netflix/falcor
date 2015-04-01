module.exports = function isSeedRequired(format) {
    return format === 'AsJSON' || format === 'AsJSONG' || format === 'AsPathMap';
};
