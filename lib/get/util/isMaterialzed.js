module.exports = function isMaterialized(model) {
    return model._materialized && !model._source;
};
