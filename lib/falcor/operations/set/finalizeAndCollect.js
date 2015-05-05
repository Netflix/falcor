var collect = require('../../../lru/collect');
var onCompletedOrError = require('../support/onCompletedOrError');

module.exports = function finalizeAndCollect(model, onCompleted, onError, errors) {
    onCompletedOrError(model, onCompleted, onError, errors);
    collect(
        model._root,
        model._root.expired,
        model._version,
        model._cache.$size || 0,
        model._maxSize,
        model._collectRatio
    );
};
