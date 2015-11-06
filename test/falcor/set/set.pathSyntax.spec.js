var falcor = require("./../../../lib/");
var Model = falcor.Model;
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};
var cacheGenerator = require('./../../CacheGenerator');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Path Syntax', function() {
    it('should accept strings for set in the path argument of a pathValue.', function(done) {
        var onNext = sinon.spy();
        var model = new Model();

        toObservable(model.
            set({path: 'test[0]', value: 5})).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        test: {
                            0: 5
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
    it('should accept strings for setValue', function(done) {
        var onNext = sinon.spy();
        var model = new Model();

        toObservable(model.
            setValue('test[0]', 6)).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.equals(6);
            }).
            subscribe(noOp, done, done);
    });
});
