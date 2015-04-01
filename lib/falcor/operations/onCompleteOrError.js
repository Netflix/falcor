module.exports = function onCompleteOrError(onCompleted, onError, errors) {
    if (errors.length) {
        onError(errors);
    } else {
        onCompleted();
    }
};
