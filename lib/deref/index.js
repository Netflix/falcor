var InvalidDerefInputError = require("./../errors/InvalidDerefInputError");
var getCachePosition = require("./../get/getCachePosition");

module.exports = function deref(boundJSONArg) {

    var absolutePath = boundJSONArg && boundJSONArg.$__path;
    var refPath = boundJSONArg && boundJSONArg.$__refPath;
    var toReference = boundJSONArg && boundJSONArg.$__toReference;
    var referenceContainer;

    // We deref and then ensure that the reference container is attached to
    // the model.
    if (absolutePath) {
        if (toReference) {
            referenceContainer = getCachePosition(this, toReference);
        }

        // If the reference container is still a sentinel value then compare
        // the reference value with refPath.  If they are the same, then the
        // model is still valid.
        var validContainer = true;
        if (refPath && referenceContainer && referenceContainer.$type) {
            var containerPath = referenceContainer.value;

            // Essentially the reference has been replaced with a null value,
            // thus detaching this json output from the graph, and potentially
            // causing an error.
            if (!containerPath) {
                validContainer = false;
            }

            var i = 0;
            var len = refPath.length;
            for (; validContainer && i < len; ++i) {
                if (containerPath[i] !== refPath[i]) {
                    validContainer = false;
                }
            }
        }

        // Simply not a valid container, the model has already been disconnected
        // from the graph.
        else {
            validContainer = false;
        }

        // Signal to the deref'd model that it has been disconnected from the
        // graph
        if (!validContainer) {
            referenceContainer = false;
        }

        return this._clone({
            _path: absolutePath,
            _referenceContainer: referenceContainer
        });
    }

    throw new InvalidDerefInputError();
};
