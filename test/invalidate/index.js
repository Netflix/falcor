var sinon = require('sinon');
var expect = require('chai').expect;
var noOp = function() {};
var falcor = require('./../../lib');
var Model = falcor.Model;
var strip = require("./../cleanData").stripDerefAndVersionKeys;

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
        toObservable(model.
            get('foo.bar', 'foo.bazz')).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        foo: {
                            bazz: 7
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should throw for undefined paths', function() {
        var model = new Model({ cache: { value: 1 } });
        expect(() => model.invalidate(undefined)).to.throw();
        expect(model.getCache()).to.deep.equal({ value: 1 });
    });

    it('should throw for empty paths', function() {
        var model = new Model({ cache: { value: 1 } });
        expect(() => model.invalidate([])).to.throw();
        expect(model.getCache()).to.deep.equal({ value: 1 });
    });

    it('should do nothing for non-existing paths', function() {
        var model = new Model({ cache: { value: 1 } });
        model.invalidate('no.such.path');
        expect(model.getCache()).to.deep.equal({ value: 1 });
    });
};
