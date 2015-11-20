var falcor = require('./../../../lib');
var Model = falcor.Model;
var sinon = require('sinon');
var expect = require('chai').expect;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};

describe('Spec', function() {
    it('should deref on a __path cache response.', function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['lolomo', 0, 0, 'item', 'title'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;

                var json = onNext.getCall(0).args[0].json;
                var lolomoModel = model.deref(json.lolomo);

                expect(lolomoModel._path).to.deep.equals(['lolomos', '1234']);
            }).
            subscribe(noOp, done, done);
    });
});
