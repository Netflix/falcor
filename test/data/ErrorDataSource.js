var Rx = require("rx");
var Observable = Rx.Observable;
var _ = require("lodash");
var noOp = function() {};

var ErrorDataSource = module.exports = function(errorCode, errorMessage, errorData) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.errorData = errorData;
};

ErrorDataSource.prototype = {
    get: function(paths) {
        return Rx.Observable.throw({
            $type: 'error',
            value: _.assign({
                status: this.errorCode,
                "message": this.errorMessage
            }, this.errorData)
        });
    },
    set: function(paths) {
        return Rx.Observable.throw({
            $type: 'error',
            value: _.assign({
                status: this.errorCode,
                "message": this.errorMessage
            }, this.errorData)
        });
    }
};

