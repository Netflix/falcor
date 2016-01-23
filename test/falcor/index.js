var expect = require('chai').expect;
var sinon = require('sinon');

var falcor = require('./../../lib');
var Model = falcor.Model;
var toObservable = require('./../toObs');

var noOp = function() {};

describe('Operations', function() {
    require('./get');
    require('./set');
    require('./call');
    require('./invalidate');
    require('./schedulers');
    require('./deref');
    require('./error');

    it('should filter the meta data from a falcor response.', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        c: 42
                    }
                }
            }
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['a', 'b', 'c'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(falcor.keys(onNext.getCall(0).args[0].json.a)).to.deep.equals([
                    'b'
                ]);
            }).
            subscribe(noOp, done, done);
    });

    it('should return undefined when undefined is passed into falcor.keys', function() {
        expect(falcor.keys()).to.equals(undefined);
    });
});
