var falcor = require('./../../../lib/');
var Model = falcor.Model;
var expect = require('chai').expect;
var Rx = require('rx');

describe("root onChangesCompleted handler", function () {
    it("is called only once per transaction and before the subscription is disposed.", function () {

        var changes = 0;
        var changesCompleted = 0;
        var completedCalled = false;
        var calledBeforeEnsure = false;

        var mockDataSource = {
            set: function(jsonGraphEnvelope) {
                return Rx.Observable.return({
                    jsonGraph: {
                        a: {
                            b: {
                                c: "foo"
                            }
                        }
                    }
                });
            }
        };

        var model = new falcor.Model({
            source: mockDataSource,
            onChange: function() {
                changes++;
            },
            onChangesCompleted: function () {
                completedCalled = true;
                changesCompleted++;
            }
        });

        toObservable(model
            .set({
                path: ["a", "b", "c"],
                value: "foo"
            })).
            ensure(function() {
                if(completedCalled === true) {
                    calledBeforeEnsure = true;
                }
            }).
            subscribe();

        expect(changes, "onChange should have been called twice").to.equal(2);
        expect(changesCompleted, "onChangesCompleted should have been called once").to.equal(1);
        expect(completedCalled, "onChangesCompleted wasn't called.").to.be.ok;
        expect(calledBeforeEnsure, "onChangesCompleted wasn't called before the subscription was disposed.").to.be.ok;
    });
});
