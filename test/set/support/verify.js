module.exports = verify;

var slice = Array.prototype.slice;
var expect = require('chai').expect;
var collect = require("./../../../lib/lru/collect");
var get_seeds = require("./get-seeds");
var get_pathsets = require("./get-pathsets");
var inspect = require("util").inspect;
var testRunner = require("../../testRunner");

function verify(suffix) {
    return function(model, input) {
        
        collect(
            model._root,
            model._root.expired,
            model._version,
            model._cache.$size || 0,
            model._maxSize,
            model._collectRatio
        );
        
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
            return checks.shift().call(this, get_pathsets(model, slice.call(arguments), suffix));
        };
        
        function check(name, prop) {
            
            // if(model._boxed || model._materialized || model._treatErrorsAsValues) {
            //     name += " [" +
            //         (model._boxed && " boxed" || "") +
            //         (model._materialized && " materialized" || "") +
            //         (model._treatErrorsAsValues && " treatErrorsAsValues" || "") +
            //     " ]";
            // }
            
            name += " [" +
                (" boxed: " + !!model._boxed) +
                (", materialized: " + !!model._materialized) +
                (", treatErrorsAsValues: " + !!model._treatErrorsAsValues) +
            " ]";
            
            var fn;
            
            return function(output) {
                
                // console.log("Set " + name + ":", inspect(input[prop], {depth: null}));
                // console.log("Get " + name + ":", inspect(output[prop], {depth: null}));
                
                testRunner.compare(output[prop], input[prop], message + " - " + name);
                
                if(fn = checks.shift()) {
                    return fn.call(this, output);
                } else {
                    return true;
                }
            };
        }
    };
}
