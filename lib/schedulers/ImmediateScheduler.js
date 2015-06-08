var Rx = require("falcor-observable");
var Disposable = Rx.Disposable;

function ImmediateScheduler() {
    
}

ImmediateScheduler.prototype.schedule = function schedule(action) {
    action();
    return Disposable.empty;
};

ImmediateScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    action(this, state);
    return Disposable.empty;
};

module.exports = ImmediateScheduler;
