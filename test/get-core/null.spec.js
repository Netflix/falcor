var getCoreRunner = require("./../getCoreRunner");

describe("Nulls", function() {
    it("should allow null past end of path.", function() {
        getCoreRunner({
            input: [["a", "b", "c", null]],
            output: {
                json: {
                    a: { b: { c: "title" } },
                },
            },
            cache: {
                a: { b: { c: "title" } },
            },
        });
    });

    it("should allow null at end of path.", function() {
        getCoreRunner({
            input: [["a", "b", null]],
            output: {
                json: {
                    a: { b: {} },
                },
            },
            cache: {
                a: { b: { c: "title" } },
            },
        });
    });

    it("should allow null in middle of path.", function() {
        getCoreRunner({
            input: [["a", null, "c"]],
            output: {
                json: {
                    a: {},
                },
            },
            cache: {
                a: { b: { c: "title" } },
            },
        });
    });

    it("should allow null in key sets.", function() {
        getCoreRunner({
            input: [["a", [null, "b"], "c"]],
            output: {
                json: {
                    a: { b: { c: "title" } },
                },
            },
            cache: {
                a: { b: { c: "title" } },
            },
        });

        getCoreRunner({
            input: [["a", ["b", null], "c"]],
            output: {
                json: {
                    a: { b: { c: "title" } },
                },
            },
            cache: {
                a: { b: { c: "title" } },
            },
        });
    });
});
