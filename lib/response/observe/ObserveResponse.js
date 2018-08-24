var toTree = require("falcor-path-utils").toTree;
var ModelResponse = require("../ModelResponse");

function ObserveResponse(model, paths) {
  this.model = model;
  this.paths = paths;
}

ObserveResponse.prototype = Object.create(ModelResponse.prototype);

ObserveResponse.prototype._subscribe = function _subscribe(observer) {
  var observerId = uniqueId();
  var pathObservers = this.model._root._pathObservers;
  pathObservers.push({
    id: observerId,
    observer: observer,
    paths: this.paths,
    pathMap: toTree(this.paths)
  });
  return {
    dispose: function dispose() {
      var pathObs = pathObservers.find(function(po) {
        return po.id === observerId;
      });
      if (!pathObs) {
        return;
      }
      pathObservers.splice(pathObservers.indexOf(pathObs), 1);
    }
  };
};

var autoIncrementingId = 0;
function uniqueId() {
  return autoIncrementingId++;
}

module.exports = ObserveResponse;
