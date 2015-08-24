var sinon = require('sinon');
var expect = require('chai').expect;
var GetRequest = require('./../../../lib/request/GetRequestV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');

describe.only('GetRequest', function() {
    it('should make a request to the dataSource with an immediate scheduler', function(done) {
        var inlineBoolean = true;
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy(function(paths) {
            return Rx.Observable.create(function(observer) {
                observer.onNext({
                    jsonGraph: {}
                });
                observer.onCompleted();
            });
        });
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            dataSource: {
                get: getSpy
            }
        });

        var disposable = request.batch([['one', 'two']], function(err, data) {
            expect(inlineBoolean).to.be.ok;
            expect(data).to.deep.equals({jsonGraph: {}});
            expect(getSpy.calledOnce).to.be.ok;
            expect(getSpy.getCall(0).args[0]).to.deep.equals([['one', 'two']]);
            done();
        });
        inlineBoolean = false;
    });
});
