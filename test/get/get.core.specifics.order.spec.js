var falcor = require('./../../lib');
var Model = falcor.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var noOp = function() {};

describe.only('Order of operations.', function() {
    it('should be able to clone then setCache', function(done) {
        var source = new Model({
            cache: {
                lolomo: {
                    summary: {}
                }
            }
        }).asDataSource();

        var model = new Model({source: source});
        var onNext = sinon.spy();
        model.
            clone().
            setCache(undefined).
            deref('lolomo', 'summary').
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0].getPath()).to.deep.equals(['lolomo']);
            }).
            subscribe(noOp, done, done);
    });
});
