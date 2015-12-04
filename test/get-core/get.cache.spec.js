var cacheGenerator = require('./../CacheGenerator');
var falcor = require("./../../lib/");
var clean = require('./../cleanData').clean;
var Model = falcor.Model;
var expect = require('chai').expect;
var atom = Model.atom;

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

    it('should serialize a cache with undefined values.', function() {
        var model = new Model({
            cache: {
                test: 'foo'
            }
        });

        // mimicking cache clean-up
        model._root.cache.testing = undefined;
        var cache = model.getCache();
        clean(cache);
        expect(cache).to.deep.equals({
            test: atom('foo', {$modelCreated: true})
        });
    });
});

