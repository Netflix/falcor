var Rx = require("rx");
var Observable = Rx.Observable;
var jsong = require("../../bin/Falcor.js");
var _ = require("lodash");
var noOp = function() {};

var ErrorDataSource = module.exports = function(errorCode, errorMessage, errorData) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.errorData = _.assign({"$type": "error"}, errorData);
};

ErrorDataSource.prototype = {
    get: function(paths) {
        var self = this;
        return Rx.Observable.create(function(observer) {
            observer.onError(_.assign({
                status: self.errorCode,
                "message": self.errorMessage
            }, self.errorData));
        });
    }
};

