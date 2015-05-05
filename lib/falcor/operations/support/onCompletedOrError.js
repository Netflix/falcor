module.exports = function onCompletedOrError(model, onCompleted, onError, errors) {
    if (errors.length) {
        onError(errors);
    } else {
        onCompleted();
    }
};
