var falcor = require("./../../../lib/");
var Model = falcor.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var noOp = function() {};

describe('ModelDataSourceAdapter', function() {
    it('ensure atoms remain as strings if model created.', function(done) {
        var model = new Model({
            cache: {
                hello: 'world'
            }
        });

        var onNext = sinon.spy();
        model.
            asDataSource().
            get([['hello']]).
            doAction(onNext, noOp, function() {
                expect(onNext.callCount).to.equals(1);
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: 'world'
                    },
                    paths: [['hello']]
                });
            }).
            subscribe(noOp, done, done);
    });
});
