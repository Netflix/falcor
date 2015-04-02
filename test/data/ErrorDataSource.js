var Rx = require("rx");
var Observable = Rx.Observable;
var jsong = require("../../index.js");
var _ = require("lodash");
var noOp = function() {};

var ErrorDataSource = module.exports = function(errorCode, errorMessage, errorData) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.errorData = errorData;
};

ErrorDataSource.prototype = {
    get: function(paths) {
        var self = this;
        return Rx.Observable.create(function(observer) {
            var err = {
                $type: 'error',
                value: _.assign({
                    status: self.errorCode,
                    "message": self.errorMessage
                }, self.errorData)
            };
            observer.onError(err);
        });
    }
};

