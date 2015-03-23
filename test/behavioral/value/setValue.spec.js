var jsong = require("../../../index");
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

describe('#setValue', function() {
    it('should perform a setValue.', function(done) {
        var model = getDataModel(null);
        model.
            setValue({path: ['videos', 1234, 'summary'], value: {title: 'setValue'}}).
            subscribe(function(response) {
                testRunner.compare({title: 'setValue'}, response);
            }, done, done);
    });
    describe('Sync', function() {
        it('should perform a setValueSync with a dataSource and get thrown an error.', function(done) {
            var model = getDataModel();
            model.
                get(['videos', 1234, 'summary'], function() {

                    var threw = false;
                    try {
                        this.setValueSync(['videos', 1234, 'summary'], {hello: 'world'});
                    } catch (e) {
                        expect(e.message).to.equal('Model#setValueSync can not be invoked on a Model with a DataSource. Please use the withoutDataSource() method followed by setValueSync if you would like to modify only the local cache.');
                        threw = true;
                    }

                    testRunner.compare(true, threw, 'Expecting the call to setValueSync(path) to throw when there is a dataSource.');
                    return null;
                }).
                subscribe(noOp, done, done);
        });
        
        it('should perform a setValueSync without a dataSource and successfully set the data.', function(done) {
            var model = getDataModel();
            var obs = model.
                get(['videos', 1234, 'summary'], function() {
                    this.
                        withoutDataSource().
                        setValueSync(['videos', 1234, 'summary'], {hello: 'world'});

                    return this.getValueSync(['videos', 1234, 'summary']);
                });
            getTestRunner.async(obs, model, {}, {
                onNextExpected: {values: [{hello: 'world'}]},
                verify: false
            }).
            subscribe(noOp, done, done);
        });
    });
});
