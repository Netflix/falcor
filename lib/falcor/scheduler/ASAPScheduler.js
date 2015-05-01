var asap = require('asap');


function ASAPScheduler() {
}

ASAPScheduler.prototype = {
    schedule: function(action) {
        asap(action);
    }
};

module.exports = ASAPScheduler;
