var Rx = require("rx/dist/rx");

function falcor(opts) {
    return new falcor.Model(opts);
}

if(typeof Promise !== "undefined" && Promise) {
    falcor.Promise = Promise;
} else {
    falcor.Promise = require("promise");
}

module.exports = falcor;

falcor.Model = require("falcor/Model");
