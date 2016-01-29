var falcor = require("./../");
var noop = require("./../support/noop");
var Symbol = require("../SymbolShim");
var toEsObservable = require("../toEsObservable");

/**
 * A ModelResponse is a container for the results of a get, set, or call operation performed on a Model. The ModelResponse provides methods which can be used to specify the output format of the data retrieved from a Model, as well as how that data is delivered.
 * @constructor ModelResponse
 * @augments Observable
*/
function ModelResponse(subscribe) {
    this._subscribe = subscribe;
}

ModelResponse.prototype[Symbol.observable] = function SymbolObservable() {
    return toEsObservable(this);
};

ModelResponse.prototype._toJSONG = function toJSONG() {
    return this;
};

/**
 * The progressively method breaks the response up into two parts: the data immediately available in the Model cache, and the data in the Model cache after the missing data has been retrieved from the DataSource.
 * The progressively method creates a ModelResponse that immediately returns the requested data that is available in the Model cache. If any requested paths are not available in the cache, the ModelResponse will send another JSON message with all of the requested data after it has been retrieved from the DataSource.
 * @name progressively
 * @memberof ModelResponse.prototype
 * @function
 * @return {ModelResponse.<JSONEnvelope>} the values found at the requested paths.
 * @example
var dataSource = (new falcor.Model({
  cache: {
    user: {
      name: "Steve",
      surname: "McGuire",
      age: 31
    }
  }
})).asDataSource();

var model = new falcor.Model({
  source: dataSource,
  cache: {
    user: {
      name: "Steve",
      surname: "McGuire"
    }
  }
});

model.
  get(["user",["name", "surname", "age"]]).
  progressively().
  // this callback will be invoked twice, once with the data in the
  // Model cache, and again with the additional data retrieved from the DataSource.
  subscribe(function(json){
    console.log(JSON.stringify(json,null,4));
  });

// prints...
// {
//     "json": {
//         "user": {
//             "name": "Steve",
//             "surname": "McGuire"
//         }
//     }
// }
// ...and then prints...
// {
//     "json": {
//         "user": {
//             "name": "Steve",
//             "surname": "McGuire",
//             "age": 31
//         }
//     }
// }
*/
ModelResponse.prototype.progressively = function progressively() {
    return this;
};

ModelResponse.prototype.subscribe =
ModelResponse.prototype.forEach = function subscribe(a, b, c) {
    var observer = a;
    if (!observer || typeof observer !== "object") {
        observer = {
            onNext: a || noop,
            onError: b || noop,
            onCompleted: c || noop
        };
    }
    var subscription = this._subscribe(observer);
    switch (typeof subscription) {
        case "function":
            return { dispose: subscription };
        case "object":
            return subscription || { dispose: noop };
        default:
            return { dispose: noop };
    }
};

ModelResponse.prototype.then = function then(onNext, onError) {
    var self = this;
    return new falcor.Promise(function(resolve, reject) {
        var rejected = false;
        var values = [];
        self.subscribe(
            function(value) {
                values[values.length] = value;
            },
            function(errors) {
                rejected = true;
                reject(errors);
            },
            function() {
                var value = values;
                if (values.length <= 1) {
                    value = values[0];
                }

                if (rejected === false) {
                    resolve(value);
                }
            }
        );
    }).then(onNext, onError);
};

module.exports = ModelResponse;
