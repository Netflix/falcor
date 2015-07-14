var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;

var IdempotentResponse = require("./../response/IdempotentResponse");

var empty_array = new Array(0);

function InvalidateResponse(subscribe) {
    IdempotentResponse.call(this, subscribe || subscribeToInvalidateResponse);
}

InvalidateResponse.create = IdempotentResponse.create;

InvalidateResponse.prototype = Object.create(IdempotentResponse.prototype);
InvalidateResponse.prototype.method = "invalidate";
InvalidateResponse.prototype.constructor = InvalidateResponse;

function subscribeToInvalidateResponse(observer) {

    var model = this.model;
    var method = this.method;

    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;

    while(++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if(methodArgs.length > 0) {
            var operationName = "_" + method + inputType + "AsJSON";
            var operationFunc = model[operationName];
            operationFunc(model, methodArgs, empty_array);
        }
    }

    return Disposable.empty;
}

module.exports = InvalidateResponse;
