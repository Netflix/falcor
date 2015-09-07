var falcor = require("./../../lib/");
var Model = falcor.Model;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};

var __head = require("./../../lib/internal/head");
var __tail = require("./../../lib/internal/tail");
var __next = require("./../../lib/internal/next");
var __prev = require("./../../lib/internal/prev");

describe('Overwrite', function() {
    it('should overwrite the cache and update the lru as PathValue', function() {
        var model = getModel();
        model.set({path: [1], value: 'overwrite'}).subscribe();
        testLRU(model);
    });
    it('should overwrite the cache and update the lru as JSON', function() {
        var model = getModel();
        model.set({json: {1: 'overwrite'}}).subscribe();
        testLRU(model);
    });
    it('should overwrite the cache and update the lru as JSONGraph', function() {
        var model = getModel();
        model.set({
            jsonGraph: {
                1: 'overwrite'
            },
            paths: [[1]]
        }).subscribe();
        testLRU(model);
    });
});

function getModel() {
    var model = new Model();
    model.set({json: {1: 'hello world'}}).subscribe();

    return model;
}

function testLRU(model) {
    function log(x) { console.log(JSON.stringify(x, null, 4)) }

    expect(model._root[__head].value).to.equal('overwrite');
    expect(model._root[__head].value).to.deep.equal(model._root[__tail].value);
    expect(model._root[__head][__next]).to.be.not.ok;
    expect(model._root[__head][__prev]).to.be.not.ok;
    expect(model._root[__tail][__next]).to.be.not.ok;
    expect(model._root[__tail][__prev]).to.be.not.ok;
}
