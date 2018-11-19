const sinon = require("sinon");
const expect = require("chai").expect;
const after = require("lodash/after");
const GetRequest = require("./../../../lib/request/GetRequestV2");
const ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
const Model = require("./../../../lib").Model;
const LocalDataSource = require("./../../data/LocalDataSource");
const cacheGenerator = require("./../../CacheGenerator");
const strip = require("./../../cleanData").stripDerefAndVersionKeys;
const toObservable = require("./../../toObs");

const noOp = () => {};

describe("#add", () => {
    const videos0 = ["videos", 0, "title"];
    const videos1 = ["videos", 1, "title"];

    it("should send a request and dedupe another", done => {
        const scheduler = new ImmediateScheduler();
        const onGet = sinon.spy();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            wait: 0,
            onGet
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest: noOp,
            model
        });

        let results;
        const partDone = after(2, () => {
            const onNext = sinon.spy();
            toObservable(model.withoutDataSource().get(videos0, videos1)).subscribe(onNext, done, () => {
                expect(onGet.calledOnce, "DataSource get should only be called once").to.equal(true);
                expect(onGet.getCall(0).args[1]).to.deep.equal([videos0]);
                expect(onNext.calledOnce, "onNext should only be called once").to.equal(true);
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: {
                        videos: {
                            0: {
                                title: "Video 0"
                            }
                        }
                    }
                });

                expect(results[0], "paths should be inserted").to.equal(true);
                expect(results[1]).to.deep.equal([videos1]);
                expect(results[2]).to.deep.equal([videos1]);

                done();
            });
        });

        request.batch([videos0], [videos0], partDone);
        expect(request.sent, "request should be sent").to.equal(true);

        results = request.add([videos0, videos1], [videos0, videos1], partDone);
    });

    it("should send a request and dedupe another when dedupe is in second position", done => {
        const scheduler = new ImmediateScheduler();
        const onGet = sinon.spy();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            wait: 0,
            onGet
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest: noOp,
            model
        });

        let results;
        const partDone = after(2, () => {
            const onNext = sinon.spy();
            toObservable(model.withoutDataSource().get(videos0, videos1)).subscribe(onNext, done, () => {
                expect(onGet.calledOnce, "DataSource get should only be called once").to.equal(true);
                expect(onGet.getCall(0).args[1]).to.deep.equal([videos0]);
                expect(onNext.calledOnce, "onNext should only be called once").to.equal(true);
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: {
                        videos: {
                            0: {
                                title: "Video 0"
                            }
                        }
                    }
                });

                expect(results[0], "paths should be inserted").to.equal(true);
                expect(results[1]).to.deep.equal([videos1]);
                expect(results[2]).to.deep.equal([videos1]);

                done();
            });
        });

        request.batch([videos0], [videos0], partDone);
        expect(request.sent, "request should be sent").to.equal(true);

        results = request.add([videos1, videos0], [videos1, videos0], partDone);
    });

    it("should send a request and dedupe another and dispose of original", done => {
        const scheduler = new ImmediateScheduler();
        const onGet = sinon.spy();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            wait: 0,
            onGet
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest: noOp,
            model
        });

        let results;
        const partDone = after(2, () => {
            const onNext = sinon.spy();
            toObservable(model.withoutDataSource().get(videos0, videos1)).subscribe(onNext, done, () => {
                expect(onGet.calledOnce, "DataSource get should only be called once").to.equal(true);
                expect(onGet.getCall(0).args[1]).to.deep.equal([videos0]);
                expect(onNext.calledOnce, "onNext should only be called once").to.equal(true);
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: {
                        videos: {
                            0: {
                                title: "Video 0"
                            }
                        }
                    }
                });

                expect(results[0], "paths should be inserted").to.equal(true);
                expect(results[1]).to.deep.equal([videos1]);
                expect(results[2]).to.deep.equal([videos1]);

                done();
            });
        });

        const disposable = request.batch([videos0], [videos0], () =>
            done(new Error("Request should have been cancelled"))
        );
        expect(request.sent, "request should be sent").to.equal(true);

        results = request.add([videos0, videos1], [videos0, videos1], partDone);

        // Cancel initial request
        disposable();

        partDone();
    });

    it("should send a request and dedupe another and dispose of deduped", done => {
        const scheduler = new ImmediateScheduler();
        const onGet = sinon.spy();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            wait: 0,
            onGet
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest: noOp,
            model
        });

        let results;
        const partDone = after(2, () => {
            const onNext = sinon.spy();
            toObservable(model.withoutDataSource().get(videos0, videos1)).subscribe(onNext, done, () => {
                expect(onGet.calledOnce, "DataSource get should only be called once").to.equal(true);
                expect(onGet.getCall(0).args[1]).to.deep.equal([videos0]);
                expect(onNext.calledOnce, "onNext should only be called once").to.equal(true);
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: {
                        videos: {
                            0: {
                                title: "Video 0"
                            }
                        }
                    }
                });

                expect(results[0], "paths should be inserted").to.equal(true);
                expect(results[1]).to.deep.equal([videos1]);
                expect(results[2]).to.deep.equal([videos1]);

                done();
            });
        });

        request.batch([videos0], [videos0], partDone);
        expect(request.sent, "request should be sent").to.equal(true);
        results = request.add([videos0, videos1], [videos0, videos1], () =>
            done(new Error("Request should have been cancelled"))
        );

        // Cancel added request
        results[3]();

        partDone();
    });

    // Tests for partial deduping (https://github.com/Netflix/falcor/issues/779)
    // are in test/integration/dedupe.spec.js
});
