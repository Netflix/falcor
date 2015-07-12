var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var TimeoutScheduler = require('./../../../lib/schedulers/TimeoutScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var RequestQueue = require('./../../../lib/request/RequestQueue');
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var Expected = require("../../data/expected");
var Rx = require("rx");
var chai = require("chai");
var expect = chai.expect;
var References = Expected.References;
var Values = Expected.Values;
var requestTestRunner = require("../../requestTestRunner");
var ModelRoot = require("./../../../lib/ModelRoot");

describe("RequestQueue", function() {
    var modelRoot = new ModelRoot();
    var nextTick = new ASAPScheduler();
    var nextSlice = new TimeoutScheduler(16);
    var immediate = new ImmediateScheduler();
    var dataSource = new LocalDataSource(Cache());
    var dataModel = {
        _root: modelRoot,
        _source: dataSource
    };

    it("should be constructable.", function() {
        expect(new RequestQueue({}, immediate));
    });

    it("should immediately fire off a request.", function(done) {
        var queue = new RequestQueue(dataModel, immediate);
        var trigger = true;
        requestTestRunner(References().simpleReference0, queue).
            subscribe(function() {
                expect(trigger).to.be.ok;
            }, done, done);
        trigger = false;
    });

    it("should immediately fire off multiple requests.", function() {
        var queue = new RequestQueue(dataModel, immediate);
        var checks = 0;
        function onNext(envelope) {
            checks++;
        }
        requestTestRunner(References().simpleReference0, queue, onNext).subscribe();
        requestTestRunner(References().simpleReference1, queue, onNext).subscribe();
        requestTestRunner(References().simpleReference2, queue, onNext).subscribe();
        requestTestRunner(References().simpleReference3, queue, onNext).subscribe();

        expect(checks).to.equal(4);
    });

    it("should batch multiple requests into a single request asap.", function(done) {
        var queue = new RequestQueue(dataModel, nextTick);
        var checks = 0;
        function onNext(x) {
            checks++;
        }
        Rx.Observable.zip(
            requestTestRunner(References().simpleReference0, queue, onNext),
            requestTestRunner(References().simpleReference1, queue, onNext),
            requestTestRunner(References().simpleReference2, queue, onNext),
            requestTestRunner(References().simpleReference3, queue, onNext),
            function(a, b, c, d) {

            }).
            subscribe(function() {}, done, function() {
                expect(checks).to.equal(4);
                done();
            });
    });

    it("should batch multiple requests into a single request in a 16ms time slice.", function(done) {
        var queue = new RequestQueue(dataModel, nextSlice);
        var checks = 0;
        function onNext(x) {
            checks++;
        }
        Rx.Observable.zip(
            requestTestRunner(References().simpleReference0, queue, onNext),
            requestTestRunner(References().simpleReference1, queue, onNext),
            requestTestRunner(References().simpleReference2, queue, onNext),
            requestTestRunner(References().simpleReference3, queue, onNext),
            function(a, b, c, d) {

            }).
            subscribe(function() {}, done, function() {
                expect(checks).to.equal(4);
                done();
            });
    });

    it("should have multiple requests batched across pending source requests.", function(done) {
        var dataSource = new LocalDataSource(Cache(), {wait:100});
        var dataModel = { _root: modelRoot, _source: dataSource };
        var queue = new RequestQueue(dataModel, nextTick);
        var checks = 0;
        function onNext(x) {
            checks++;
        }
        var r1 = requestTestRunner(References().simpleReference1, queue, onNext);
        var r2 = Rx.Observable.timer(50).flatMap(function() {
            return requestTestRunner(References().simpleReference1, queue, onNext);
        });
        r1.zip(r2, function(){}).subscribe(function() {}, done, function() {
            expect(checks).to.equal(2);
            done();
        });
    });

    it("should merge multiple JSONGraph Envelopes from batched pending source requests.", function(done) {
        var dataSource = new LocalDataSource(Cache(), {wait:100});
        var dataModel = { _root: modelRoot, _source: dataSource };
        var queue = new RequestQueue(dataModel, nextTick);
        var checks = 0;
        function onNext(x) {
            checks++;
        }
        
        var ref0 = ["genreList", "0", "0", "summary"];
        var ref1 = ["genreList", "0", "0", "title"]
        var ref2 = ["genreList", "0", "1", "summary"]

        var r1 = queue.get([ref0]).do(onNext);
        var r2 = Rx.Observable.timer(50).flatMap(function() {
            dataModel._source = new LocalDataSource(Cache());
            return queue.get([ref0, ref1, ref2]).do(onNext);
        });
        r1.zip(r2, function(){}).subscribe(function() {}, done, function() {
            expect(checks).to.equal(2);
            done();
        });
    });
});

