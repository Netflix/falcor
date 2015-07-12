var expect = require("chai").expect;
var collapse = require("./../../lib/support/collapse");

describe("collapse", function() {
    it("collapses a pathmap that has overlapping branch and leaf nodes", function() {

        var pathmaps = [null, {
            lolomo: 1
        }, {
            lolomo: {
                summary: 1,
                13: 1,
                14: 1
            }
        }, {
            lolomo: {
                15: {
                    rating: 1,
                    summary: 1
                },
                13: {
                    summary: 1
                },
                16: {
                    rating: 1,
                    summary: 1
                },
                14: {
                    summary: 1
                },
                17: {
                    rating: 1,
                    summary: 1
                }
            }
        }];

        var paths = collapse(pathmaps).sort(function(a, b) {
            return a.length - b.length;
        });

        var first = paths[0];
        var second = paths[1];
        var third = paths[2];
        var fourth = paths[3];

        expect(first[0] === "lolomo").to.equal(true);

        expect((
            second[0] === "lolomo")   && (
            second[1][0] === 13) && (
            second[1][1] === 14) && (
            second[1][2] === "summary")
        ).to.equal(true);

        expect((third[0] === "lolomo") && (
            third[1]["from"] === 13)   && (
            third[1]["to"] === 14)     && (
            third[2] === "summary")
        ).to.equal(true);

        expect((fourth[0] === "lolomo") && (
            fourth[1]["from"] === 15)   && (
            fourth[1]["to"] === 17)     && (
            fourth[2][0] === "rating")  && (
            fourth[2][1] === "summary")
        ).to.equal(true);
    });
});