var jsong = require("../../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var ReducedCache = require("../../data/ReducedCache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var Bound = Expected.Bound;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var getDataModel = testRunner.getModel;
var _ = require('lodash');

describe('Splice', function() {
    describe('Input Paths', function() {
        describe('AsJSONG', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'toJSONG').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'toPathValues').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'toJSON').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Selector', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'selector').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'selector').
                    subscribe(noOp, done, done);
            });
        });
    });
    describe('Input PathMaps', function() {
        describe('AsJSONG', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'toJSONG').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({values: 'overwrite'}, 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'toPathValues').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({values: 'overwrite'}, 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'toJSON').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({values: 'overwrite'}, 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Selector', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'selector').
                    subscribe(noOp, done, done);
            });
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({values: 'overwrite'}, 'selector').
                    subscribe(noOp, done, done);
            });
        });
    });
});

function get(model, query, output) {
    var obs = model.
        get(query, output === 'selector' ? noOp : undefined);

    if (output !== 'selector') {
        obs = obs[output]();
    }

    return obs;
}

function set(model, query, output) {
    var obs = model.
        set(query, output === 'selector' ? noOp : undefined);

    if (output !== 'selector') {
        obs = obs[output]();
    }

    return obs;
}

function spliceOverwrite(query, output) {
    var model = new Model({cache: {}});
    return model.
        set({ values: 'you are terminated' }).
        flatMap(function() {
            return set(model, query, output);
        }).
        do(function() {
            expect(model._root.__head.value).to.equal('overwrite');
            expect(model._root.__head.__next).to.be.not.ok;
            expect(model._root.__head.__prev).to.be.not.ok;
            expect(model._root.__tail).to.be.not.ok;
        });
}

function spliceExpired(query, output) {
    var model = new Model({cache: {}});
    model._setPathMapsAsPathMap(model, [{
        expired: {
            $type: 'sentinel',
            $expires: Date.now() + 10,
            value: 'hello'
        }
    }]);
    expect(model._root.__head.value).to.equal('hello');

    return Rx.Observable.
        return('').
        delay(100).
        flatMap(function() {
            return get(model, query, output);
        }).
        do(function() {
            expect(model._root.__head).to.be.not.ok;
            expect(model._root.__tail).to.be.not.ok;
        });
}
