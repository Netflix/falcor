var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
global.XMLHttpRequest = XMLHttpRequest;
var XMLHttpSource = require('falcor-browser');
var source = new XMLHttpSource('http://localhost:1337/falcor');
var edgeCaseSource = new XMLHttpSource('http://localhost:1337/falcor.edge');
var falcor = require('../../../index');
var noOp = function() {};
var Expected = require('./../../data/expected');
var Values = Expected.Values;
var testRunner = require('./../../testRunner');

describe("End-to-End", function() {
    var server = require('./express-falcor')(1337).publishValue();
    var dispose = server.connect();

    it('should perform a simple get.', function(done) {
        var expected = Values().direct.AsJSON.values[0].json;
        var model = new falcor.Model({
            source: source
        });
        var called = 0;
        model.
            get(['videos', 1234, 'summary'], function() {
                var video = this.getValueSync(['videos', 1234, 'summary']);
                return video;
            }).
            doAction(function(x) {
                testRunner.compare(expected, x);
                called++;
            }, noOp, function() {
                testRunner.compare(1, called, 'expected to be onNext\'d one time.');
            }).
            subscribe(noOp, done, done);
    });

    it('should perform a get for a missing path and get sentinel back.', function(done) {
        var model = new falcor.Model({
            source: source
        });
        var called = 0;
        var expected = {
            json: {
                videos: {
                    'missing-branch': {
                        $type: 'sentinel',
                    }
                }
            }
        };
        model.
            boxValues().
            get(['videos', 'missing-branch', 'summary']).
            doAction(function(x) {
                testRunner.compare(expected, x);
                called++;
            }, noOp, function() {
                testRunner.compare(1, called, 'expected to be onNext\'d one time.');
            }).
            subscribe(noOp, done, done);
    });

    it('should get multiple sentinel types.', function(done) {
        var model = new falcor.Model({
            source: edgeCaseSource
        });
        var called = 0;
        var expected = {
            json: {
                user: {
                    name: 'Jim'
                }
            }
        };
        var expectedErrors = [{
            path: ["user", "location"],
            value: "Something broke!"
        }];
        model.
            get(["user", ["name", "age", "location"]]).
            subscribe(function(x) {
                testRunner.compare(expected, x);
                called++;
            }, function(errors) {
                testRunner.compare(expectedErrors, errors, 'expecting an error.');
                testRunner.compare(1, called, 'expected to be onNext\'d one time.');
                done();
            }, done);
    });

    after(function() {
        dispose.dispose();
    });
});

