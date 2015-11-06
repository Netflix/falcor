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

    it('should deref on a __key to __path cache response.', function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['lolomo', 0, 0, 'item', 'title'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;

                var json = onNext.getCall(0).args[0].json;
                var lolomoModel = model.deref(json.lolomo[0][0]);

                expect(lolomoModel._path).to.deep.equals(['lists', 'A', 0]);
            }).
            subscribe(noOp, done, done);
    });

    it('should follow __keys up to a null parent.', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        c: {
                            d: 'D'
                        }
                    }
                }
            }
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['a', 'b', 'c', 'd'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;

                var json = onNext.getCall(0).args[0].json;
                var lolomoModel = model.deref(json.a.b.c);

                expect(lolomoModel._path).to.deep.equals(['a', 'b', 'c']);
            }).
            subscribe(noOp, done, done);
    });

    it('should follow __key when the first parent is null', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        c: {
                            d: 'D'
                        }
                    }
                }
            }
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['a', 'b', 'c', 'd'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;

                var json = onNext.getCall(0).args[0].json;
                var lolomoModel = model.deref(json.a);

                expect(lolomoModel._path).to.deep.equals(['a']);
            }).
            subscribe(noOp, done, done);
    });
});
