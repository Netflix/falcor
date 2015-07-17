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
});