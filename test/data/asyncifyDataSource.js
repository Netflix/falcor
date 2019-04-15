var Rx = require("rx");

module.exports = function asyncifyDataSource(ds) {
    var outputDataSource = {};
    ["get", "set", "call"].forEach(function(method) {
        outputDataSource[method] = function() {
            var args = Array.prototype.slice.call(arguments);
            return ds[method].apply(ds, args).observeOn(Rx.Scheduler.timeout);
        };
    });

    return outputDataSource;
};
