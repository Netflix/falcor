var falcor = require('falcor');
var Model = falcor.Model;
var expect = require('chai').expect;

describe("root onChange handler", function () {
    it("is called when the root's version changes", function () {
        var changed = false;
        var model = new Model({
            root: {
                expired: [],
                syncRefCount: 0,
                unsafeMode: false,
                onChange: function () {
                    changed = true;
                }
            }
        });

        model.set({
            path: ["a", "b", "c"],
            value: "foo"
        }).subscribe();

        expect(changed).to.be.ok;
    });
});