var getSourceObserver = require('./../support/getSourceObserever');
var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');
var toPathValues = require('./../support/Formats').toPathValues;

module.exports = setSourceRequest;

function setSourceRequest(
        options, onNext, seeds, relativeSeeds, combinedResults, cb) {
    var model = options.operationModel;
    var seedRequired = options.format !== toPathValues;
    return model._request.set(
        relativeSeeds[0],
        getSourceObserver(
            model,
            relativeSeeds[0].paths,
            function setSourceRequestCB(err, results) {
                if (err) {
                    cb(err);
                }

                // Sets the results into the model.
                model._setJSONGsAsJSON(model, [results], []);

                // Gets the original paths / maps back out.
                var operations = combineOperations(
                        options.operationArgs, options.format, 'get');
                setSeedsOrOnNext(
                    operations, seedRequired,
                    seeds, onNext, options.operationSelector);
                cb(null, [operations, seeds, false, {removeBoundPath: false}]);
            }));
}

