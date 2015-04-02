
var jsong = require('../../../index');
var Model = jsong.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};

describe('Treat Errors As Values', function() {
    it('should get a value that was an error from the server.', function(done) {
        var model = new Model({
                cache: {},
                source: new LocalDataSource(Cache())
            }).
            treatErrorsAsValues();
    });
});
