module.exports = verify;

var _ = require("lodash");
var slice = Array.prototype.slice;
var expect = require('chai').expect;

function verify(suffix) {
    return function(model, input) {
        
        var message = this.fullTitle();
        
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
            
            expect(flatten_misses(output.requestedMissingPaths), message)
                .to.deep.equals(flatten_misses(input.requestedPaths));
            
            return true;
        };
        
        function flatten_misses(misses) {
            return misses.map(function(path) {
                var path2 = _.flatten(path);
                if(path.pathSetIndex != null) {
                    path2.pathSetIndex = path.pathSetIndex;
                }
                return path2;
            });
        }
    };
}

function get_seeds(pathvalues) {
    return pathvalues.map(function() {
        return {};
    });
}
