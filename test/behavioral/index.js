var jsong = require("../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../data/LocalDataSource");
var UnoDataSource = require("../data/UnoDataSource");
var Cache = require("../data/Cache");
var RCache = require("../data/ReducedCache");
var ReducedCache = RCache.ReducedCache;
var Expected = require("../data/expected");
var getTestRunner = require("../getTestRunner");
var testRunner = require("../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var getModel = testRunner.getModel;

describe("Behavioral", function() {
    require("./error");
    require("./bind");
    require("./request");
    require("./value");
    require("./modes");
    require('./set');
    require("./invalidate.spec");
    
    it('should have two separate models with two separate caches.', function() {
        var model1 = getModel(null, Cache());
        var model2 = getModel(null, {
            "videos": {
                "$size": 10,
                "1234": {
                    "$size": 10,
                    "summary": {
                        "$size": 10,
                        "$type": "leaf",
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }
            }
        });
        var ex1 = Values().direct.AsJSON.values[0];
        var ex2 = Values().direct553.AsJSON.values[0];

        var res1 = [{}];
        var res2 = [{}];
        model1._getPathsAsJSON(model1, [['videos', 1234, 'summary']], res1);
        model2._getPathsAsJSON(model2, [['videos', 1234, 'summary']], res2);
        
        testRunner.compare(ex1, res1[0]);
        testRunner.compare(ex2, res2[0]);
    });
});
