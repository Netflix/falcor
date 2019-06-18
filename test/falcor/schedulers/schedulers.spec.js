var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var TimeoutScheduler = require('./../../../lib/schedulers/TimeoutScheduler');

describe("Schedulers", function() {
    var nextTick = new TimeoutScheduler(0);
    var timeout16 = new TimeoutScheduler(16);
    var timeout100 = new TimeoutScheduler(100);
    var immediate = new ImmediateScheduler();

    it("should do an immediate scheduler", function() {
        var trigger = true;
        immediate.schedule(function() {
            expect(trigger).toBe(true);
        });
        trigger = false;
    });

    it("should do a timeout", function(done) {
        var trigger = true;
        timeout16.schedule(function() {
            expect(trigger).toBe(false);
            done();
        });
        trigger = false;
    });

    it("should verify that longer timeouts happen after shorter timeouts.", function(done) {
        var trigger = true;
        timeout16.schedule(function() {
            expect(trigger).toBe(false);
            trigger = true;
        });
        timeout100.schedule(function() {
            expect(trigger).toBe(true);
            done();
        });
        trigger = false;
    });
});
