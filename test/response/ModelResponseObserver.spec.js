var chai = require("chai");
var expect = chai.expect;
var ModelResponseObserver = require("../../lib/response/ModelResponseObserver");

describe("ModelResponseObserver", function() {
    it("should create onNext and onError even if no parameters are passed to constructor", function() {
        var modelResponseObserver = new ModelResponseObserver();
        modelResponseObserver.onNext(5);
        modelResponseObserver.onError(5);
    });

    it("should create onNext and onCompleted even if no parameters are passed to constructor", function() {
        var modelResponseObserver = new ModelResponseObserver();
        modelResponseObserver.onNext(5);
        modelResponseObserver.onCompleted();
    });

    it(
        "should call onNext callback when onNext is called on ModelResponseObserver",
        function() {
            var onNextValue;
            var modelResponseObserver = new ModelResponseObserver(function(
                value
            ) {
                onNextValue = value;
            });
            modelResponseObserver.onNext(5);

            expect(onNextValue).to.equal(5);
        }
    );

    it(
        "should suppress onNext callback after ModelResponseObserver is onCompleted",
        function() {
            var onNextValue;
            var modelResponseObserver = new ModelResponseObserver(function(
                value
            ) {
                onNextValue = value;
            });
            modelResponseObserver.onCompleted();
            modelResponseObserver.onNext(5);

            expect(onNextValue).to.equal(undefined);
        }
    );

    it(
        "should suppress onNext callback after ModelResponseObserver is onError'ed",
        function() {
            var onNextValue;
            var modelResponseObserver = new ModelResponseObserver(function(
                value
            ) {
                onNextValue = value;
            });
            modelResponseObserver.onError();
            modelResponseObserver.onNext(5);

            expect(onNextValue).to.equal(undefined);
        }
    );

    it(
        "should call onError callback max 1 time when no matter how many times onError is called on ModelResponseObserver",
        function() {
            var onErrorValues = [];
            var modelResponseObserver = new ModelResponseObserver(
                function() {},
                function(e) {
                    onErrorValues.push(e);
                }
            );
            modelResponseObserver.onError(1);
            modelResponseObserver.onError(2);

            expect(onErrorValues.length).to.equal(1);
            expect(onErrorValues[0]).to.equal(1);
        }
    );

    it(
        "should call onCompleted callback max 1 time when no matter how many times onCompleted is called on ModelResponseObserver",
        function() {
            var onCompletedValues = [];
            var modelResponseObserver = new ModelResponseObserver(
                function() {},
                function() {},
                function(value) {
                    onCompletedValues.push(value);
                }
            );
            modelResponseObserver.onCompleted(1);
            modelResponseObserver.onCompleted(2);

            expect(onCompletedValues.length).to.equal(1);
            expect(onCompletedValues[0]).to.equal(undefined);
        }
    );

    it(
        "should call onNext method when onNext is called on ModelResponseObserver",
        function() {
            var onNextValue;
            var modelResponseObserver = new ModelResponseObserver({
                onNext: function(value) {
                    onNextValue = value;
                }
            });
            modelResponseObserver.onNext(5);

            expect(onNextValue).to.equal(5);
        }
    );

    it(
        "should suppress onNext method after ModelResponseObserver is onCompleted",
        function() {
            var onNextValue;
            var modelResponseObserver = new ModelResponseObserver({
                onNext: function(value) {
                    onNextValue = value;
                }
            });
            modelResponseObserver.onCompleted();
            modelResponseObserver.onNext(5);

            expect(onNextValue).to.equal(undefined);
        }
    );

    it(
        "should suppress onNext method after ModelResponseObserver is onError'ed",
        function() {
            var onNextValue;
            var modelResponseObserver = new ModelResponseObserver({
                onNext: function(value) {
                    onNextValue = value;
                }
            });
            modelResponseObserver.onError();
            modelResponseObserver.onNext(5);

            expect(onNextValue).to.equal(undefined);
        }
    );

    it(
        "should call onError method max 1 time when no matter how many times onError is called on ModelResponseObserver",
        function() {
            var onErrorValues = [];
            var modelResponseObserver = new ModelResponseObserver({
                onNext: function() {},
                onError: function(e) {
                    onErrorValues.push(e);
                }
            });
            modelResponseObserver.onError(1);
            modelResponseObserver.onError(2);

            expect(onErrorValues.length).to.equal(1);
            expect(onErrorValues[0]).to.equal(1);
        }
    );

    it(
        "should call onCompleted method max 1 time when no matter how many times onCompleted is called on ModelResponseObserver",
        function() {
            var onCompletedValues = [];
            var modelResponseObserver = new ModelResponseObserver({
                onNext: function() {},
                onError: function() {},
                onCompleted: function(value) {
                    onCompletedValues.push(value);
                }
            });
            modelResponseObserver.onCompleted(1);
            modelResponseObserver.onCompleted(2);

            expect(onCompletedValues.length).to.equal(1);
            expect(onCompletedValues[0]).to.equal(undefined);
        }
    );
});
