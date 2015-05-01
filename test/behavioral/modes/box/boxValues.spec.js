var jsong = require("../../../../index");
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
    var pathValue = ['videos', 1234, 'summary'];
    var jsonValue = {videos: {1234: {summary: null}}};
    var pathSentinel = ['videos', 'atom', 'summary'];
    var jsonSentinel = {videos: {atom: {summary: null}}};
    describe('getPaths', function() {
        it('should get a value that is is a value selector.', function(done) {
            getTestValue(pathValue, 'selector').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom selector.', function(done) {
            getTestSentinel(pathSentinel, 'selector').
                subscribe(noOp, done, done);
        });
        it('should get a value that is is a value toPathValues.', function(done) {
            getTestValue(pathValue, 'toPathValues').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom toPathValues.', function(done) {
            getTestSentinel(pathSentinel, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should get a value that is is a value toJSON.', function(done) {
            getTestValue(pathValue, 'toJSON').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom toJSON.', function(done) {
            getTestSentinel(pathSentinel, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should get a value that is is a value toJSONG.', function(done) {
            getTestValue(pathValue, 'toJSONG').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom toJSONG.', function(done) {
            getTestSentinel(pathSentinel, 'toJSONG').
                subscribe(noOp, done, done);
        });
    });
    describe('getJSON', function() {
        it('should get a value that is is a value selector.', function(done) {
            getTestValue(jsonValue, 'selector').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom selector.', function(done) {
            getTestSentinel(jsonSentinel, 'selector').
                subscribe(noOp, done, done);
        });
        it('should get a value that is is a value toPathValues.', function(done) {
            getTestValue(jsonValue, 'toPathValues').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom toPathValues.', function(done) {
            getTestSentinel(jsonSentinel, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should get a value that is is a value toJSON.', function(done) {
            getTestValue(jsonValue, 'toJSON').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom toJSON.', function(done) {
            getTestSentinel(jsonSentinel, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should get a value that is is a value toJSONG.', function(done) {
            getTestValue(jsonValue, 'toJSONG').
                subscribe(noOp, done, done);
        });

        it('should get a value that is a atom toJSONG.', function(done) {
            getTestSentinel(jsonSentinel, 'toJSONG').
                subscribe(noOp, done, done);
        });
    });
});

function getTestValue(query, output) {
    var model = new Model({cache: Cache()}).boxValues();
    return testRunner.get(model, query, output).
        do(function(video) {
            var summary;
            if (output === 'selector') {
                summary = video;
            } else if (output === 'toPathValues') {
                summary = video.value;
            } else if (output === 'toJSON') {
                summary = video.json.videos[1234].summary;
            } else if (output === 'toJSONG') {
                summary = video.jsong.videos[1234].summary;
            }
            expect(summary.title).to.equal('House of Cards');
            if (summary.$type) {
                expect(summary.$type).to.equal('leaf');
            }
        });
}

function getTestSentinel(query, output) {
    var model = new Model({cache: Cache()}).boxValues();
    return testRunner.get(model, query, output).
        do(function(video) {
            var summary;
            if (output === 'selector') {
                summary = video;
            } else if (output === 'toPathValues') {
                summary = video.value;
            } else if (output === 'toJSON') {
                summary = video.json.videos.atom.summary;
            } else if (output === 'toJSONG') {
                summary = video.jsong.videos.atom.summary;
            }
            expect(summary.title).to.not.be.ok;
            expect(summary.value.title).to.equal('Marco Polo');
            expect(summary.$type).to.equal('atom');
        });
}

