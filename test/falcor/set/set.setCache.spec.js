var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require('rx');
var expect = require('chai').expect;
var Cache = require('../../data/Cache');
var LocalDataSource = require('../../data/LocalDataSource');
var $ref = Model.ref;

describe('Cache Only', function() {
    it("should be fine when you set an empty cache", function(done) {
        var model = new Model({source: new LocalDataSource({
            a: { b: $ref("a"),
                 c: "foo" }
        })});
        model.setCache({});
        model.get("a.b.c").subscribe(function(x) {
            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        }, done, done);
    });
    it("should be fine when you set an undefined cache", function(done) {
        var model = new Model({source: new LocalDataSource({
            a: { b: $ref("a"),
                 c: "foo" }
        })});
        model.setCache(undefined);
        model.get("a.b.c").subscribe(function(x) {
            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        }, done, done);
    });
    it("should be fine when you set an empty cache with a pre-existing cache", function(done) {
        var model = new Model({
            cache: { a: {
                b: $ref("a"),
                c: "foo" } },
            source: new LocalDataSource({
                a: { b: $ref("a"),
                     c: "foo" }
            })});
        model.setCache({});
        model.get("a.b.c").subscribe(function(x) {
            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        }, done, done);
    });
    it("should be fine when you set an undefined cache with a pre-existing cache", function(done) {
        var model = new Model({
            cache: { a: {
                b: $ref("a"),
                c: "foo" } },
            source: new LocalDataSource({
                a: { b: $ref("a"),
                     c: "foo" }
            })});
        model.setCache(undefined);
        model.get("a.b.c").subscribe(function(x) {
            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        }, done, done);
    });
    it("should be fine when you set a new cache", function(done) {
        var model = new Model({
            cache: { a: {
                b: $ref("a"),
                c: "foo" } },
            source: new LocalDataSource({
                a: { b: $ref("d") },
                d: { c: "foo" }
            })});
        model.setCache({
                a: { b: $ref("d") },
                d: { c: "foo" }
            });
        model.get("a.b.c").subscribe(function(x) {
            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        }, done, done);
    });
    it("should be fine when you hydrate from an existing cache", function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: $ref("a"),
                    c: "foo"
                }
            },
            source: new LocalDataSource({
                a: {
                    b: $ref("d")
                },
                d: {
                    c: "foo"
                }
            })});

        var cache = model.getCache();
        model.setCache({});

        model.get("a.b.c").subscribe(function(x) {
            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        });

        model.setCache(cache);
        model.get("a.b.c").subscribe(function(x) {
            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        }, done, done);
    });
    it("should re-establish atoms and references when you hydrate from an existing cache into a completely new model instance", function(done) {
        var modelOrig = new Model({
            cache: {
                a: {
                    b: $ref("d")
                },
                d: {
                    c: "foo"
                }
            }
        });

        var cache = modelOrig.getCache();
        var modelNew = new Model();

        modelNew.setCache(cache);
        modelNew.get("a.b.c").subscribe(function(x) {

            expect(x).to.deep.equal({
                json: { a: { b: { c: "foo" } }}
            });
        }, done, done);

    });
});