var Rx = require("rx/dist/rx");
var Disposable = Rx.Disposable;

function TimeoutScheduler(delay) {
    this.delay = delay;
}

TimeoutScheduler.prototype.schedule = function schedule(action) {
    var id = setTimeout(action, this.delay);
    return Disposable.create(function() {
        if(id !== undefined) {
            clearTimeout(id);
            id = undefined;
        }
    });
};

TimeoutScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    var id = setTimeout(function() {
        action(self, state);
    }, this.delay);
    return Disposable.create(function() {
        if(id !== undefined) {
            clearTimeout(id);
            id = undefined;
        }
    });
};

module.exports = TimeoutScheduler;
