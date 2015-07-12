var Rx = require("rx/dist/rx") && require("rx/dist/rx.aggregates") && require("rx/dist/rx.binding");

function falcor(opts) {
    return new falcor.Model(opts);
}

if(typeof Promise !== "undefined" && Promise) {
    falcor.Promise = Promise;
} else {
    falcor.Promise = require("promise");
}

module.exports = falcor;

falcor.Model = require("./Model");
