module.exports = function onCompletedOrError(onCompleted, onError, errors) {
    if (errors.length) {
        onError(errors);
    } else {
        onCompleted();
    }
};
