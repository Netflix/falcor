var cacheGenerator = require('./../../CacheGenerator');
var falcor = require("./../../../lib/");
var clean = require('./../../cleanData').clean;
var Model = falcor.Model;
var Rx = require('rx');
var noOp = function() {};
var Observable = Rx.Observable;
var _ = require('lodash');
var expect = require('chai').expect;
var $ref = falcor.Model.ref;
var $atom = falcor.Model.atom;
var $error = falcor.Model.error;

describe('getCache', function() {
    it("should serialize the cache", function() {
        var model = new Model({ cache: cacheGenerator(0, 1) });
        var cache = model.getCache();
        clean(cache);
        expect(cache).to.deep.equals(cacheGenerator(0, 1));
    });

    it("should serialize part of the cache", function() {
        var model = new Model({ cache: cacheGenerator(0, 10) });
        var cache = model.getCache(['lolomo', 0, 3, 'item', 'title']);
        clean(cache);
        expect(cache).to.deep.equals(cacheGenerator(3, 1));
    });
});

