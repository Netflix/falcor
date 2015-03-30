var jsong = require("../../index");
var Model = jsong.Model;
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

describe('Adding', function() {
    var getPath = ['genreList', 0, 0, 'summary'];
    var getJSON = {genreList: {0: {0: {summary: null}}}};
    var setPath = {path: ['genreList', 0, 'length'], value: 4};
    var setJSON = {genreList: {0: {length: 4}}};
    describe('getPaths', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            getTest(getPath, 'toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            getTest(getPath, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            getTest(getPath, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            getTest(getPath, 'selector').
                subscribe(noOp, done, done);
        });
    });
    describe('getJSON', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            getTest(getJSON, 'toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            getTest(getJSON, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            getTest(getJSON, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            getTest(getJSON, 'selector').
                subscribe(noOp, done, done);
        });
    });
    xdescribe('setPaths', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            setTest(setPath, 'toJSONG').
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
        it('should perform a hard-link with back references selector.', function(done) {
            setTest(setPath, 'selector').
                subscribe(noOp, done, done);
        });
    });
    xdescribe('setJSON', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            setTest(setJSON, 'toJSONG').
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
        it('should perform a hard-link with back references selector.', function(done) {
            setTest(setJSON, 'selector').
                subscribe(noOp, done, done);
        });
    });
});

function getTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._cache.genreList[0];
    var rhs = model._cache.lists.abcd;
    
    expect(lhs.__ref_index).to.not.be.ok;
    expect(rhs.__refs_length).to.not.be.ok;
    expect(lhs.__context).to.not.be.ok;
    
    return testRunner.get(model, _.cloneDeep(query), output).
        do(noOp, noOp, function() {
            debugger;
            expect(lhs.__ref_index).to.equal(0);
            expect(rhs.__refs_length).to.equal(1);
            expect(rhs['__ref' + lhs.__ref_index]).to.equal(lhs);
            expect(lhs.__context).to.equal(rhs);
        });
}

function setTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._cache.genreList[0];
    var rhs = model._cache.lists.abcd;

    expect(lhs.__ref_index).to.not.be.ok;
    expect(rhs.__refs_length).to.not.be.ok;
    expect(lhs.__context).to.not.be.ok;

    return testRunner.set(model, _.cloneDeep(query), output).
        do(noOp, noOp, function() {
            debugger;
            expect(lhs.__ref_index).to.equal(0);
            expect(rhs.__refs_length).to.equal(1);
            expect(rhs['__ref' + lhs.__ref_index]).to.equal(lhs);
            expect(lhs.__context).to.equal(rhs);
        });
}
