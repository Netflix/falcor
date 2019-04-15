const falcor = require("../../browser");
const LocalDataSource = require("../data/LocalDataSource");
const after = require("lodash/after");
const expect = require("chai").expect;
const sinon = require("sinon");
const strip = require("../cleanData").stripDerefAndVersionKeys;
const cacheGenerator = require("../CacheGenerator");

const noOp = () => {};

describe("Request deduping", () => {
    it("should dedupe new requested paths with previous in-flight requests", done => {
        const onGet = sinon.spy();
        const model = new falcor.Model({
            source: new LocalDataSource(
                {
                    things: {
                        0: "thing: 0",
                        1: "thing: 1",
                        2: "thing: 2"
                    }
                },
                { wait: 0, onGet }
            )
        });

        const partDone = after(2, () => {
            expect(onGet.getCall(1).args[1]).to.deep.equal([["things", "2"]]);

            done();
        });

        model
            .get(["things", { from: 0, to: 1 }])
            .subscribe(
                response => expect(strip(response.json)).to.deep.equal({ things: { 0: "thing: 0", 1: "thing: 1" } }),
                done,
                partDone
            );

        model
            .get(["things", { from: 1, to: 2 }])
            .subscribe(
                response => expect(strip(response.json)).to.deep.equal({ things: { 1: "thing: 1", 2: "thing: 2" } }),
                done,
                partDone
            );
    });

    it("should dedupe from both ends of overlapping ranges", done => {
        const onGet = sinon.spy();
        const model = new falcor.Model({
            source: new LocalDataSource(
                {
                    things: {
                        0: "thing: 0",
                        1: "thing: 1",
                        2: "thing: 2",
                        3: "thing: 3"
                    }
                },
                { wait: 0, onGet }
            )
        });

        const partDone = after(2, () => {
            expect(onGet.getCall(1).args[1]).to.deep.equal([["things", [0, 3]]]);

            done();
        });

        model.get(["things", { from: 1, to: 2 }]).subscribe(noOp, done, partDone);
        model.get(["things", { from: 0, to: 3 }]).subscribe(noOp, done, partDone);
    });

    it("should leave ranges unrolled if possible", done => {
        const onGet = sinon.spy();
        const model = new falcor.Model({
            source: new LocalDataSource(
                {
                    things: {
                        0: "thing: 0",
                        1: "thing: 1",
                        2: "thing: 2",
                        3: "thing: 3"
                    }
                },
                { wait: 0, onGet }
            )
        });

        const partDone = after(2, () => {
            expect(onGet.getCall(1).args[1]).to.deep.equal([["things", { from: 2, to: 3 }]]);
            done();
        });

        model.get(["things", { from: 0, to: 1 }]).subscribe(noOp, done, partDone);
        model.get(["things", { from: 0, to: 3 }]).subscribe(noOp, done, partDone);
    });

    it("should work for properties after ranges", done => {
        const onGet = sinon.spy();
        const model = new falcor.Model({
            source: new LocalDataSource(
                {
                    things: {
                        0: { name: "thing: 0" },
                        1: { name: "thing: 1" },
                        2: { name: "thing: 2" },
                        3: { name: "thing: 3" }
                    }
                },
                { wait: 0, onGet }
            )
        });

        const partDone = after(2, () => {
            expect(onGet.getCall(1).args[1]).to.deep.equal([["things", { from: 2, to: 3 }, "name"]]);
            done();
        });

        model.get(["things", { from: 0, to: 1 }, "name"]).subscribe(noOp, done, partDone);
        model.get(["things", { from: 1, to: 3 }, "name"]).subscribe(noOp, done, partDone);
    });

    it("should work for multiple ranges in path sets", done => {
        const onGet = sinon.spy();
        const model = new falcor.Model({
            source: new LocalDataSource(
                {
                    things: {
                        0: { name: "thing: 0", tags: { 0: "t0 tag: 0", 1: "t0 tag: 1", 2: "t0 tag: 2" } },
                        1: { name: "thing: 1", tags: { 0: "t1 tag: 0", 1: "t1 tag: 1", 2: "t1 tag: 2" } },
                        2: { name: "thing: 2", tags: { 0: "t2 tag: 0", 1: "t2 tag: 1", 2: "t2 tag: 2" } }
                    }
                },
                { wait: 0, onGet }
            )
        });

        const partDone = after(2, () => {
            expect(onGet.getCall(1).args[1]).to.deep.equal([
                ["things", { from: 0, to: 1 }, "tags", "0"],
                ["things", 2, "tags", { from: 0, to: 2 }]
            ]);

            done();
        });

        model.get(["things", { from: 0, to: 1 }, "tags", { from: 1, to: 2 }]).subscribe(noOp, done, partDone);
        model.get(["things", { from: 0, to: 2 }, "tags", { from: 0, to: 2 }]).subscribe(noOp, done, partDone);
    });

    it("should work when different optimized and requested path lengths", done => {
        const onGet = sinon.spy();
        const model = new falcor.Model({
            source: new LocalDataSource(
                {
                    things: {
                        0: {
                            tags: {
                                0: "t0 tag: 0",
                                1: "t0 tag: 1"
                            }
                        }
                    },
                    oneoff: {
                        tags: {
                            0: "t2 tag: 0",
                            1: "t2 tag: 1"
                        }
                    },
                    thang: {
                        that: {
                            really: {
                                is: {
                                    a: { thing: { of: { course: { tags: { 0: "thang tag: 0", 1: "thang tag: 1" } } } } }
                                }
                            }
                        }
                    }
                },
                { wait: 0, onGet }
            ),
            cache: {
                things: {
                    1: falcor.Model.ref("thang.that.really.is.a.thing.of.course"),
                    2: falcor.Model.ref("oneoff")
                }
            }
        });

        const partDone = after(2, () => {
            expect(onGet.getCall(1).args[1]).to.deep.equal([
                ["oneoff", "tags", { from: 0, to: 1 }],
                ["things", 0, "tags", "1"],
                ["thang", "that", "really", "is", "a", "thing", "of", "course", "tags", { from: 0, to: 1 }]
            ]);

            done();
        });

        model.get(["things", 0, "tags", 0]).subscribe(noOp, done, partDone);
        // path length differences:
        // things[0].tags[0,1] -> requested: 4, optimized: 4
        // things[1].tags[0,1] -> requested: 4, optimized: 10
        // things[2].tags[0,1] -> requested: 4, optimized: 3
        model.get(["things", { from: 0, to: 2 }, "tags", { from: 0, to: 1 }]).subscribe(noOp, done, partDone);
    });

    it("deduplicates gets with overlapping ranges", done => {
        const onGet = sinon.spy();
        const model = new falcor.Model({ source: new LocalDataSource(cacheGenerator(0, 3), { wait: 0, onGet }) });

        const partDone = after(3, () => {
            expect(onGet.getCall(0).args[1]).to.deep.equal([["videos", 0, "title"]]);
            expect(onGet.getCall(1).args[1]).to.deep.equal([["videos", 1, "title"]]);
            expect(onGet.getCall(2).args[1]).to.deep.equal([["videos", 2, "title"]]);

            done();
        });

        model.get(["videos", 0, "title"]).subscribe(noOp, done, partDone);
        model.get(["videos", 1, "title"]).subscribe(noOp, done, partDone);
        model.get(["videos", [0, 1, 2], "title"]).subscribe(noOp, done, partDone);
    });
});
