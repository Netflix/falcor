var sinon = require("sinon");
var expect = require("chai").expect;

var falcor = require("../../../lib/");
var Model = falcor.Model;
var cacheGenerator = require("../../CacheGenerator");
var ErrorDataSource = require("../../data/ErrorDataSource");
var strip = require("../../cleanData").stripDerefAndVersionKeys;
var complement = require("../../../lib/request/complement");
var findPartialIntersections = require("../../../lib/request/complement")
    .findPartialIntersections;

describe("complement", function() {
    var matchingPath;
    var matchingPathTree;

    beforeEach(function() {
        matchingPath = ["lolomo", 123, "summary"];
        matchingPathTree = { "3": { lolomo: { "123": { summary: null } } } };
    });

    it("returns null if no paths are provided", function() {
        expect(complement([], [], {})).to.be.null;
    });

    it("returns null if no deduping was possible", function() {
        var paths = [["videos", 0, "title"]];
        expect(complement(paths, paths, {})).to.be.null;
    });

    it("returns the complement consisting of paths that cannot be deduped", function() {
        var nonMatchingPath = ["videos", 0, "title"];
        var paths = [nonMatchingPath, matchingPath]; // Including matchingPath so we get a non-null result
        var pathTree = matchingPathTree;
        expect(complement(paths, paths, pathTree)).to.deep.equal([
            [matchingPath],
            [nonMatchingPath],
            [nonMatchingPath]
        ]);
    });

    it("returns the complement and intersection consisting of paths that can be partially deduped", function() {
        var partialMatchingPath = ["videos", [0, 1], "title"];
        var paths = [partialMatchingPath];
        var pathTree = { "3": { videos: { "0": { title: null } } } };

        expect(complement(paths, paths, pathTree)).to.deep.equal([
            [["videos", 0, "title"]],
            [["videos", 1, "title"]],
            [["videos", 1, "title"]]
        ]);
    });

    it("returns the intersection consisting of paths that can be fully deduped", function() {
        var paths = [matchingPath];
        var pathTree = matchingPathTree;
        expect(complement(paths, paths, pathTree)).to.deep.equal([
            [matchingPath],
            [],
            []
        ]);
    });

    describe("with optimized paths shorted than requested paths", function() {
        it("returns the complement and intersection consisting of paths than can be partially deduped", function() {
            var partialMatchingRequestedPath = [
                "lolomo",
                123,
                0,
                0,
                ["title", "boxart"]
            ];
            var partialMatchingOptimizedPath = [
                "videosById",
                456,
                ["title", "boxart"]
            ];
            var pathTree = { "3": { videosById: { "456": { title: null } } } };

            expect(
                complement(
                    [partialMatchingRequestedPath],
                    [partialMatchingOptimizedPath],
                    pathTree
                )
            ).to.deep.equal([
                [["lolomo", 123, 0, 0, "title"]],
                [["videosById", 456, "boxart"]],
                [["lolomo", 123, 0, 0, "boxart"]]
            ]);
        });
    });

    describe("with optimized paths longer than requested paths", function() {
        it("returns the complement and intersection consisting of paths than can be partially deduped", function() {
            var partialMatchingRequestedPath = [
                "videos",
                123,
                ["title", "boxart"]
            ];
            var partialMatchingOptimizedPath = [
                "some",
                "weird",
                "long",
                "ref",
                456,
                ["title", "boxart"]
            ];
            var pathTree = {
                "6": {
                    some: { weird: { long: { ref: { "456": { title: null } } } } }
                }
            };

            expect(
                complement(
                    [partialMatchingRequestedPath],
                    [partialMatchingOptimizedPath],
                    pathTree
                )
            ).to.deep.equal([
                [["videos", 123, "title"]],
                [["some", "weird", "long", "ref", 456, "boxart"]],
                [["videos", 123, "boxart"]]
            ]);
        });
    });
});
