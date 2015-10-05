var falcor = require("./../../../lib");
var Model = falcor.Model;
var Rx = require('rx');
var clean = require('./../../cleanData').clean;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var Observable = Rx.Observable;
var sinon = require('sinon');
var expect = require('chai').expect;
var clean = require('./../../cleanData').stripDerefAndVersionKeys;

describe('getValue', function() {
    it('should get a value out', function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var onNext = sinon.spy();
        model.
            getValue(['lolomo', 0, 0, 'item', 'title']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.equals('Video 0');
            }).
            subscribe(noOp, done, done);
    });

    it('should get an error out of the cache.', function(done) {
        var model = new Model({
            cache: {
                to: Model.error('Oops')
            }
        });

        var onNext = sinon.spy();
        model.
            getValue(['to']).
            doAction(onNext, function(err) {
                expect(onNext.callCount).to.equal(0);
                expect(err).to.deep.equals([{
                    path: ['to'],
                    value: 'Oops'
                }]);
            }).
            subscribe(noOp, function(err) {
                if (err[0] && err[0].value === 'Oops') {
                    return done();
                }
                done(err);
            }, done);
    });
});
