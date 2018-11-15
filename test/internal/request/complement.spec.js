const expect = require("chai").expect;
const complement = require("../../../lib/request/complement");
const findPartialIntersections = require("../../../lib/request/complement").__test.findPartialIntersections;

describe("complement", () => {
    it("handles empty path sets", () => {
        expect(complement([], [], {})).to.deep.equal({
            intersection: [],
            optimizedComplement: [],
            requestedComplement: []
        });
    });

    it("returns all paths if no deduping possible", () => {
        const paths = [["videos", 0, "title"]];
        expect(complement(paths, paths, {})).to.deep.equal({
            intersection: [],
            optimizedComplement: paths,
            requestedComplement: paths
        });
    });

    it("returns the complement and intersection consisting of paths that can be partially deduped", () => {
        const partialMatchingPath = ["videos", [0, 1], "title"];
        const paths = [partialMatchingPath];
        const pathTree = { 3: { videos: { 0: { title: null } } } };

        expect(complement(paths, paths, pathTree)).to.deep.equal({
            intersection: [["videos", 0, "title"]],
            optimizedComplement: [["videos", 1, "title"]],
            requestedComplement: [["videos", 1, "title"]]
        });
    });
});

describe("findPartialIntersections", () => {
    let matchingPath;
    let matchingPathTree;

    beforeEach(() => {
        matchingPath = ["lolomo", 123, "summary"];
        matchingPathTree = { lolomo: { 123: { summary: null } } };
    });

    it("returns paths if no deduping was possible", () => {
        const requestedPath = ["videos", 0, "title"];
        const optimizedPath = ["videosById", 1232, "title"];

        expect(findPartialIntersections(requestedPath, optimizedPath, {})).to.deep.equal([
            [],
            [optimizedPath],
            [requestedPath]
        ]);
    });

    it("returns the intersection consisting of paths that can be fully deduped", () => {
        expect(findPartialIntersections(matchingPath, matchingPath, matchingPathTree)).to.deep.equal([
            [matchingPath],
            [],
            []
        ]);
    });

    describe("with optimized paths shorter than requested paths", () => {
        it("returns the complement and intersection consisting of paths than can be partially deduped", () => {
            const partialMatchingRequestedPath = ["lolomo", 123, 0, 0, ["title", "boxart"]];
            const partialMatchingOptimizedPath = ["videosById", 456, ["title", "boxart"]];
            const pathTree = { videosById: { 456: { title: null } } };

            expect(
                findPartialIntersections(partialMatchingRequestedPath, partialMatchingOptimizedPath, pathTree)
            ).to.deep.equal([
                [["lolomo", 123, 0, 0, "title"]],
                [["videosById", 456, "boxart"]],
                [["lolomo", 123, 0, 0, "boxart"]]
            ]);
        });
    });

    describe("with optimized paths longer than requested paths", () => {
        it("returns the complement and intersection consisting of paths than can be partially deduped", () => {
            const partialMatchingRequestedPath = ["videos", 123, ["title", "boxart"]];
            const partialMatchingOptimizedPath = ["some", "weird", "long", "ref", 456, ["title", "boxart"]];
            const pathTree = { some: { weird: { long: { ref: { 456: { title: null } } } } } };

            expect(
                findPartialIntersections(partialMatchingRequestedPath, partialMatchingOptimizedPath, pathTree)
            ).to.deep.equal([
                [["videos", 123, "title"]],
                [["some", "weird", "long", "ref", 456, "boxart"]],
                [["videos", 123, "boxart"]]
            ]);
        });

        it("halts descent into the subtree", () => {
            const requestedPath = ["videos", 123, "title"];
            const optimizedPath = ["some", "weird", "long", "ref", 456, "title"];
            const pathTree = { some: { differentPath: null } };

            expect(findPartialIntersections(requestedPath, optimizedPath, pathTree)).to.deep.equal([
                [],
                [optimizedPath],
                [requestedPath]
            ]);
        });
    });
});
