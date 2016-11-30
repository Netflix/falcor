var falcor = require('./../../../lib');
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');
var InvalidDerefInputError = require('./../../../lib/errors/InvalidDerefInputError');
var Model = falcor.Model;
var sinon = require('sinon');
var assert = require('chai').assert;
var expect = require('chai').expect;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var isAssertionError = require('./../../isAssertionError');

describe('Error cases', function() {
    it('should error on a shorted deref path.', function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var onNext = sinon.spy();
        model.
            get(['lolomo', 0, 0, 'item', 'title']).
            subscribe(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;

                var json = onNext.getCall(0).args[0].json;
                var lolomoModel = model.deref(json.lolomo);
                model.
                    set({
                        json: {
                            lolomos: 'ohh no'
                        }
                    }).
                    subscribe();

                toObservable(lolomoModel.
                    get([0, 0, 'item', 'title'])).
                    doAction(onNext, function(err) {
                        expect(err.message).to.equals(InvalidModelError.message);
                    }).
                    subscribe(
                        done.bind(null, new Error('onNext shouldnt be called')),
                        function(err) {
                            if (isAssertionError(err)) {
                                return done(err);
                            }
                            done();
                        },
                        done.bind(null, new Error('onCompleted shouldnt be called')));
            });
    });

    it('should throw on invalid input.', function(done) {
        try {
            new Model().deref('testing');
        } catch (e) {
            expect(e.name).to.equals(InvalidDerefInputError.name);
            return done();
        }
        done(new Error('should of thrown an error.'));
    });

    it('should throw InvalidModelError on an invalidated deref path.', function() {
        var model = new Model({cache: {titlesById: {32: {name: "House of Cards"}}}});
        return model.get(["titlesById", 32, "name"]).
            then(function(response) {
                var titleModel = model.deref(response.json.titlesById[32]);
                model.invalidate(["titlesById"]);
                return titleModel.get(["name"]).
                    then(assert.fail).
                    catch(function(err) {
                        expect(err.message).to.equals(InvalidModelError.message);
                    });
            });
    });

    it('should not error on an invalidated deref path set.', function() {
        var model = new Model({cache: {titlesById: {32: {name: "House of Cards"}}}});
        return model.get(["titlesById", 32, "name"]).
            then(function(response) {
                var titleModel = model.deref(response.json.titlesById[32]);
                model.invalidate(["titlesById", 32]);
                return titleModel.set({json: {name: "Something Else"}}).
                    then(function(derefedResponse) {
                        expect(response.json.name).to.be("Something Else");
                    });
            });
    });
});
