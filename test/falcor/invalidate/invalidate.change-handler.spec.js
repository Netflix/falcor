var falcor = require('./../../../lib/');
var Model = falcor.Model;
var expect = require('chai').expect;

describe("root onChange handler", function () {
    it("is called when we invalidate a path", function () {

        var changed = false;
        var model = new Model({
            cache: { a: { b: { c: "foo" } } },
            onChange: function () {
                changed = true;
            }
        });

        model.invalidate(["a", "b", "c"]);

        expect(changed).to.be.ok;
    });
    xit("is called when we invalidate a path via JSON", function() {

        var changed = false;
        var model = new Model({
            cache: { a: { b: { c: "foo" } } },
            onChange: function () {
                changed = true;
            }
        });

        model.invalidate({ json: { a: { b: { c: true }}}});

        expect(changed).to.be.ok;
    });
    it("is called in the context of the root Model", function() {

        var firstCall = false;
        var onChangeContext = null;
        var topLevelModel = new Model({
            cache: { a: { b: { c: "foo" } } },
            onChange: function() {
                // This check ensures we don't run our expectation when the
                // onChange handler is run synchronously as a result of
                // seeding the Model with a cache.
                if (!firstCall) {
                    firstCall = true;
                    return;
                }
                onChangeContext = this;
                expect(this).to.equal(topLevelModel);
            }
        });

        topLevelModel.invalidate(["a", "b", "c"]);

        expect(onChangeContext).to.equal(topLevelModel);
    });
});
