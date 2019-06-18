var falcor = require('./../../../lib/');
var Model = falcor.Model;
var toObservable = require('../../toObs');

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

        expect(changed).toBe(true);
        expect(calledBeforeEnsure).toBe(true);
    });
});
