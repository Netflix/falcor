"use strict";

function falcor(opts) {
    return new falcor.Model(opts);
}

if (typeof Promise === "function") {
    falcor.Promise = Promise;
} else {
    falcor.Promise = require("promise");
}

module.exports = falcor;

falcor.Model = require("./Model");

var __head = require("./internal/head");
var __next = require("./internal/next");
var __key = require("./internal/key");
falcor.lsCache = falcor.Model.prototype.lsCache = function lsCache(model) {
    var node = model._root[__head];
    while (node) {
        console.log('key: ', node[__key]);
        node = node[__next];
    }
};
