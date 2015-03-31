var ImmediateScheduler = require('./../../lib/falcor/scheduler/ImmediateScheduler');
var TimeoutScheduler = require('./../../lib/falcor/scheduler/TimeoutScheduler');
var RequestQueue = require('./../../lib/falcor/request/RequestQueue');
var LocalDataSource = require("../data/LocalDataSource");
var Cache = require("../data/Cache");
var Expected = require("../data/expected");
var Rx = require("rx");
var chai = require("chai");
var expect = chai.expect;
var References = Expected.References;
var Values = Expected.Values;
var requestTestRunner = require("../requestTestRunner");

describe("RequestQueue", function() {
    var nextTick = new TimeoutScheduler(0);
    var immediate = new ImmediateScheduler();
    var dataSource = new LocalDataSource(Cache());
    var dataModel = {
        _dataSource: dataSource
    };

    it("should be constructable.", function() {
        debugger
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
        var id = -1;
        var checks = 0;
        function onNext() {
            expect(id < this._requestId).to.be.ok;
            id = this._requestId;
            checks++;
        }
        requestTestRunner(References().simpleReference0, queue, onNext).subscribe();
        requestTestRunner(References().simpleReference1, queue, onNext).subscribe();
        requestTestRunner(References().simpleReference2, queue, onNext).subscribe();
        requestTestRunner(References().simpleReference3, queue, onNext).subscribe();

        expect(checks).to.equal(4);
    });

    it("should batch multiple requests into a single request.", function(done) {
        var queue = new RequestQueue(dataModel, nextTick);
        var id = -1;
        var checks = 0;
        function onNext(x) {
            if (id !== -1) {
                expect(id).to.equal(this._requestId);
            } else {
                id = this._requestId;
            }
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
    
    it("should have multiple requests batched.", function(done) {
        var dataSource = new LocalDataSource(Cache(), {wait:100});
        var dataModel = {
            _dataSource: dataSource
        };
        var queue = new RequestQueue(dataModel, nextTick);
        var id = -1;
        var checks = 0;
        function onNext(x) {
            if (id !== -1) {
                expect(id).to.not.equal(this._requestId);
            } else {
                id = this._requestId;
            }
            checks++;
        }
        var r1 = Rx.Observable.
            return(3).
            delay(16).
            flatMap(function() {
                return requestTestRunner(References().simpleReference1, queue, onNext);
            });

        Rx.Observable.zip(
            requestTestRunner(References().simpleReference1, queue, onNext),
            r1,
            function() {}).subscribe(function() {}, done, function() {
                expect(checks).to.equal(2);
                done();
            });
    });
});

