var jsong = require("../../index");
var Model = jsong.Model;
var Cache = require("../data/Cache");
var ReducedCache = require("../data/ReducedCache");
var Expected = require("../data/expected");
var SetExpected = require("../data/expected/set");
var Rx = require("rx");
var setTestRunner = require("../setTestRunner");
var testRunner = require("../testRunner");
var getModel = testRunner.getModel.bind(null, null);
var model = getModel(true);
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var Bound = Expected.Bound;
var expect = require('chai').expect;

//describe("Construct Matching Skeleton Cache", function() {
//    execute(false);
//});
describe.only("Use Cache Model", function() {
    execute(true);
});
describe("Use One Model For All Operations With Preset Cache.", function() {
    var cache = Cache();
    function run(cache) {
        execute(true, getModel(cache));
        execute(false);
        execute(true, getModel(cache), false, true);
    }
    run(cache);
});

//describe("Use One Model For All Operations With Empty Cache.", function() {
//    execute(false, true);
//});

function execute(useCache, oneModel, fillInReferences, hardLink) {

    function getOptions() {
        var options = {};
        if (useCache) {
            options.modelCache = Cache()
        }
        options.oneModel = oneModel;
        if (fillInReferences === false) {
            options.fillReferences = false;
        }
        if (hardLink === true) {
            options.hardLink = hardLink;
        }
        return options;
    }

    describe("Values", function () {
        describe("should set a value directly", function () {
            setTestRunner(Values().direct, getOptions());
        });
        describe("should set a reference directly", function () {
            setTestRunner(Values().reference, getOptions());
        });
        describe("should set a sentinel directly", function () {
            setTestRunner(Values().sentinelSummary, getOptions());
        });
        describe("Expired", function() {
            describe("should set a value on expired leaf node by timestamp.", function() {
                setTestRunner(SetExpected.Expired().expiredLeafNodeTimestamp, {modelCache: Cache()});
            });
            describe("should set a value on expired leaf node by 0.", function() {
                setTestRunner(SetExpected.Expired().expiredLeafNode0, {modelCache: Cache()});
            });
            xdescribe("should set a value on expired branch by timestamp.", function() {
                setTestRunner(SetExpected.Expired().expiredBranchByTimestamp, {modelCache: Cache()});
            });
            xdescribe("should set a value on expired branch by 0.", function() {
                setTestRunner(SetExpected.Expired().expiredBranchBy0, {modelCache: Cache()});
            });
        });
    });

    describe("References", function() {
        describe("should set a value through references", function () {
            setTestRunner(References().simpleReference0, getOptions());
        });
        describe("should set a value through sentinel references", function () {
            setTestRunner(References().sentinelReference, getOptions());
        });
        describe("Expired", function() {
            xdescribe("should set a value through an expired branch.", function() {
                setTestRunner(References().referenceExpired, getOptions());
            });
        });
    });
}

describe("References", function() {
    describe("Expired", function() {
        xdescribe("should set a value through a reference that is expired.", function() {
            setTestRunner(SetExpected.Expired().referenceExpired, {modelCache: Cache()});
        });
        xdescribe("should report a missing requested path when a hardlinked reference becomes expired.", function() {
            var options = {
                preCall: function(model, op, query, count) {
                    // TODO: Don't try this at home kids.  Guarantee you will be hurt.
                    model._cache.lists["future-expired-list"].$expires = Date.now() - 10;
                },
                modelCache: Cache(),
                hardLink: true
            };
            setTestRunner(SetExpected.Expired().futureExpiredReference, options);
        });
    });
});
describe("Complex", function() {
    describe("should set complex values for fromOnly.", function() {
        setTestRunner(SetExpected.Complex().fromOnly, {fillReferences: false});
    });
    describe("should set complex values for toOnly.", function() {
        setTestRunner(SetExpected.Complex().toOnly, {fillReferences: false});
    });
    describe("should set complex values for fromAndTo with negative.", function() {
        setTestRunner(SetExpected.Complex().fromAndTo, {fillReferences: false});
    });
    describe("should set complex values for leaf fromOnly.", function() {
        setTestRunner(SetExpected.Complex().fromOnlyLeaf, {fillReferences: false});
    });
    describe("should set complex values for leaf toOnly.", function() {
        setTestRunner(SetExpected.Complex().toOnlyLeaf, {fillReferences: false});
    });
    describe("should set complex values for leaf fromAndTo with negative.", function() {
        setTestRunner(SetExpected.Complex().fromAndToLeaf, {fillReferences: false});
    });
});


it("should increment the generation flag as we set.", function() {
    var model = new Model({cache: {}});
    var values = model._setPathSetsAsPathMap(model, [{path: ['hello', 'world'], value: 'teapot'}], [{}]);
    
    debugger;
    var generation1 = values.values[0].json.hello.__generation;
    values = model._setPathSetsAsPathMap(model, [{path: ['hello', 'world'], value: 'teapot2'}], [{}]);
    var generation2 = values.values[0].json.hello.__generation;
    
    expect(generation2 - generation1 > 0).to.be.ok;
});
