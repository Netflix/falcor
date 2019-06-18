var falcor = require("./../../lib/");
var Model = falcor.Model;
var _ = require('lodash');
var get = require('./../../lib/get');
var getWithPathsAsJSONGraph = get.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = get.getWithPathsAsPathMap;
var cacheGenerator = require('./../CacheGenerator');

var __head = require("./../../lib/internal/head");
var __tail = require("./../../lib/internal/tail");
var __next = require("./../../lib/internal/next");
var __prev = require("./../../lib/internal/prev");
var __key = require("./../../lib/internal/key");

describe('Get', function () {
    describe('getPaths', function () {
        it('should promote the get item to the head _toJSONG.', function() {
            var model = new Model();
            model.set({json: {1: 'I am 1'}}).subscribe();
            model.set({json: {2: 'I am 2'}}).subscribe();
            model.set({json: {3: 'I am 3'}}).subscribe();

            getWithPathsAsJSONGraph(model, [['1']], [{}]);
            expect(model._root[__head].value).toBe('I am 1');
        });
        it('should promote the get item to the head toJSON.', function() {
            var model = new Model();
            model.set({json: {1: 'I am 1'}}).subscribe();
            model.set({json: {2: 'I am 2'}}).subscribe();
            model.set({json: {3: 'I am 3'}}).subscribe();

            getWithPathsAsPathMap(model, [['1']], [{}]);
            expect(model._root[__head].value).toBe('I am 1');
        });
    });
    it('should promote references on a get.', function() {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var root = model._root;
        var curr = root[__head];
        expect(curr[__key]).toBe('title');
        expect(curr.value).toEqual('Video 0');

        curr = curr[__next];
        expect(curr[__key]).toBe('item');
        expect(curr.value).toEqual(['videos', '0']);

        curr = curr[__next];
        expect(curr[__key]).toBe('0');
        expect(curr.value).toEqual(['lists', 'A']);

        curr = curr[__next];
        expect(curr[__key]).toBe('lolomo');
        expect(curr.value).toEqual(['lolomos', '1234']);
        expect(curr[__next]).toBeUndefined();

        model.get(['lolomo', 0]).subscribe();

        // new order to the list
        curr = root[__head];
        expect(curr[__key]).toBe('0');
        expect(curr.value).toEqual(['lists', 'A']);

        curr = curr[__next];
        expect(curr[__key]).toBe('lolomo');
        expect(curr.value).toEqual(['lolomos', '1234']);

        curr = curr[__next];
        expect(curr[__key]).toBe('title');
        expect(curr.value).toEqual('Video 0');

        curr = curr[__next];
        expect(curr[__key]).toBe('item');
        expect(curr.value).toEqual(['videos', '0']);
        expect(curr[__next]).toBeUndefined();
    });
});
describe('Multiple Gets', function () {
    it('should promote the get item to the head toJSON.', function() {
        var model = new Model();
        model.set({json: {1: 'I am 1'}}).subscribe();
        model.set({json: {2: 'I am 2'}}).subscribe();
        model.set({json: {3: 'I am 3'}}).subscribe();

        expect(model._root[__head].value).toBe('I am 3');
        expect(model._root[__head][__next].value).toBe('I am 2');
        expect(model._root[__head][__next][__next].value).toBe('I am 1');
        getWithPathsAsPathMap(model, [['2']], [{}]);
        getWithPathsAsPathMap(model, [['1']], [{}]);
        var current = model._root[__head];
        expect(current.value).toBe('I am 1');
        current = current[__next];
        expect(current.value).toBe('I am 2');
        current = current[__next];
        expect(current.value).toBe('I am 3');
        expect(current[__next]).toBe(undefined);
        current = current[__prev];
        expect(current.value).toBe('I am 2');
        current = current[__prev];
        expect(current.value).toBe('I am 1');
        expect(current[__prev]).toBe(undefined);
    });
    it('should promote the get item to the head _toJSONG.', function() {
        var model = new Model();
        model.set({json: {1: 'I am 1'}}).subscribe();
        model.set({json: {2: 'I am 2'}}).subscribe();
        model.set({json: {3: 'I am 3'}}).subscribe();

        expect(model._root[__head].value).toBe('I am 3');
        expect(model._root[__head][__next].value).toBe('I am 2');
        expect(model._root[__head][__next][__next].value).toBe('I am 1');
        getWithPathsAsJSONGraph(model, [['2']], [{}]);
        getWithPathsAsJSONGraph(model, [['1']], [{}]);
        var current = model._root[__head];
        expect(current.value).toBe('I am 1');
        current = current[__next];
        expect(current.value).toBe('I am 2');
        current = current[__next];
        expect(current.value).toBe('I am 3');
        expect(current[__next]).toBe(undefined);
        current = current[__prev];
        expect(current.value).toBe('I am 2');
        current = current[__prev];
        expect(current.value).toBe('I am 1');
        expect(current[__prev]).toBe(undefined);
    });

    it('should promote references on a get.', function() {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var root = model._root;
        var curr = root[__head];
        expect(curr[__key]).toBe('title');
        expect(curr.value).toEqual('Video 0');

        curr = curr[__next];
        expect(curr[__key]).toBe('item');
        expect(curr.value).toEqual(['videos', '0']);

        curr = curr[__next];
        expect(curr[__key]).toBe('0');
        expect(curr.value).toEqual(['lists', 'A']);

        curr = curr[__next];
        expect(curr[__key]).toBe('lolomo');
        expect(curr.value).toEqual(['lolomos', '1234']);
        expect(curr[__next]).toBeUndefined();

        model.get(['lolomo', 0]).subscribe();

        // new order to the list
        curr = root[__head];
        expect(curr[__key]).toBe('0');
        expect(curr.value).toEqual(['lists', 'A']);

        curr = curr[__next];
        expect(curr[__key]).toBe('lolomo');
        expect(curr.value).toEqual(['lolomos', '1234']);

        curr = curr[__next];
        expect(curr[__key]).toBe('title');
        expect(curr.value).toEqual('Video 0');

        curr = curr[__next];
        expect(curr[__key]).toBe('item');
        expect(curr.value).toEqual(['videos', '0']);
        expect(curr[__next]).toBeUndefined();
    });
});
