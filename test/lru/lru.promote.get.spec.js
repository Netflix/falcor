var falcor = require("./../../lib/");
var Model = falcor.Model;
var chai = require("chai");
var expect = chai.expect;
var _ = require('lodash');
var get = require('./../../lib/get');
var getWithPathsAsJSONGraph = get.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = get.getWithPathsAsPathMap;

var __head = require("./../../lib/internal/head");
var __tail = require("./../../lib/internal/tail");
var __next = require("./../../lib/internal/next");
var __prev = require("./../../lib/internal/prev");

describe('Get', function () {
    describe('getPaths', function () {
        it('should promote the get item to the head _toJSONG.', function() {
            var model = new Model();
            model.set({json: {1: 'I am 1'}}).subscribe();
            model.set({json: {2: 'I am 2'}}).subscribe();
            model.set({json: {3: 'I am 3'}}).subscribe();

            getWithPathsAsJSONGraph(model, [['1']], [{}]);
            expect(model._root[__head].value).to.equal('I am 1');
        });
        it('should promote the get item to the head toJSON.', function() {
            var model = new Model();
            model.set({json: {1: 'I am 1'}}).subscribe();
            model.set({json: {2: 'I am 2'}}).subscribe();
            model.set({json: {3: 'I am 3'}}).subscribe();

            getWithPathsAsPathMap(model, [['1']], [{}]);
            expect(model._root[__head].value).to.equal('I am 1');
        });
    });
});
describe('Multiple Gets', function () {
    it('should promote the get item to the head toJSON.', function() {
        var model = new Model();
        model.set({json: {1: 'I am 1'}}).subscribe();
        model.set({json: {2: 'I am 2'}}).subscribe();
        model.set({json: {3: 'I am 3'}}).subscribe();

        expect(model._root[__head].value).to.equal('I am 3');
        expect(model._root[__head][__next].value).to.equal('I am 2');
        expect(model._root[__head][__next][__next].value).to.equal('I am 1');
        getWithPathsAsPathMap(model, [['2']], [{}]);
        getWithPathsAsPathMap(model, [['1']], [{}]);
        var current = model._root[__head];
        expect(current.value).to.equal('I am 1');
        current = current[__next];
        expect(current.value).to.equal('I am 2');
        current = current[__next];
        expect(current.value).to.equal('I am 3');
        expect(current[__next]).to.equal(undefined);
        current = current[__prev];
        expect(current.value).to.equal('I am 2');
        current = current[__prev];
        expect(current.value).to.equal('I am 1');
        expect(current[__prev]).to.equal(undefined);
    });
    it('should promote the get item to the head _toJSONG.', function() {
        var model = new Model();
        model.set({json: {1: 'I am 1'}}).subscribe();
        model.set({json: {2: 'I am 2'}}).subscribe();
        model.set({json: {3: 'I am 3'}}).subscribe();

        expect(model._root[__head].value).to.equal('I am 3');
        expect(model._root[__head][__next].value).to.equal('I am 2');
        expect(model._root[__head][__next][__next].value).to.equal('I am 1');
        getWithPathsAsJSONGraph(model, [['2']], [{}]);
        getWithPathsAsJSONGraph(model, [['1']], [{}]);
        var current = model._root[__head];
        expect(current.value).to.equal('I am 1');
        current = current[__next];
        expect(current.value).to.equal('I am 2');
        current = current[__next];
        expect(current.value).to.equal('I am 3');
        expect(current[__next]).to.equal(undefined);
        current = current[__prev];
        expect(current.value).to.equal('I am 2');
        current = current[__prev];
        expect(current.value).to.equal('I am 1');
        expect(current[__prev]).to.equal(undefined);
    });
});
