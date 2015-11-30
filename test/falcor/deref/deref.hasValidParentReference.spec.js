var falcor = require('./../../../lib');
var Model = falcor.Model;
var sinon = require('sinon');
var expect = require('chai').expect;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var __head = require('./../../../lib/internal/head');
var __next = require('./../../../lib/internal/next');
var __key = require('./../../../lib/internal/key');

describe('fromWhenceYouCame', function() {
    it('should have an invalid parent reference when derefd and fromWhenceYouCame is false.', function() {
        var cache = cacheGenerator(0, 30);
        var model = new Model({
            cache: cache
        });

        var lolomoModel;

        // this is sync, no dataSource
        model.
            get(['lolomo', 0, 0, 'item', 'title']).
            subscribe(function(x) {
                var lolomo = x.json.lolomo;
                lolomoModel = model.deref(lolomo);
            });

        expect(lolomoModel._hasValidParentReference()).to.be.ok;
    });
    it('should have an valid parent reference when derefd and fromWhenceYouCame is true.', function() {
        var cache = cacheGenerator(0, 30);
        var model = new Model({
            cache: cache
        })._fromWhenceYouCame();

        var lolomoModel;

        // this is sync, no dataSource
        model.
            get(['lolomo', 0, 0, 'item', 'title']).
            subscribe(function(x) {
                var lolomo = x.json.lolomo;
                lolomoModel = model.deref(lolomo);
            });

        expect(lolomoModel._hasValidParentReference()).to.be.ok;
    });
    it('should have an valid parent reference when derefd and fromWhenceYouCame is true with non reference keys.', function() {
        var cache = cacheGenerator(0, 30);
        var model = new Model({
            cache: {
                a: {
                    b: {
                        c: 'hello world'
                    }
                }
            }
        })._fromWhenceYouCame();

        var aModel;

        // this is sync, no dataSource
        model.
            get(['a', 'b', 'c']).
            subscribe(function(x) {
                var a = x.json.a;
                aModel = model.deref(a);
            });

        expect(aModel._hasValidParentReference()).to.be.ok;
    });
    it('should invalidate the derefs reference and maintain correct deref and hasValidParentReference becomes false.', function() {
        var cache = cacheGenerator(0, 30);
        var model = new Model({
            cache: cache
        })._fromWhenceYouCame();

        var lolomoModel;

        // this is sync, no dataSource
        model.
            get(['lolomo', 0, 0, 'item', 'title']).
            subscribe(function(x) {
                var lolomo = x.json.lolomo;
                lolomoModel = model.deref(lolomo);
            });
        model.invalidate(['lolomo']);

        expect(lolomoModel._hasValidParentReference()).to.not.be.ok;
    });

    it('should allow for set overwrite to signal derefs become invalid, but maintain derefd reference.', function() {
        var cache = cacheGenerator(0, 30);
        var model = new Model({
            cache: cache
        })._fromWhenceYouCame();

        var lolomoModel;

        // this is sync, no dataSource
        model.
            get(['lolomo', 0, 0, 'item', 'title']).
            subscribe(function(x) {
                var lolomo = x.json.lolomo;
                lolomoModel = model.deref(lolomo);
            });
        model.
            set({
                path: ['lolomo'],
                value: Model.ref(['lolomos', '555'])
            }).
            subscribe();

        expect(lolomoModel._hasValidParentReference()).to.not.be.ok;
    });

    it('should set and exceed maxSize and maintain correct deref and hasValidParentReference becomes false.', function() {
        var cache = cacheGenerator(0, 30);
        var model = new Model({
            cache: cache,
            maxSize: 3600,

            // Only clean up 5% of the cache
            collectRatio: 0.95
        })._fromWhenceYouCame();

        var lolomoModel;
        var listModel;

        // this is sync, no dataSource
        // lolomo should be in the back of the cache again.
        model.
            get(['lolomo', {to:2}, {to:9}, 'item', 'title']).
            subscribe(function(x) {
                var lolomo = x.json.lolomo;
                lolomoModel = model.deref(lolomo);
                listModel = model.deref(lolomo[0]);
            });

        // Move the other references to the front of the LRU list.
        // One of the problems in dealing with small amounts of data / size
        // Is when things clean up, it causes side effects with references
        // and what was cleaned up.  But that is only in these single request
        // trivial tests
        lolomoModel.get([{to: 2}, 0, 'item']).subscribe();

        listModel.
            set({
                json: {
                    10: {
                        item: {
                            title: 'Running man',
                            rating: 5
                        }
                    },
                    11: {
                        item: {
                            title: 'Commando',
                            rating: 5
                        }
                    }
                }
            }).
            subscribe();

        var node = model._root[__head];
        while (node) {
            expect(node[__key]).to.not.equals('lolomo');
            node = node[__next];
        }

        var foundA, foundB, foundC;
        var node = model._root[__head];
        while (node) {
            foundA = foundA || node.value[1] === 'A';
            foundB = foundB || node.value[1] === 'B';
            foundC = foundC || node.value[1] === 'C';
            node = node[__next];
        }
        expect(foundA, 'List A does not exist').to.be.ok;
        expect(foundB, 'List B does not exist').to.be.ok;
        expect(foundC, 'List C does not exist').to.be.ok;

        expect(lolomoModel._hasValidParentReference()).to.not.be.ok;
    });
});

function log(model) {
    var root = model._root;
    var node = root[__head];
    console.log('------------------');
    while (node) {
        console.log(node[__key]);
        node = node[__next];
    }
}
