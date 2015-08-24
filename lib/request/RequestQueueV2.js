var falcorPathUtils = require('falcor-path-utils');
var pathsComplementFromTree = falcorPathUtils.pathsComplementFromTree;

function RequestQueueV2(model, scheduler) {
    this._model = model;
    this._scheduler = scheduler;
    this._requests = [];
}

RequestQueueV2.prototype = {
    get: function(paths) {

    },

    _getGetRequests: function() {
    },

    _removeRequest: function() {
    }
};

module.exports = RequestQueueV2;
