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

describe("Values", function () {
    it("should set a value directly", function () {
        setTestRunner(Values().direct, {modelCache: Cache()});
    });
    it("should set a reference directly", function () {
        setTestRunner(Values().reference, {modelCache: Cache()});
    });
    it("should set a sentinel directly", function () {
        setTestRunner(Values().sentinelDirect, {modelCache: Cache()});
    });
    it("Expired", function() {
        it("should set a value on expired leaf node by timestamp.", function() {
            setTestRunner(SetExpected.Expired().expiredLeafNodeTimestamp, {modelCache: Cache()});
        });
        it("should set a value on expired leaf node by 0.", function() {
            setTestRunner(SetExpected.Expired().expiredLeafNode0, {modelCache: Cache()});
        });
        xit("should set a value on expired branch by timestamp.", function() {
            setTestRunner(SetExpected.Expired().expiredBranchByTimestamp, {modelCache: Cache()});
        });
        xit("should set a value on expired branch by 0.", function() {
            setTestRunner(SetExpected.Expired().expiredBranchBy0, {modelCache: Cache()});
        });
    });
});

describe("References", function() {
    it("should set a value through references", function () {
        setTestRunner(References().simpleReference0, {modelCache: Cache()});
    });
    it("Expired", function() {
        xdescribe("should set a value through an expired branch.", function() {
            setTestRunner(References().referenceExpired, {modelCache: Cache()});
        });
    });
});

describe("References", function() {
    it("Expired", function() {
        xit("should set a value through a reference that is expired.", function() {
            setTestRunner(SetExpected.Expired().referenceExpired, {modelCache: Cache()});
        });
        xit("should report a missing requested path when a hardlinked reference becomes expired.", function() {
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
    it("should set complex values for fromOnly.", function() {
        setTestRunner(SetExpected.Complex().fromOnly, {fillReferences: false});
    });
    it("should set complex values for toOnly.", function() {
        setTestRunner(SetExpected.Complex().toOnly, {fillReferences: false});
    });
    it("should set complex values for fromAndTo with negative.", function() {
        setTestRunner(SetExpected.Complex().fromAndTo, {fillReferences: false});
    });
    it("should set complex values for leaf fromOnly.", function() {
        setTestRunner(SetExpected.Complex().fromOnlyLeaf, {fillReferences: false});
    });
    it("should set complex values for leaf toOnly.", function() {
        setTestRunner(SetExpected.Complex().toOnlyLeaf, {fillReferences: false});
    });
    it("should set complex values for leaf fromAndTo with negative.", function() {
        setTestRunner(SetExpected.Complex().fromAndToLeaf, {fillReferences: false});
    });
});

it("should increment the generation flag as we set.", function() {
    
    var model = new Model({cache: {}});
    var cache = model._cache;
    
    model._setPathSetsAsValues(model, [{ path: ['hello', 'world'], value: "teapot" }]);
    var generation1 = cache.hello.world.__generation;
    model._setPathSetsAsValues(model, [{ path: ['hello', 'world'], value: "teapot2" }]);
    var generation2 = cache.hello.world.__generation;
    
    expect(generation2 - generation1 > 0).to.be.ok;
});
