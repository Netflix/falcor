var falcor = require("./../../lib/");
var Model = falcor.Model;
var expect = require('chai').expect;
var Cache = require("../data/Cache");
var ReducedCache = require("../data/ReducedCache");
var Expected = require("../data/expected");
var LocalDataSource = require("../data/LocalDataSource");
var Rx = require("rx");
var testRunner = require("../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var Bound = Expected.Bound;
var noOp = function() {};
var _ = require('lodash');

var $$ref = require("./../../lib/internal/ref");
var $$context = require("./../../lib/internal/context");
var $$ref_index = require("./../../lib/internal/ref-index");
var $$refs_length = require("./../../lib/internal/refs-length");

describe('Adding', function() {
    var getPath = ['genreList', 0, 0, 'summary'];
    var setPath = {path: ['genreList', 0, 'length'], value: 4};
    var setJSON = {json: {genreList: {0: {length: 4}}}};
    describe('getPaths', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            getTest(getPath, '_toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            getTest(getPath, 'toJSON').
                subscribe(noOp, done, done);
        });
    });
    describe('setPaths', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            setTest(setPath, '_toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setTest(setPath, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            setTest(setPath, 'toPathValues').
                subscribe(noOp, done, done);
        });
    });
    describe('setJSON', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            setTest(setJSON, '_toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setTest(setJSON, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            setTest(setJSON, 'toPathValues').
                subscribe(noOp, done, done);
        });
    });
});

function getTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._root.cache.genreList[0];
    var rhs = model._root.cache.lists.abcd;

    expect(lhs[$$ref_index]).to.not.be.ok;
    expect(rhs[$$refs_length]).to.not.be.ok;
    expect(lhs[$$context]).to.not.be.ok;

    return toObservable(testRunner.get(model, _.cloneDeep(query), output)).
        do(noOp, noOp, function() {
            expect(lhs[$$ref_index]).to.equal(0);
            expect(rhs[$$refs_length]).to.equal(1);
            expect(rhs[$$ref + lhs[$$ref_index]]).to.equal(lhs);
            expect(lhs[$$context]).to.equal(rhs);
        });
}

function setTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._root.cache.genreList[0];
    var rhs = model._root.cache.lists.abcd;

    expect(lhs[$$ref_index]).to.not.be.ok;
    expect(rhs[$$refs_length]).to.not.be.ok;
    expect(lhs[$$context]).to.not.be.ok;

    return toObservable(testRunner.set(model, _.cloneDeep(query), output)).
        do(noOp, noOp, function() {
            expect(lhs[$$ref_index]).to.equal(0);
            expect(rhs[$$refs_length]).to.equal(1);
            expect(rhs[$$ref + lhs[$$ref_index]]).to.equal(lhs);
            expect(lhs[$$context]).to.equal(rhs);
        });
}
