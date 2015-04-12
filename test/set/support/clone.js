module.exports = function(x) {
    switch(typeof x) {
        case "undefined":
            return void 0;
        case "string":
        case "number":
        case "boolean":
        case "function":
            return x;
        case "object":
            if(x == null) {
                return null;
            }
        default:
            if(Array.isArray(x)) {
                return x.slice(0);
            }
            
            var z = {};
            for(var y in x) {
                z[y] = x[y];
            }
            
            return z;
    }
}