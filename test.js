var Model = require('./lib').Model;
var simple = [['videos', 1234, 'summary']];
var noOp = function() {};
var RequestQueueV2 = require('./lib/request/RequestQueueV2');
var ImmediateScheduler = require('./lib/schedulers/ImmediateScheduler');
var TriggerDataSource = require('./performance/TriggerDataSource');
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

for (var i = 0; i < 200000; ++i) {
    triggerQV2.get(simple, simple, function() { });
    triggerQV2.get(simple, simple, function() { });
    triggerSource.trigger();
}
