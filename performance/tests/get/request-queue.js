var Model = require('./../../../lib').Model;
var simple = [['videos', 1234, 'summary']];
var noOp = function() {};
var RequestQueueV2 = require('./../../../lib/request/RequestQueueV2');
var RequestQueue = require('./../../../lib/request/RequestQueue');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');

var TriggerDataSource = require('./../../TriggerDataSource');
var triggerSource = new TriggerDataSource({
    jsonGraph: {
        videos: {
            1234: {
                summary: 'Test'
            }
        }
    }
});
var triggerModel = new Model({
    source: triggerSource
});
var triggerQV2 = new RequestQueueV2(triggerModel, new ImmediateScheduler());
var triggerQ = new RequestQueue(triggerModel, new ImmediateScheduler());

module.exports = {
    name: 'RequestQueue',
    tests: {
        'RequestQueueV2.get#Simple Path': function(done) {
            triggerQV2.get(simple, simple, function() {
            });
            triggerSource.trigger();
        },

        'RequestQueue(OLD).get#Simple Path': function(done) {
            triggerQ.get(simple).subscribe(noOp, noOp, function() {
            });
            triggerSource.trigger();
        },

        'RequestQueueV2.batch-and-dedupe#Simple Path': function(done) {
            triggerQV2.get(simple, simple, function() { });
            triggerQV2.get(simple, simple, function() { });
            triggerSource.trigger();
        },

        'RequestQueue(OLD).batch-and-dedupe#Simple Path': function(done) {
            triggerQ.get(simple).subscribe(noOp, noOp, function() { });
            triggerQ.get(simple).subscribe(noOp, noOp, function() { });
            triggerSource.trigger();
        }
    }
};
