var falcor = require('./../../../lib/');
var Model = falcor.Model;
var expect = require('chai').expect;

describe("root onChange handler", function () {
    it("is called when the root's version changes but before the subscription is disposed.", function () {
        var changed = false;
        var calledBeforeEnsure = false;
        var model = new Model({
            onChange: function () {
                changed = true;
            }
        });

        toObservable(model.
            set({
                path: ["a", "b", "c"],
                value: "foo"
            })).
            ensure(function() {
                if(changed === true) {
                    calledBeforeEnsure = true;
                }
            }).
            subscribe();

        expect(changed, "onChange wasn't called.").to.be.ok;
        expect(calledBeforeEnsure, "onChange wasn't called before the subscription was disposed.").to.be.ok;
    });
    it("is called in the context of the root Model", function() {
        var topLevelModel = new Model({
            onChange: function() {
                expect(this).to.equal(topLevelModel);
            }
        });
        toObservable(topLevelModel.set({
            path: ["a", "b", "c"],
            value: "foo"
        }))
        .subscribe();
    });
    it("is called in the context of the root Model synchronously when initialized with a cache", function() {
        var onChangeContext;
        var onChangeCalledSynchronously = false;
        var topLevelModel = new Model({
            onChange: function() {
                onChangeContext = this;
                expect(topLevelModel).to.not.be.ok;
                onChangeCalledSynchronously = true;
            },
            cache: { a: { b: { c: "foo" } } }
        });
        expect(onChangeContext).to.equal(topLevelModel)
        expect(onChangeCalledSynchronously).to.be.true;
    });
});
