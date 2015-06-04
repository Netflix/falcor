module.exports = function get_seeds(list) {
    return list.
        slice(0, Math.ceil(list.length * 0.5)).
        map(function() { return {}; });
};