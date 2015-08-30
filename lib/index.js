"use strict";

function falcor(opts) {
    return new falcor.Model(opts);
}

if (typeof Promise === "function") {
    falcor.Promise = Promise;
} else {
    falcor.Promise = require("promise");
}

falcor.config = {
    DEBUG: true,
    GET_WITH_PATHS_ONLY: false
};

module.exports = falcor;

falcor.Model = require("./Model");
