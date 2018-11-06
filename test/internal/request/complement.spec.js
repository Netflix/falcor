var expect = require("chai").expect;
var complement = require("../../../lib/request/complement");
var findPartialIntersections = require("../../../lib/request/complement").findPartialIntersections;

describe("complement", function() {
    it("returns null if no paths are provided", function() {
        expect(complement([], [], {})).to.be.null;
    });

    it("returns null if no deduping was possible", function() {
        var paths = [["videos", 0, "title"]];
        expect(complement(paths, paths, {})).to.be.null;
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
});

describe("findPartialIntersections", function() {
    var matchingPath;
    var matchingPathTree;

    beforeEach(function() {
        matchingPath = ["lolomo", 123, "summary"];
        matchingPathTree = { lolomo: { "123": { summary: null } } };
    });

    it("returns paths if no deduping was possible", function() {
        var requestedPath = ["videos", 0, "title"];
        var optimizedPath = ["videosById", 1232, "title"];

        expect(findPartialIntersections(requestedPath, optimizedPath, {})).to.deep.equal([
            [],
            [optimizedPath],
            [requestedPath]
        ]);
    });

    it("returns the intersection consisting of paths that can be fully deduped", function() {
        expect(findPartialIntersections(matchingPath, matchingPath, matchingPathTree)).to.deep.equal([
            [matchingPath],
            [],
            []
        ]);
    });

    describe("with optimized paths shorted than requested paths", function() {
        it("returns the complement and intersection consisting of paths than can be partially deduped", function() {
            var partialMatchingRequestedPath = ["lolomo", 123, 0, 0, ["title", "boxart"]];
            var partialMatchingOptimizedPath = ["videosById", 456, ["title", "boxart"]];
            var pathTree = { videosById: { "456": { title: null } } };

            expect(
                findPartialIntersections(
                    partialMatchingRequestedPath,
                    partialMatchingOptimizedPath,
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
            var partialMatchingRequestedPath = ["videos", 123, ["title", "boxart"]];
            var partialMatchingOptimizedPath = ["some", "weird", "long", "ref", 456, ["title", "boxart"]];
            var pathTree = { some: { weird: { long: { ref: { "456": { title: null } } } } } };

            expect(
                findPartialIntersections(
                    partialMatchingRequestedPath,
                    partialMatchingOptimizedPath,
                    pathTree
                )
            ).to.deep.equal([
                [["videos", 123, "title"]],
                [["some", "weird", "long", "ref", 456, "boxart"]],
                [["videos", 123, "boxart"]]
            ]);
        });

        it("halts descent into the subtree", function() {
            var requestedPath = ["videos", 123, "title"];
            var optimizedPath = ["some", "weird", "long", "ref", 456, "title"];
            var pathTree = { some: { differentPath: null } };

            expect(
                findPartialIntersections(
                    requestedPath,
                    optimizedPath,
                    pathTree
                )
            ).to.deep.equal([
                [],
                [optimizedPath],
                [requestedPath]
            ]);
        });
    });
});
