module.exports = verify;

var slice = Array.prototype.slice;
var expect = require('chai').expect;

function verify(suffix) {
    return function(model, input) {
        
        var message = this.fullTitle();
        var checks  = [
            check("Values", "values"),
            check("Errors", "errors"),
            check("Requested Paths", "requestedPaths"),
            check("Optimized Paths", "optimizedPaths"),
            check("Requested Missing Paths", "requestedMissingPaths"),
            check("Optimized Missing Paths", "optimizedMissingPaths")
        ];
        
        return function() {
            var paths  = slice.call(arguments);
            var seeds   = suffix == "JSON" ? get_seeds(paths) : [{}];
            if(suffix == "Values") {
                var values = [];
                seeds = function(pv) { values.push(pv); }
            }
            var func = model["_getPathSetsAs" + suffix];
            var output = func(model, paths, seeds);
            if(values) { output.values = values; }
            return checks.shift().call(this, output);
        };
        
        function check(name, prop) {
            var fn;
            return function(output) {
                expect(input[prop], message + " - " + name).to.deep.equals(output[prop]);
                if(fn = checks.shift()) {
                    return fn.call(this, output);
                } else {
                    return true;
                }
            };
        }
    };
}

function get_seeds(pathvalues) {
    return pathvalues.map(function() {
        return {};
    });
}
