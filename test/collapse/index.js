var expect = require("chai").expect;
var collapse = require("falcor/support/collapse");
var __count = require("falcor/internal/count");

describe("collapse", function() {
    it("collapses a pathmap that has overlapping branch and leaf nodes", function() {

        var pathmap = Object.create(null);

        pathmap["lolomo"] = Object.create(null);
        pathmap["lolomo"][__count] = 1;

        pathmap["lolomo"]["summary"] = Object.create(null);
        pathmap["lolomo"]["summary"][__count] = 1;

        pathmap["lolomo"]["13"] = Object.create(null);
        pathmap["lolomo"]["13"][__count] = 1;

        pathmap["lolomo"]["14"] = Object.create(null);
        pathmap["lolomo"]["14"][__count] = 1;

        pathmap["lolomo"]["13"]["summary"] = Object.create(null);
        pathmap["lolomo"]["13"]["summary"][__count] = 1;

        pathmap["lolomo"]["14"]["summary"] = Object.create(null);
        pathmap["lolomo"]["14"]["summary"][__count] = 1;

        // pathmap["lolomo"]["15"] = Object.create(null);
        // pathmap["lolomo"]["15"]["summary"] = Object.create(null);
        // pathmap["lolomo"]["15"]["summary"][__count] = 1;

        // debugger;

        var paths = collapse(pathmap).sort(function(a, b) {
            return a.length - b.length;
        });

        var first = paths[0];
        var second = paths[1];
        var third = paths[2];
        var fourth = paths[3];

        expect(first[0] === "lolomo").to.equal(true);

        expect((
            second[0] === "lolomo")   && (
            second[1]["from"] === 13) && (
            second[1]["to"] === 14)
        ).to.equal(true);

        expect(third[0] === "lolomo" && third[1] === "summary").to.equal(true);

        expect((fourth[0] === "lolomo") && (
            fourth[1]["from"] === 13)   && (
            fourth[1]["to"] === 14)     && (
            // fourth[1]["to"] === 15)     && (
            fourth[2] === "summary")
        ).to.equal(true);
    });
});