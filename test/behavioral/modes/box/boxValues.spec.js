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
var noOp = function() {};
var _ = require('lodash');

describe('Box Only', function() {
    it('should get a value that is not a sentinel.', function(done) {
        var model = new Model({cache: Cache()}).boxValues();
        model.
            get(['videos', 1234, 'summary']).
            do(function(video) {
                var summary = video.json.videos[1234].summary;
                expect(summary.title).to.equal('House of Cards');
                expect(summary.$type).to.equal('leaf');
            }).
            subscribe(noOp, done, done);
    });
    
    it('should get a value that is a sentinel.', function(done) {
        var model = new Model({cache: Cache()}).boxValues();
        model.
            get(['videos', 'sentinel', 'summary']).
            do(function(video) {
                var summary = video.json.videos.sentinel.summary;
                expect(summary.title).to.not.be.ok;
                expect(summary.value.title).to.equal('Marco Polo');
                expect(summary.$type).to.equal('sentinel');
            }).
            subscribe(noOp, done, done);
    });
});
