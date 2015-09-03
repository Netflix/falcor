var sinon = require('sinon');
var expect = require('chai').expect;
var noOp = function() {};
var falcor = require('./../../lib');
var Model = falcor.Model;

module.exports = function() {
    require("./pathMaps");
    require("./pathSets");
    it('should invalidate with pathSyntax', function(done) {
        var model = new Model({
            cache: {
                foo: {
                    bar: 5,
                    bazz: 7
                }
            }
        });

        model.invalidate('foo.bar');

        var onNext = sinon.spy();
        model.
            get('foo.bar', 'foo.bazz').
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    json: {
                        foo: {
                            bazz: 7
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
};
