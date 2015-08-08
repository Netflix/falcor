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

        model.set({
            path: ["a", "b", "c"],
            value: "foo"
        }).ensure(function() {
            if(changed === true) {
                calledBeforeEnsure = true;
            }
        }).subscribe();

        expect(changed, "onChange wasn't called.").to.be.ok;
        expect(calledBeforeEnsure, "onChange wasn't called before the subscription was disposed.").to.be.ok;
    });
});
