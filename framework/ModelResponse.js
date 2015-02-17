var ModelResponse = (function(falcor) {
    
    var Observable  = jsong.Observable,
        valuesMixin = { format: { value: "AsValues"  } },
        jsonMixin   = { format: { value: "AsPathMap" } },
        jsongMixin  = { format: { value: "AsJSONG"   } };
    
    function ModelResponse(forEach) {
        this._subscribe = forEach;
    }
    
    ModelResponse.create = function(forEach) {
        return new ModelResponse(forEach);
    };
    
    function noop() {};
    function mixin(self) {
        var mixins = Array.prototype.slice.call(arguments, 1);
        return new ModelResponse(function(other) {
            return self.subscribe(mixins.reduce(function(proto, mixin) {
                return Object.create(proto, mixin);
            }, other));
        });
    };
    
    ModelResponse.prototype = Observable.create(noop);
    ModelResponse.prototype.format = "AsPathMap";
    ModelResponse.prototype.toPathValues = function() {
        return mixin(this, valuesMixin);
    };
    ModelResponse.prototype.toJSON = function() {
        return mixin(this, jsonMixin);
    };
    ModelResponse.prototype.toJSONG = function() {
        return mixin(this, jsongMixin);
    };
    return ModelResponse;
}(jsong));