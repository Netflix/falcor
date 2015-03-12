var jsong = require("../../../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../../data/LocalDataSource");
var Cache = require("../../../data/Cache");
var ReducedCache = require("../../../data/ReducedCache");
var Expected = require("../../../data/expected");
var getTestRunner = require("../../../getTestRunner");
var testRunner = require("../../../testRunner");
var Bound = Expected.Bound;
var chai = require("chai");
var expect = chai.expect;
var _ = require('lodash');
var noOp = function() {};

describe("Get", function() {
    var path = ['video', 'errorBranch'];
    var json = {video: {errorBranch: null}};
    describe('Paths', function() {
        it('should get an error as value toJSONG.', function(done) {
            getTest(path, 'toJSONG').
                subscribe(noOp, done, done);
        });
        it('should get an error as value toPathValues.', function(done) {
            getTest(path, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should get an error as value toJSON.', function(done) {
            getTest(path, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should get an error as value selector.', function(done) {
            getTest(path, 'selector').
                subscribe(noOp, done, done);
        });
    });
    describe('JSON', function() {
        it('should get an error as value toJSONG.', function(done) {
            getTest(json, 'toJSONG').
                subscribe(noOp, done, done);
        });
        it('should get an error as value toPathValues.', function(done) {
            getTest(json, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should get an error as value toJSON.', function(done) {
            getTest(json, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should get an error as value selector.', function(done) {
            getTest(json, 'selector').
                subscribe(noOp, done, done);
        });
    });
});

function getTest(query, output) {
    var model = new Model({cache: Cache()}).treatErrorsAsValues();
    return testRunner.get(model, _.cloneDeep(query), output).
        do(function(video) {
            
            // -1 becomes 0 which is *not ok*
            expect(~JSON.stringify(video).indexOf('I am yelling timber.')).to.be.ok;
        });
}
