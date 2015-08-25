var Model = require("./../../../lib").Model;
var simple = [["videos", 1234, "summary"]];
var simpleDiff = [["videos", 555, "summary"]];
var noOp = function() {};
var RequestQueueV2 = require("./../../../lib/request/RequestQueueV2");
var RequestQueue = require("./../../../lib/request/RequestQueue");
var ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");

// single data trigger
var TriggerDataSource = require("./../../TriggerDataSource");
var triggerSource = new TriggerDataSource({
    jsonGraph: {
        videos: {
            1234: {
                summary: "Test"
            }
        }
    }
});
var triggerModel = new Model({
    source: triggerSource
});
var triggerQV2 = new RequestQueueV2(triggerModel, new ImmediateScheduler());
var triggerQ = new RequestQueue(triggerModel, new ImmediateScheduler());

// Multiple data trigger
var triggerDiffSource = new TriggerDataSource([{
    jsonGraph: {
        videos: {
            1234: {
                summary: "Test"
            }
        }
    }
}, {
    jsonGraph: {
        videos: {
            555: {
                summary: "Test"
            }
        }
    }
}]);

var triggerDiffModel = new Model({
    source: triggerDiffSource
});
var triggerDiffQV2 = new RequestQueueV2(triggerDiffModel, new ImmediateScheduler());
var triggerDiffQ = new RequestQueue(triggerDiffModel, new ImmediateScheduler());

module.exports = {
    name: "RequestQueue",
    tests: {
        "RequestQueueV2.get#Simple Path": function(done) {
            triggerQV2.get(simple, simple, function() { });
            triggerSource.trigger();
        },

        "RequestQueue(OLD).get#Simple Path": function(done) {
            triggerQ.get(simple).subscribe(noOp, noOp, function() { });
            triggerSource.trigger();
        },

        "RequestQueueV2.batch-and-dedupe#Simple Path": function(done) {
            triggerQV2.get(simple, simple, function() { });
            triggerQV2.get(simple, simple, function() { });
            triggerSource.trigger();
        },

        "RequestQueue(OLD).batch-and-dedupe#Simple Path": function(done) {
            triggerQ.get(simple).subscribe(noOp, noOp, function() { });
            triggerQ.get(simple).subscribe(noOp, noOp, function() { });
            triggerSource.trigger();
        },

        "RequestQueueV2.batch-and-no-dedupe#Simple Path": function(done) {
            triggerDiffQV2.get(simple, simple, function() { });
            triggerDiffQV2.get(simple, simple, function() { });
            triggerDiffSource.trigger();
        },

        "RequestQueue(OLD).batch-and-no-dedupe#Simple Path": function(done) {
            triggerDiffQ.get(simple).subscribe(noOp, noOp, function() { });
            triggerDiffQ.get(simple).subscribe(noOp, noOp, function() { });
            triggerDiffSource.trigger();
        }
    }
};
