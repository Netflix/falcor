var asap = require("asap");
var Rx = require("rx/dist/rx");
var Disposable = Rx.Disposable;

function ASAPScheduler() {}

ASAPScheduler.prototype.schedule = function schedule(action) {
    asap(action);
    return Disposable.empty;
};

ASAPScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    asap(function() {
        action(self, state);
    });
    return Disposable.empty;
};

module.exports = ASAPScheduler;
