/**
 * A Falcor Model allows you to access the data in a JSON object the same way everywhere, regardless of where the data is stored is on the network. If a Model has a {@link DataSource} it is acting as a proxy for a remote Model. A Proxy Model uses the {@link DataSource} to access the data in another Model, usually located across a network. The {@link DataSource} is an interface which you can implement to allow Proxy Models to communicate across different network protocols than HTTP, such as a Web Socket or simple TCP. A {@link DataSource} is used by a Proxy Model on the client, and that DataSource communicates with a Model Server which translates its requests into commands and executes them on the Model located on the server. The server counterpart then serializes the remote Model's output in a response that the DataSource expects. The DataSource deserializes the data in the response, passes it back to the Proxy Model, and the Proxy Model caches the data locally.
 * The browser distribution of Falcor ships with {@link XmlHttpSource}, which communicates over HTTP with the FalcorEndpoint object available in Falcor's Node distribution.
 * @constructor DataSource
 * @abstract
 * @example
 // In this example we demonstrate the communication between a model source and a server over a web worker

 // Here is the worker code (worker.js):

importScripts('./Falcor.js');  

function WorkerServer(model) {
    this.model = model;
}

// Deserializes a message from the client and executes the appropriate action on the model
WorkerServer.prototype.onmessage = function(action) {
  var method = action[0],
    jsonGraphEnvelope,
    callPath,
    pathSuffixes,
    paths;

    switch(method) {
        case "get": {
            paths = action[1];

            return model.
                get.apply(model, paths);
        }
        case "set": {
            jsonGraphEnvelope = action[1];

            return model.
                set(jsonGraphEnvelope);
        }
        case "call": {
            callPath = action[1];
            args = action[2];
            pathSuffixes = action[3];
            paths = action[4];

            return model.
                call(callPath, args, pathSuffixes, paths);
        }
    }
}

// create a server model
var model = 
    new falcor.
        Model({
            cache: {
                user: {
                    name: "Jim",
                    location: {$type: "error", value: "Something broke!"}
                }
            }
        }).
        // Always return the JSON Graph Atoms objects (ref, atom, error) because we want to serialize them
        boxValues().
        // Add errors to the message instead of sending them to the error callback
        treatErrorsAsValues().
        // Explicitly create a {$type:'atom'} object for every value not found in the cache
        // This will be stored in the client's cache, and prevent them from making another request 
        // for data which is undefined
        materialize();

// Create a worker server that translates requests into commands on the model
var workerServer = new WorkerServer(model);

onmessage = function(e) {
    var data = e.data,
        // peel off the request id
        id = data[0];

    workerServer.
        onmessage(data.slice(1)).
        // Convert the output format of the ModelResponse to JSON Graph, because that is what the 
        // DataSource expects.
        toJSONGraph().
        subscribe(
            function(result) {
                // send back the response with the request id
                postMessage([id, null, result]);
            },
            function(error) {
                // send back the response with the request id
                postMessage([id, error]);
            });
}

// END OF WORKER CODE
// START WEB PAGE CODE

// Define a web worker model source. A proxy model will use this source to retrieve information from a Model running on another web worker.
function WebWorkerSource(worker){
    this._worker = worker;
}

WebWorkerSource.prototype = {
    // Identifier used to correlate each Request to each response
    id: 0,
    // Gets paths from the model running on a worker
    get: function(paths) {
        return this._getResponse(['get', paths]);
    },
    // Sets information on a model running on a worker
    set: function(jsonGraphEnvelope) {   
        return this._getResponse(['set', jsonGraphEnvelope]);
    },
    // Call a function in a model running on a worker
    call: function(callPath, arguments, pathSuffixes, paths) {
        return this._getResponse(['call', callPath, arguments, pathSuffixes, paths]);
    },
    // Creates an observable stream that will send a request 
    // to a Model server, and retrieve the response.
    // The request and response are correlated using a unique 
    // identifier which the cleint sends with the request and 
    // the server echoes back along with the response.
    _getResponse: function(action) {
        var self = this;

        // The subscribe function runs when the Observable is observed.
        return falcor.Observable.create(function subscribe(observer) {
            var id = self.id++,

            handler = function(e) {
                var response = e.data,
                    error,
                    value;

                // The response is an array like this [id, error, data]
                if (response[0] === id) {
                    error = response[1];
                    if (error) {
                        observer.onError(error);
                    }
                    else {
                        value = response[2];
                        observer.onNext(value);
                        observer.onCompleted();
                    }
                }
            };

            // Add the identifier to the front of the message
            action.unshift(id);
            
            self._worker.postMessage(action);
            self._worker.addEventListener('message', handler);

            // This is the action to perform if the consumer unsubscribes from the observable
            return function(){
                self._worker.removeEventListener('message', handler);
            };
        });
    }
};

// Create the worker running a remote model
var worker = new Worker('worker.js');

// Create the web worker model source and pass it the worker we have created
var model = new falcor.Model({ source: new WebWorkerSource(worker) });

model.
    get('user["name", "age", "location"]').
    subscribe(
        function(json) {
            console.log(JSON.stringify(json, null, 4));
        },
        function(errors) {
            console.error('ERRORS:', JSON.stringify(errors));
        });

//The following is printed to the console:
//{
//    json: {
//        "user": {           
//            "name": "Jim"
//            // age not included because it is undefined
//            // location not included in message because it resulted in error
//        }
//    }
//}

//ERRORS: [{"path":["user","location"],"value":"Something broke!"}]
*/

/**
 * The get method retrieves an array of {@link PathSet}s from a remote Model object.
 * @name get
 * @arg {Array.<PathSet>} pathSets the path(s) to retrieve
 * @returns {Observable.<JSONGraphEnvelope>} jsonGraphEnvelope the response returned from the server.
 * @memberof DataSource.prototype
 * @example
 // The {@link Model} and its {@link DataSource} work together to optimize and hide network access from developers. In this example we will create a mock implementation of a DataSource to demonstrate how the {@link Model} and {@link DataSource} interact.

 // Create an object that mocks a {@link DataSource} with a get method. Model's use 
 // {@link DataSource}'s to retrieve information from the network.
 var mockDataSource = {
    // In the example below, the path 'genreLists[0][1]["name","rating"]' will be
    // requested from the model. The Model's cache contains a reference to 'titlesById[99]'
    // at the path 'genreLists[0][1]', but the Model's cache does not contain a title at 
    // 'titlesById[99]'. As a result the Model will request the more optimized path
    // 'titlesById[99]["name","rating"]' from the data source. The Data source belows
    // mocks the server response for this path.
    get: function(pathSets) {
        console.log("Paths requested from DataSource:");
        console.log(
            pathSets.
                map(function(path) { return JSON.stringify(path) }));

        // return an Observable stream of the {@link JSONGraphEnvelope} that a server might 
        // send in response to a request for 'titlesById[99]["name", "rating"]'
        return falcor.Observable.of({
            paths: pathSets,
            value: {
                "titlesById": {           
                    "99": {
                        "name": "House of Cards",
                        "rating": 5
                    }
                }
            }
        })
    }
 };

 var $ref = falcor.Model.ref;
 // Create a Model that uses the mock {@link DataSource} for remove retrieval
 var model = new falcor.Model({
    source: mockDataSource,

    // Loading a fragment of the JSONGraph object into the model's cache.
    cache: {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "length": 1
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            }
        },
        "titlesById": {
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            }
        }
    }
});

// Creating an Observable stream of a JSON object that contains the names and ratings of the first two titles in the first genre list
var namesAndRatings = model.get('genreLists[0][0...1]["name","rating"]');

// retrieving the JSON object with the ratings from the stream
namesAndRatings.subscribe(function(jsonEnvelope) {
    console.log("JSON retrieved from Model:")
    console.log(JSON.stringify(jsonEnvelope));

    // output the contents of the {@link Model}'s' local cache to the console.
    var jsonGraph = model.getCache();

    console.log("Contents of {@link Model}'s local cache after get opration:")
    console.log(JSON.stringify(jsonGraph));            
        
});

// Attempting to retrieve the {@link PathSet} 'genreLists[0][0..1]["name", "rating"]'
// from the Model will cause the paths to be first evaluated against the local
// cache. Based on {@link Path}s found in the local JSONGraph cache, the requested {@link PathSet}s 
// will be optimized into the following {@link PathSets}:

// 'genreLists[0][0]["name", "rating"]' -> 'titlesById[23]["name", "rating"]'
// 'genreLists[0][1]["name", "rating"]' -> 'titlesById[99]["name", "rating"]'

// Of these optimized {@link PathSet}s, only the following {@link PathSet} cannot
// be found in the cache: 'titlesById[99]["name", "rating"]'. A request is 
// then issued to the {@link DataSource.prototype.get} method to retrieve this path.
// Usually this would result in a call to the server, but in this case the call is handled
// by our the mock {@link DataSource}. Once the {@link DataSource} retrieves the missing 
// JSONGraph fragment, it is sent to the {@link Model}. The {@link Model} adds the
// missing data retrieved from the {@link DataSource} to the local cache and returns all
// of the requested paths in a JSON envelope.

// The code above prints the following to the console:

// Paths requested from DataSource: ["titlesById", 99, ["name", "rating"]]
// JSON retrieved from Model:
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     name: "Orange is the New Black",
//                     rating: 5
//                 },
//                 "1": {
//                     name: "House of Cards",
//                     rating: 5
//                 }
//             }
//         }
//     }
// }
// Contents of {@link Model}'s local cache after get operation:
// {
//     "genreLists": {
//         "0": $ref('genresById[123]'),
//         "length": 1
//     },
//     "genresById": {
//         "123": {
//             "name": "Drama",
//             "0": $ref('titlesById[23]'),
//             "1": $ref('titlesById[99]'),
//             "length": 2
//         }
//     },
//     "titlesById": {
//         "23": {
//             "name": "Orange is the New Black",
//             "rating": 5
//         },
//         "99": {
//             "name": "House of Cards",
//             "rating": 5
//         }        
//     }
// }

// Note that the {@link Model}'s local cache now contains the additional information
// returned by the {@link DataSource}.
 */

/**
 * The DataSource interface includes a set method which can be called to modify a remote model. The set method accepts a {@link JSONGraphEnvelope}, which includes an Array of {@link Path}s to set, and a fragment of {@link JSONGraph} containing the values to set for each {@link Path}. The set method returns an Observable.<JSONGraphraphEnvelope> which contains the response of the Remote model. The remote Model’s response contains values of each path after the set operation.  It is necessary to include these values, because set operations may not always be successful. Attempts to set invalid values may fail, or values maybe coerced into valid ranges.
 * @name set
 * @function
 * @arg {JSONGraphEnvelope} jsonGraphEnvelope the series of path and value pairs to set on the remote JSONGraph model.
 * @returns {Observable.<JSONGraphEnvelope>} the response returned from the server.
 * @memberof DataSource.prototype
 * @example
// In this example we set the rating of a netflix title stored in a remote Model. We mock the server by defining a model source. The mocked server coerces the rating from 10 to 5.
 
// Mock the server by creatng a mock Model Source.
var source = {
    set: function(jsonGraphEnvelope) {
        // when a server receives the expected set operation, it mocks the response:
        // a JSON Graph Envelope containing the post-set values of all paths
        return falcor.Observable.of({
            paths: jsonGraphEnvelope.paths,
            jsong: {
                "titlesById": {           
                    "99": {
                        "name": "House of Cards",
                        // coerce the rating to a maximum number of 5
                        "rating": 5
                    }
                }    
            }
        });
    }
};

var $ref = falcor.Model.ref;
var model = new falcor.Model({ source: source });

// attempt to set 'titlesById[99].name' to "House of Cards" and 
// 'titlesById[99].rating' to 10
var result = model.set({
    json: {
        "titlesById": {           
            "99": {
                "name": "House of Cards",
                "rating": 10
            }
        }
    }
});

result.subscribe(function(json) {
    console.log(json);
});

//The following is printed to the console:
//{
//    json: {
//        "titlesById": {           
//            "99": {
//               "name": "House of Cards",
//               "rating": 5
//            }
//        }
//    }
//}
*/


/**
 * @name call
 * @function
 * @arg {Path} functionPath the path to the function to invoke
 * @arg {Array.<Object>} args the arguments to pass to the function
 * @arg {Array.<PathSet>} pathSuffixes paths to retrieve from objects returned from the Function
 * @arg {Array.<PathSet>} paths paths to retrieve after successful Function execution
 * @returns {Observable.<JSONGraphEnvelope>} jsonGraphEnvelope the response returned from the server.
 * @memberof DataSource.prototype
 */

/**
 * A XMLHttpDataSource object is a {@link DataSource} can be used to retrieve data from a remote JSONGraph model using the browser's {@link XMLHttpRequest} object. 
 * @constructor XMLHttpDataSource
 * @augments DataSource
 * @param jsonGraphUrl the URL of the JSONGraph model.
 * @example
var model = new falcor.Model({source: new falcor.XMLHttpDataSource("http://netflix.com/user.json")});
var movieNames = model.get('genreLists[0...10][0...10].name').toPathValues();
 */

/**
 * A JSONGraphEnvelope is an envelope that wraps a JSONGraph fragment. In addition to {@link PathValue}s and {@link JSONEnvelope}s, {@link Model}s can accept and return JSONGraphEnvelopes. In addition to a JSONGraph fragment, a {@link JSONGraphEnvelope} may contain an array of errors that occurred while an operation was being executed on a JSONGraph Model. In the event a function was executed on a Model, the JSONGraphEnvelope may also contain a list of paths to invalidate in the {@link Model}'s local cache.
 * @typedef {Object} JSONGraphEnvelope
 * @property {?Array.<PathSet>} paths - The paths to the values stored in the JSONGraph fragment.
 * @property {JSONGraph} jsonGraph - a JSONGraph object containing all of the values.
 * @property {?Array.<Error>} errors - one or more errors that occurred while evaluating paths on a {@link Model}.
 * @property {?Array.<PathSet>} invalidated - the paths to be removed from the {@link Model}'s local cache.
 */

/**
 * A JSONEnvelope is an envelope that wraps a JSON fragment. In addition to {@link PathValue}s and {@link JSONGraphEnvelope}s, {@link Model}s can accept and return JSONEnvelopes. In addition to a JSON fragment, a {@link JSONEnvelope} may contain an array of errors that occurred while an operation was being executed on a JSON Model. In the event a function was executed on a Model, the JSONEnvelope may also contain a list of paths to invalidate in the {@link Model}'s local cache.
 * @typedef {Object} JSONEnvelope
 * @property {?Array.<PathSet>} paths - The paths to the values stored in the JSON fragment.
 * @property {JSON} json - a JSON object containing all of the values.
 * @property {?Array.<Error>} errors - one or more errors that occurred while evaluating paths on a {@link Model}.
 * @property {?Array.<PathSet>} invalidated - the paths to be removed from the {@link Model}'s local cache.
 */

/**
 * In addition to the usual JSON value types (string, number, boolean), {@link JSONGraph} introduces three additional value types: ref, error, and atom. An Atom "boxes" a value, causing that value to be treated as atomic regardless of whether it is a JSON value or a JSON object like a Map or an Array. Atoms behave like values, meaning they are always returned whole and must be replaced completely. 

 In addition to being treated as values by Models, the values within Atoms are automatically "unboxed" when retrieved from a Model. This means that if a Model encounters an Atom while evaluating a path, the Model returns the Atom's value instead of the entire Atom object.

```JavaScript
var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                rating: {
                    $type: "atom", 
                    value: 5
                }
            }
        }
    }
});

// The following code prints 5 to the console instead of {$type: "atom", value: 5}, because the value of the Atom is unboxed before being returned by the Model.
    getValue('titlesById[99].rating').
    then(rating => console.log(rating));
```

JSON Objects and Arrays boxed in Atoms are treated as atomic values by the Model, just like strings, numbers, and booleans. Boxing JSON objects in Atoms allows you to ensure that a JSON Object or Array will always be returned from the Model (and by extension the server) in their entirety. 

In the example below the array of a Netflix title's supported languages are boxed in an Atom, ensuring that they are always returned whole from the Model.
```JavaScript
var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                supportedLanguages: {
                    $type: "atom", 
                    value: ["en", "fr"]
                }
            }
        }
    }
});

// Note the attempt to retrieve the first item in the title's supported languages array.
model.
    get('titlesById[99].supportedLanguages[0]').
    then(json => console.log(json));

// If the code above is run the following will be printed to the console:
// {
//     json: {
//         titlesById: {
//            99: {
//                 supportedLanguages: ["en", "fr"]
//            }
//         }
//     }
// }

// Note that entire supported language array was retrieved rather
// than the first item in the array, because the Model treats the 
// values of an atom as atomic.
```

In addition to being used to force Model's to treat JSON objects and Array as atomic values, Atoms can be used to associate metadata with a value. As Atoms are maps, they can include metadata keys that can be used by Falcor Models or Applications to influence the way values are handled once downloaded to the client. In the example below, we use an atom to set a cache expiration time for the rating of a Netflix title. 

```JavaScript
var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                rating: {
                    $type: "atom", 
                    value: 5, 
                    // expires two seconds from now
                    $expires: -2000
                }
            }
        }
    }
});

// prints "5"
model.
    getValue('titlesById[99].rating').
    subscribe(rating => console.log(rating));

setTimeout(function() {
    // prints undefined
    model.
        getValue('titlesById[99].rating').
        subscribe(rating => console.log(rating));
        
}, 3000);
```

If you wish to turn off unboxing behavior and retrieve the Atom from a Model, you can use {@Model.prototype.boxValues}.

```JavaScript
var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                rating: {
                    $type: "atom", 
                    value: 5
                }
            }
        }
    }
});

// The following code prints {$type: "atom", value: 5}, because
// because the Atom value is unboxed before the Model returns it.
model.
    boxValues().
    getValue('titlesById[99].rating').
    then(rating => console.log(rating));

```
 * @typedef {Object} Atom
 * @property {String} $type - A $type property with a value of "atom".
 * @property {Object} value - The value wrapped by the Atom.
 * @see {@link Atom}
 * @example
var model = new falcor.Model({
    cache: {
        user: {
            name: {
                // Metadata that indicates this object is a Atom
                $type: "atom",
                // The value property contains the value box by the Atom
                value: "Jim Parsons",
                // Metadata that dictates that this value should be purged from the {@link Model}'s cache after two minutes. Negative numbers imply that expiration occurs relative to the current time.
                $expires: -(1000 * 60 * 2)
            }
        }
    }
});

model.getValue(["user", "name"]).subscribe(function(value) {
    console.log(value);
});

// The code above outputs the following text to the console.
// Jim Parsons
// Note that the value property within the Atom rather than the Atom object itself is returned.
 */


/**
 * A range object describes a range of integers. The range object must contain either a "to" or "length" property. 
 * @typedef {Object} Range
 * @property {number} [from=0] - the lower bound of the range (inclusive).
 * @property {?number} to - the upper bound of the range (inclusive). Must be >= to the "from" value.
 * @property {?number} length - the length of the range. Must be >= 0.
 * @example
// Example that uses the "to" property in a range.
var model = new Model({
    cache: {
        friends: {
            "0": {
                name: "Jim"
            },
            "1": {
                name: "Ted"
            },
            "2": {
                name: "Don"
            },
            length: 23
        }
    }
});

// The following range specifies the numbers 0, 1, and 2.
var range = {from: 0, to: 2};

var results = model.getValues(["friendsById", range, "name"]);
results.forEach(function(pathValue) {
    console.log(JSON.stringify(pathValue));
})

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["friendsById",0,"name"],"value":"Jim"}
// {"path":["friendsById",2,"name"],"value":"Don"}
// {"path":["friendsById",1,"name"],"value":"Ted"}
* @example
// Example that uses the "length" property in a range.
var model = new Model({
    cache: {
        friends: {
            "0": {
                name: "Jim"
            },
            "1": {
                name: "Ted"
            },
            "2": {
                name: "Don"
            },
            length: 23
        }
    }
});

// The following range specifies the numbers 1 and 2.
var range = {from: 1, length: 2};

var results = model.get(["friendsById", range, "name"]).toPathValues();
results.forEach(function(pathValue) {
    console.log(JSON.stringify(pathValue));
})

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["friendsById",2,"name"],"value":"Don"}
// {"path":["friendsById",1,"name"],"value":"Ted"}
 */

/**
 * {@link Key}s are values that can be included in {@link Path} expressions. A Key can be any JSON value type including a string, number, boolean, or null. When evaluated all keys are coerced to strings except null. This means that looking up the number 1 and the string "1" will have the same effect. All strings are allowed with the exception of those beginning with "__", which are illegal to use as key names in a JSONGraph model.
 * @typedef {(string|number|boolean|null)} Key
 */

/**
 * {@link Path}s are an ordered list of keys describing a location in a JSONGraph model. Paths can be provided to {@link Model}s to describe the location of data in the JSONGraph model. {@link Model}s also emit {@link Path} objects alongside values retrieved from the JSONGraph model in order to provide additional context. 
 * @typedef {Array.<Key>} Path
 @example
var model = new Model({
    cache: {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "length": 1
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            }
        },
        // map of all titles, organized by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            }
        }
    }
});

// Attempt to retrieve three individual paths from the JSONGraph model
var values = 
    model.
        get(
            'genreLists[0][0].name',
            'genreLists[0][0].rating',
            'genreLists[0][1].name').
        toPathValues();

values.forEach(function(pathValue) { 
    console.log(JSON.stringify(pathValue));
});

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["genreLists",0,1,"name"],"value":"Orange is the New Black"}
// {"path":["genreLists",0,0,"rating"],"value":5}
// {"path":["genreLists",0,0,"name"],"value":"House of Cards"}
 */

/**
 * {@link KeySet}s are included inside of {@link PathSet} expressions. A {@link KeySet} can either be a {@link Key}, a {@link Range}, or an Array of either.
 * @typedef {(Key|Range|Array.<(Key|Range)>)} KeySet
 */

/**
 * {@link PathSet} Expressions are a human-readable compression format that is equivalent to a set of {@link Path} expressions. Unlike {@link Path} expressions, {@link PathSet}s can contain {@link KeySet} objects like {@link Range}s and Arrays of keys. 
 In addition to being a more terse than specifying multiple {@link Path} objects, {@link PathSet}s are generally more efficient to evaluate.
 * @typedef {Array.<KeySet>} PathSet
 * @example
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles, organized by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Use a path set containing ranges and arrays to retrieve the name and rating of the first two titles in the first two genre lists.
var values = model.get('genreLists[0..1][0..1]["name", "rating"]'');

// The path evaluator expands the path set above to a set of 8 {@link Path} objects.
// In other words the code below produces the same dataset as the code above:
var values = model.get(
    ["genreLists", 0, 0, "name"],
    ["genreLists", 0, 0, "rating"],
    ["genreLists", 0, 1, "name"],
    ["genreLists", 0, 1, "rating"],
    ["genreLists", 1, 0, "name"],
    ["genreLists", 1, 0, "rating"],
    ["genreLists", 1, 1, "name"],
    ["genreLists", 1, 1, "rating"]);
 */
/**
 * A PathValue is made up of a path and a value. In addition to the value, each {@link PathValue} includes the {@link Path} to the value in the JSONGraph model.
 * @typedef {Object} PathValue
 * @property {PathSet} path 
 * @property {?Object} value
 * @example
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles, organized by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

var pathValues = 
    model.
        get(
            ["genreLists", 0, 0, "name"], 
            ["genreLists", 0, 0, "rating"]).
        toPathValues();

pathValues.forEach(function(pathValue) { 
    console.log(JSON.stringify(pathValue)); 
});

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["genreLists",0,0,"rating"],"value":5}
// {"path":["genreLists",0,0,"name"],"value":"Orange is the New Black"}

// Note that the values above were returned out of order. This was possible 
// because each PathValue provides sufficient context (ie the path) to 
// differentiate which value is being sent.
 */

/**
 * JavaScript Object Notation Graph (JSONGraph) is a notation for expressing graphs in JSON. JSON is a hierarchical data format, capable of modeling trees. Here's an example of a JSON document containing a list of genres, each containing a list of titles:
 * @example 
 // JSONGraph model modeling a list of film genres, each of which contains the same title.
 {
    // list of user's genres, modeled as a map with ordinal keys
    "genreLists": {
        "0": $ref('genresById[123]'),
        "1": $ref('genresById[522]'),
        "length": 2
    },
    // map of all genres, organized by ID
    "genresById": {
        // genre list modeled as map with ordinal keys
        "123": {
            "name": "Drama",
            "0": $ref('titlesById[23]'),
            "1": $ref('titlesById[99]'),
            "length": 2
        },
        // genre list modeled as map with ordinal keys
        "522": {
            "name": "Comedy",
            "0": $ref('titlesById[23]'),
            "1": $ref('titlesById[44]'),
            "length": 2           
        }
    },
    // map of all titles, organized by ID
    "titlesById": {
       "99": {
            "name": "House of Cards",
            "rating": 5
        },
        "23": {
            "name": "Orange is the New Black",
            "rating": 5
        },
        "44": {
            "name": "Arrested Development",
            "rating": 5            
        }
    }
}
 * @typedef {Object} JSONGraph
 */

/**
 * A ModelResponse is a container for the results of a get, set, or call operation performed on a Model. A ModelResponse can convert the data in the container into any of the following formats: JSON, {@link JSONGraph}, a stream of {@link PathValue}s, or a scalar value. Once the data format is determined, the ModelResponse container can be converted into any of the following container types: Observable (default), or a Promise. A ModelResponse can also push data to a node-style callback.
 * @constructor ModelResponse
 * @augments Observable
 * @example
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles, organized by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Use a path set containing ranges and arrays to retrieve the name and rating of the first two titles in the first two genre lists.
var values = 
    model.
        get(
            ["genreLists", {to: 1}, {from: 0, length: 2}, ["name", "rating"]]);

// The path evaluator expands the path set above to a set of 8 {@link Path} objects.
// In other words the code below produces the same dataset as the code above:
var values = model.get(
    ["genreLists", 0, 0, "name"],
    ["genreLists", 0, 0, "rating"],
    ["genreLists", 0, 1, "name"],
    ["genreLists", 0, 1, "rating"],
    ["genreLists", 1, 0, "name"],
    ["genreLists", 1, 0, "rating"],
    ["genreLists", 1, 1, "name"],
    ["genreLists", 1, 1, "rating"]);

/**
 * Converts the data format of the data in a JSONGraph Model response to a stream of path values.
 * @name toPathValues
 * @memberof ModelResponse.prototype
 * @function 
 * @return ModelResponse.<PathValue>
 * @example
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// get the ModelResponse
var response = model.get(["genreLists", 0, 0, ["name","rating"]]);

response.toPathValues().forEach(function(pathValue) { 
    console.log(JSON.stringify(pathValue)); 
});

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["genreLists",0,0,"rating"],"value":5}
// {"path":["genreLists",0,0,"name"],"value":"Orange is the New Black"}

// Note that the values above were returned out of order. This was possible 
// because each PathValue provides sufficient context (ie the path) to 
// differentiate which value is being sent.
 */

/**
 * Converts the data format of the data returned in a Model Response to JSONGraph.
 * @name toJSONGraph
 * @memberof ModelResponse.prototype
 * @function 
 * @return ModelResponse.<JSONGraphEnvelope>
 * @example
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// get the ModelResponse
var response = model.get(["genreLists", 0, 0, ["name","rating"]]);

response.toJSONGraph().forEach(function(jsonGraphEnvelope) { 
    console.log(JSON.stringify(jsonGraphEnvelope)); 
});

// The code above outputs the following {@link JSONGraphEnvelope} to the console.
// {
//     "paths": [["genreLists", 0, 0, ["name","rating"]]],
//     "jsonGraph": {
//         // list of user's genres, modeled as a map with ordinal keys
//         "genreLists": {
//             "0": { $type: "ref", value: ["genresById", 123] }
//         },
//         // map of all genres, organized by ID
//         "genresById": {
//             // genre list modeled as map with ordinal keys
//             "123": {
//                 "0": { $type: "ref", value: ["titlesById", 23] }
//             }
//         },
//         // map of all titles by ID
//         "titlesById": {
//             "23": {
//                 "name": "Orange is the New Black",
//                 "rating": 5
//             }
//         }
//     }    
// }
 */

/**
 * Converts the data format of the results to JSON. 
 * @name toJSON
 * @memberof ModelResponse.prototype
 * @function 
 * @return ModelResponse.<JSONEnvelope>
 * @example
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// get the ModelResponse
var response = model.get(["genreLists", 0, 0, ["name","rating"]]);

response.toJSON().forEach(function(jsonEnvelope) { 
    console.log(JSON.stringify(jsonEnvelope)); 
});

// The code above outputs the following {@link JSONEnvelope} to the console.
// {
//     "json": {
//         // list of user's genres, modeled as a map with ordinal keys
//         "genreLists": {
//             "0": {
//                 "0": {
//                     "name": "Orange is the New Black",
//                     "rating": 5
//                 }
//             }
//         }    
//     }
// }
 */

/**
 * The getValue method retrieves a single {@link Path} from a {@link Model}.
 * @name getValue
 * @memberof Model.prototype
 * @function
 * @arg {Path} path the path to retrieve
 * @return {Observable.<Object>} the requested value.
 * @example
 var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        user: {
            name: "Jim"
        }
    });

model.
    getValue(["user","name"]).
    subscribe(function(name) {
        console.log(name);
    });

// The code above prints "Jim" to the console.
 */

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method is versatile and may be called in several different ways, allowing you to make different trade-offs between performance and expressiveness. The simplest invocation returns an ModelResponse stream that contains a JSON object with all of the requested values. An optional selector function can also be passed in order to translate the retrieved data before it appears in the Observable stream. If a selector function is provided, the output will be an Observable stream with the result of the selector function invocation instead of a ModelResponse stream.
 If you intend to transform the JSON data into another form, specifying a selector function may be more efficient. The selector function is run once all of the requested path values are available. In the body of the selector function, you can read data from the Model's cache using {@link Model.prototype.getValueSync} and transform it directly into its final representation (ex. an HTML string). This technique can reduce allocations by preventing the get method from copying the data in {@link Model}'s cache into an intermediary JSON representation.
 Instead of directly accessing the cache within the selector function, you can optionally pass arguments to the selector function and they will be automatically bound to the corresponding {@link Path} or {@link PathSet} passed to the get method. If a {@link Path} is bound to a selector function argument, the function argument will contain the value found at that path. However if a {@link PathSet} is bound to a selector function argument, the function argument will be a JSON structure containing all of the path values. Using argument binding can provide a good balance between allocations and expressiveness. For more detail on how {@link Path}s and {@link PathSet}s are bound to selector function arguments, see the examples below.  
 * @name get
 * @memberof Model.prototype
 * @function
 * @arg {...PathSet} path the path(s) to retrieve
 * @arg {?Function} selector the callback that runs once all of the values have been loaded into cache
 * @return {ModelResponse.<JSONEnvelope> | Observable} the requested data as JSON, or the result of the optional selector function.
 * @example
 // In this example, we will create a JSONGraph model and populate its cache with a list of genres and titles to mock the server. Then we will request the name and rating of the first two titles in the first genre list. We will then retrieve the resulting JSON object from an observable stream and convert it into an HTML list.
 var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

var nameAndRatings = 
    model.get(
        ["genreLists", 0, {to:1}, ["name","rating"]],
        ["genreLists", 0, "name"]);

// When we then to the Observable stream, we get the following JSON structure containing all of the requested paths:
// {
//    "json": {
//        "genreLists": {
//            "0": {
//                "name": "Drama",
//              "0": {
//                  name: "Orange is the New Black",
//                  rating: 5
//              },
//              "1": {
//                  name: "House of Cards",
//                  rating: 5
//              }
//          }
//      }
//   }
// }

// Converts a integer into a string of stars
function getStars(num) {
    var stars = "",
        counter;

    if (num !== undefined) {
        for(counter = 0; counter < num; counter++) {
            stars += "*";
        }
    }

    return stars;
}

nameAndRatings.subscribe(function(value) { 
    // Convert the JSON data into an HTML list...
    var html = "",
        json = value.json;
    if (data.genreLists && json.genreLists[0]){
        var genre = json.genreLists[0];
        html += "&lt;h1&gt;" + genre + "&lt;/h1&gt;\n" +
        "&lt;ul&gt;\n;
        for(var counter = 0; counter < 2; counter++){
            if (genre[counter]){
                var title = genre[counter];
                html += "&lt;li&gt;" + title.name + getStars(title.rating) + "&lt;/li&gt;\n";
            }
        } 
        html += "&lt;/ul&gt;";
    }
    console.log(html); 
});

// The code above outputs the following to the console:
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black *****&lt;/li&gt;
// &lt;li&gt;House of Cards *****&lt;/li&gt;
// &lt;/ul&gt;
 * @example
// In this example, we will perform the same operation as the last example: we will retrieve data from a local JSONGraph model cache and convert it into an HTML list. In the previous example, we converted the JSONGraph in the cache to JSON and then subsequently into HTML. In this example, we will avoid this intermediary JSON transformation by providing a selector function to the get method. Within the selector function, we will access the JSONGraph data in the Model's local cache and transform it directly into HTML.

// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model(new falcor.XMLHttpDataSource('http://netflix.com/model.jsonGraph'));

// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Converts a integer into a string of stars
function getStars(num) {
    var stars = "",
        counter;

    if (num !== undefined) {
        for(counter = 0; counter < num; counter++) {
            stars += "*";
        }
    }

    return stars;
}

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating an intermediary JSON result.
// Within the selector function we read data directly from the cache, and convert it directly into HTML.
var html = model.get(
    ["genreLists", 0, {to:1}, ["name","rating"]], ["genreLists", 0, "name"],
    // When this function is invoked all of the requested paths should be available in the cache, except for those paths that could not be retrieved due to an error.
    function() {
        var firstGenreList = model.bindSync(["genreLists",0]);
        return "&lt;h1&gt;" + firstGenreList.getValueSync(["name"]) + "&lt;/h1&gt;\n" +
            "&lt;ul&gt;\n" + 
            [0,1].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "&lt;li&gt;" + nameAndRating.getValueSync(["name"]) + " " + getStars(nameAndRating.getValueSync(["rating"])) + "&lt;/li&gt;\n";
                }) + 
            "&lt;/ul&gt;";
    });

html.subscribe(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black *****&lt;/li&gt;
// &lt;li&gt;House of Cards *****&lt;/li&gt;
// &lt;/ul&gt;
 * @example
// In this example, we will perform the same operation as the last example: we will retrieve data from a local JSONGraph model cache and convert it into an HTML list. In the previous example, we passed a selector function to the get method and transformed the JSONGraph data in the cache directly into HTML. This improved performance by removing the need to create an intermediary JSON object, but required us to repeat the path twice: once in the method's argument list, and again in the body of the selector function. In this example, we will achieve a good balance between performance and expressiveness by passing arguments to the selector function. 

// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model(new XMLHttpDataSource('http://netflix.com/model.jsonGraph'));
// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Converts a integer into a string of stars
function getStars(num) {
    var stars = "",
        counter;

    if (num !== undefined) {
        for(counter = 0; counter < num; counter++) {
            stars += "*";
        }
    }

    return stars;
}

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating a JSON result.
// We pass arguments to the selector function and they are bound to the values of the requested paths. We then convert the path values directly into HTML.
var html = model.get(
    ["genreName", 0, {to:1}, ["name","rating"]], ["genreName", 0, "name"],
    // Arguments passed to the selector function will be bound to the values of the paths.
    // The process of binding path values to the arguments of selector functions works like this:
    // If a selector function argument is specified for a {@link PathSet}, all {@link Key}s are removed from the JSON data structure, leaving behind only the keys in the {@link KeySet}s.
    // nameAndRatings is bound to the value of ["genreName", 0, {to:1}, ["name","rating"]], which is:
    // {
    //     "0": {
    //         "name": "Orange is the New Black",
    //         "rating": 5
    //     },
    //     "1": {
    //         "name": "House of Cards",
    //         "rating": 5
    //     }
    // }
    // Notice that the {@link Key}s ["genreLists",0] in the path are not present in the JSON object above, only the {@link KeySet}s [{to:1}, ["name","rating"]]. This optimization decreases allocations and repetitive boiler plate code.
    // genreName is bound to the value of ["genreLists", 0, "name"], which is "Drama".
    function(nameAndRatings, genreName) {
        return "&lt;h1&gt;" + genreName + "&lt;/h1&gt;\n" +
            "&lt;ul&gt;\n" + 
            [0,1].
                // filter out indexes that are null or undefined
                filter(function(index) {
                    return nameAndRatings[index] != null;
                }).
                map(function(index) {
                    var nameAndRating = nameAndRatings[index];
                    return "&lt;li&gt;" + nameAndRating["name"] + " " + getStars(nameAndRating["rating"]) + "&lt;/li&gt;\n";
                }) + 
            "&lt;/ul&gt;";
    });

html.subscribe(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black *****&lt;/li&gt;
// &lt;li&gt;House of Cards *****&lt;/li&gt;
// &lt;/ul&gt;
 * @example
// In this example, we will perform the same operation as in the last example: we will retrieve data from a local JSONGraph model cache and convert it into an HTML list. In the previous example, we achieved a good balance between performance and expressiveness by binding the value of the requested paths to arguments in the selector function. In the code below, we will again pass arguments to the selector function to show another example of how {@link PathSet} values are bound to arguments. 
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model(new XMLHttpDataSource('http://netflix.com/model.jsonGraph'));
// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating a JSON result.
// Within the selector function we read data directly from the cache, and convert it directly into HTML.
var html = model.get(
    ["genreLists", {to:1}, {to:1}, "name"], ["genreLists", {to:1}, "name"],
    // Arguments passed to the selector function will be bound to the values of the paths.
    // The process of binding path values to the arguments of selector functions works like this:
    // If a {@link PathSet} is bound to a selector function argument, all {@link Key}s are removed from the JSON data structure, leaving behind only the keys in the {@link KeySet}s.
    // names is bound to the value of ["genreLists", {to:1}, {to:1}, "name"], which is:
    // {
    //     "0": {
    //         "0": "Orange is the New Black",
    //         "1": "House of Cards"
    //     },
    //     "1": {
    //         "0": "Orange is the New Black",
    //         "1": "Arrested Development"
    //     }
    // }
    // Notice that of the path ["genreLists",{to:1},{to:1}, "name"] the {@link Key}s ["genreLists"] and ["name"] in the path are not present in the structure, only the {@link KeySet}s [{to:1},{to:1}]. This optimization decreases allocations and repetitive boiler plate code.
    // genreNames is bound to the value of ["genreLists", {to:1}, "name"], which is:
    // {
    //     "0": "Drama",
    //     "1": "Comedy"
    // }
    // Notice once again that the {@link Key}s ("genreLists","name") have been removed from the structure, leaving only the keys in the {@link KeySet} ({to:1}) in the data structure.
    function(names, genreNames) {
        return [0,1].
            // filter out indexes that are null or undefined
            filter(function(index) {
                return genreNames[index] != null;
            }).
            map(function(genreIndex) {
                var genreName = genreNames[genreIndex];
                return "&lt;h1&gt;" + genreName + "&lt;/h1&gt;\n" +
                "&lt;ul&gt;\n" + 
                    [0,1].
                        // filter out indexes that are null or undefined
                        filter(function(index) {
                            return names[index] != null;
                        }).
                        map(function(index) {
                            var name = names[index];
                            return "&lt;li&gt;" + name["name"] + "&lt;/li&gt;\n";
                        }) + 
                    "&lt;/ul&gt;";
            });
    });

html.subscribe(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black&lt;/li&gt;
// &lt;li&gt;House of Cards&lt;/li&gt;
// &lt;/ul&gt;
// &lt;h1&gt;Comedy&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black&lt;/li&gt;
// &lt;li&gt;Arrested Development&lt;/li&gt;
// &lt;/ul&gt;
 * @example
// In this example, we will demonstrate what happens when errors are encountered while evaluating paths. 

var model = new falcor.Model();
// Loading a JSONGraph object into the Model's cache to mock a server model locally.
model.setCache(
    {
        user: {
            name: "Frank Underwood",
            hometown: {$type: 'error', value: 'Could not be retrieved from server.'},
            // A JSONGraph Error is any map that contains a $type key of "error." Errors are JSONGraph Atoms, which are special maps that act like values in that they are always returned whole. Errors are handled differently than normal values by the Models. 
            country: {$type: 'error', value: 'Could not be retrieved from server.'}
        }
    });

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating a JSON result.
// Within the selector function we read data directly from the cache, and convert it directly into HTML.
var userHtml = model.get(
    ["user", "name"], ["user", "hometown"], ["user", "country"],
    function(name, hometown, country) {
        return "Name: " + name + ", Hometown: " + hometown + ", Country: " + country;
    });

// Use 
html.subscribe(
    function(html) { 
        console.log(html); 
    },
    function(e) {
        console.log(JSON.stringify(e));
    });

// The code above outputs the following HTML fragment to the console.
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black&lt;/li&gt;
// &lt;li&gt;House of Cards&lt;/li&gt;
// &lt;/ul&gt;
// &lt;h1&gt;Comedy&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black&lt;/li&gt;
// &lt;li&gt;Arrested Development&lt;/li&gt;
// &lt;/ul&gt;
*/

/**
 * The getProgressively method retrieves several {@link Path}s or {@link PathSet}s from the JSONGraph object, and makes them available in the local cache. Like the {@link Model.prototype.getProgressively} function, getProgressively invokes a selector function every time is available, creating a stream of objects where each new object is a more populated version of the one before. The getProgressively function is a memory-efficient alternative to the getProgressively function, because get does not convert the requested data from JSONGraph to JSON. Instead the getProgressively function attempts to ensure that the requested paths are locally available in the cache when it invokes a selector function. Within the selector function, data is synchronously retrieved from the local cache and translated into another form - usually a view object. Within the selector function you can use helper methods like getValueSync and setValueSync to synchronously retrieve data from the cache. These methods are only valid within the selector function, and will throw if executed anywhere else.
 * @name getProgressively
 * @memberof Model.prototype
 * @function
 * @arg {...PathSet} path the path(s) to retrieve
 * @arg {Function} selector the callback that runs once all of the values have been loaded into cache
 * @return {ModelResponse.<JSONEnvelope>} the values found at the requested paths.
 * @example
// In this example we will retrieve data from the model and converted it into an HTML representation.
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model(new XMLHttpDataSource('http://netflix.com/model.jsonGraph'));

// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Converts a integer into a string of stars
function getStars(num) {
    var stars = "",
        counter;

    if (num !== undefined) {
        for(counter = 0; counter < num; counter++) {
            stars += "*";
        }
    }

    return stars;
}

// Note that in the example below we ask for the first three titles in the first genre list. This will 
// result in a request to the server for ["genreLists", 0, 2, ["name","rating"]] because the third title 
// is not in the cache. The selector function passed to getProgressively will be called twice. The first time, the only data available in the cache will be the data that was already present. The second time the cache will also contain the additional data downloaded from the server.
// Each time the selector function is invoked, there is more data. The selector function converts the 
// data present into an HTML representation. The result is a stream of progressively larger HTML strings.
var nameAndRatings = model.getProgressively(
    ["genreLists", 0, {to:2}, ["name","rating"]], ["genreLists", 0, "name"],
    // When this function is invoked all of the data should be available in the cache, except for those paths that caused an error to occur
    function() {
        var firstGenreList = model.bindSync(["genreLists",0]);
        return "&lt;h1&gt;" + firstGenreList.getValueSync(["name"]) + "&lt;/h1&gt;\n" +
            "&lt;ul&gt;\n" + 
            [0,1,2].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "&lt;li&gt;" + nameAndRating.getValueSync(["name"]) + " " + getStars(nameAndRating.getValueSync(["rating"])) + "&lt;/li&gt;\n";
                }) + 
            "&lt;/ul&gt;";
    });

nameAndRatings.forEach(function(html) { 
    console.log(html); 
});

// The code above outputs the following two HTML fragments to the console.
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black *****&lt;/li&gt;
// &lt;li&gt;House of cards *****&lt;/li&gt;
// &lt;/ul&gt;
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black *****&lt;/li&gt;
// &lt;li&gt;House of Cards *****&lt;/li&gt;
// &lt;li&gt;Hemlock Grove *****&lt;/li&gt;
// &lt;/ul&gt;
// Notice that the first HTML Fragment does not contain the "Hemlock Grove" title. However the second time around the title has been downloaded from the remote model and is present in the results.
*/

/**
 * The getProgressively method retrieves several {@link Path}s or {@link PathSet}s from the JSONGraph object, and returns the requested data as an {@link Observable} sequence of JSON tree. Returning the requested data as a JSON tree rather than a JSONGraph object makes it easy to send the data into a template. The method is called getProgressively because the JSON tree is progressively populated as data arrives. In this regard this method differs from the {@link Model.prototype.get} method, which waits until all the data is present before returning a result in the {@link Observable} stream. Each time a new {@link JSONGraphEnvelope} arrives, it is added to the tree, and the tree is added to the sequence again. This method is ideal if you want to render the data that is present in the local cache immediately and then rerender each time data arrives from the remote model on the server.
 * An optional selector function can be specified which receives an argument for each {@link Path} or {@link PathSet} passed to the method. For a PathSet, the value passed to the selector function will be a JSON value that starts at the first {@link KeySet} found in the {@link PathSet}. If a {@link Path} is passed, the value found at the path will be passed as the argument to the selector function.
 * If an error is encountered when attempting to retrieve a {@link Path}, undefined is passed to the selector function in place of the {@link Path}'s value. If all attempts to retrieve {@link Path}s resulted in error, the selector function will not be invoked. Errors can be retrieved by passing an onError callback to the {@link Observable}s forEach method. If multiple errors are encountered, a {@link CompositeError} object is sent.
 * @name getProgressively
 * @memberof Model.prototype
 * @function
 * @arg {...PathSet} path the path(s) to retrieve
 * @arg {?Function} selector an optional selector function that receives an argument for each specified PathSet. Each argument contains the value of that PathSet.
 * @return {Observable.<Object>}
* @example
// In this example we will retrieve data from the model as a JSON tree and then display it to the console.
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model(new XMLHttpDataSource('http://netflix.com/model.jsonGraph'));

// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Requesting the name of the first three titles in the first genre list.
// Note that the first two titles will be found in the cache, whereas the last one will have to be requested from the data source.
var nameAndRatings = model.getProgressively(
    ["genreLists", 0, {to:2}, "name"]);

nameAndRatings.forEach(function(data) { 
    console.log(JSON.stringify(data)); 
});

// The code above outputs the following two trees to the console. 
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     name: "Orange is the New Black",
//                     rating: 5
//                 },
//                 "1": {
//                     name: "House of Cards",
//                     rating: 5
//                 }
//             }
//         }
//     }
// }
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     name: "Orange is the New Black",
//                     rating: 5
//                 },
//                 "1": {
//                     name: "House of Cards",
//                     rating: 5
//                 },
//                 "2": {
//                     name: "Hemlock Grove",
//                     rating: 5
//                 }                  
//             }
//         }
//     }
// }

// Note that the first time the tree is output to the console it contains only the data in the cache. The second time it contains the new data that has arrived from the remote model on the server.
*/

/**
 * Returns a copy of the {@link Model} that uses only the data in the local cache. The new {@link Model} never makes a request to a remote JSONGraph model using a {@link DataSource} if data cannot be found in the local cache.
 * @name invalidate
 * @memberof Model.prototype
 * @arg {...PathSet} path the paths to the data to remove from the local cache.
 * @function
 * @return {ModelResponse.<JSONEnvelope>} an {@link Observable} containing the values after the invalidation operation is complete.
 */

/**
 * Returns a copy of the {@link Model} that uses only the data in the local cache. The new {@link Model} never makes a request to a remote JSONGraph model using a {@link DataSource} if data cannot be found in the local cache.
 * @name withoutSource
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that uses only the data in the local cache, and never makes a request to a remote JSONGraph model if data cannot be found locally.
 */

/**
 * Returns a copy of the {@link Model} that attempts to batch concurrent requests of the same type. If two requests for different paths are made to a batched {@link Model} within a time slice defined by a {@link Scheduler} or a number of milliseconds, a single request for both paths will be made to remote JSONGraph model. If no scheduler or time is specified, the batch will be formed as soon as the current tick has finished. Enabling batching on a {@link Model} can make more efficient use of the network by reducing the number of requests to the server.
 * @name batch
 * @memberof Model.prototype
 * @function
 * @arg {?Scheduler|number} schedulerOrDelay either a scheduler object that determines when a batch of requests is sent to a {@link DataSource}, or the number of milliseconds to spend collecting a batch before sending a request to the {@link DataSource}. If this parameter is omitted, then batch collection ends at the end of the next tick.
 * @return {Model} a {@link Model} that batches requests of the same type and sends them to the data source together.
 @example
 // In this example we will demonstrate that multiple calls made to a batched JSONGraph model in a single tick will only result in a single request to the {@link DataSource} responsible for retrieving data from the server.

 // create a variable to track the number of requests sent to our mock {@link DataSource}.
 var requestCount = 0;

 // create an object that mocks a {@link DataSource}, an object typically used to retrieve
 // information from the network.
 // Even though multiple calls to {@link Model.prototype.get} will be made on the 
 // batched {@link Model}, we expect that only one request will be sent to the
 // server.
 var mockDataSource = {
    // expecting one request for ["titlesById", [99, 23, 44], ["name", "rating"]]
    get: function(paths) {
        requestCount++;

        // return an Observable stream of the {@link JSONGraphEnvelope} that a server would return
        return falcor.Observable.of({
            paths: [["titlesById", [23,44, 99], ["name", "rating"]]],
            jsong: {
                "titlesById": {
                "99": {
                    "name": "House of Cards",
                    "rating": 5
                },
                "23": {
                    "name": "Orange is the New Black",
                    "rating": 5
                },
                "44": {
                    "name": "Arrested Development",
                    "rating": 5            
                }
            }
        })
    }
 };

 // Create a Model that uses the mock {@link DataSource} for data retrieval
 var model = new falcor.Model(mockDataSource);

// Loading a fragment of the JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        }
    });

// Create a batched {@link Model} that accumulates get and set 
// requests into batches and sends them at the end of the current tick.
var batchedJsongModel = model.batch();

// creating an Observable stream of a JSON object that contains the names of the first two titles in the first genre list
var names = batchedJsongModel.get(["genreLists", 0, {to:1}, ["name"]]);

// creating an Observable stream of a JSON object that contains the ratings of the first two titles in the first genre list
var ratings = batchedJsongModel.get(["genreLists", 0, {to:1}, ["rating"]]);

// retrieving the JSON object with the ratings from the stream
names.subscribe(function(jsonEnvelope) {
    console.log("Names arrived:")
    console.log(JSON.stringify(jsonEnvelope));
    console.log("Total number of data source requests:", requestCount);
})

// retrieving the JSON object with the ratings from the stream
ratings.subscribe(function(jsonEnvelope) {
    console.log("Ratings arrived:")
    console.log(JSON.stringify(jsonEnvelope));
    console.log("Total number of data source requests:", requestCount);
})

// Both the requests for names and ratings should result in only one call to the
// {@link DataSource}.
// The code above prints the following to the console:
// Names arrived:
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     name: "Orange is the New Black"
//                 },
//                 "1": {
//                     name: "House of Cards"
//                 }
//             }
//         }
//     }
// }
// Total number of data source requests: 1
// Ratings arrived:
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     rating: 5
//                 },
//                 "1": {
//                     rating: 5
//                 }
//             }
//         }
//     }
// }
// Total number of data source requests: 1
 */

/**
 * Returns a copy of the {@link Model} that never attempts to batch concurrent requests of the same type. If two concurrent requests for different paths are made to an unbatched {@link Model}, two seperate requests will be made to the {@link Model}'s {@link DataSource} if they cannot be served from the local cache. This mode is the default.
 * @name unbatch
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that batches requests of the same type and sends them to the data source together.
  @example
 // In this example we will demonstrate that multiple calls made to a batched JSONGraph model in a single tick will only result in a single request to the {@link DataSource} responsible for retrieving data from the server.

 // create a variable to track the number of requests sent to our mock {@link DataSource}.
 var requestCount = 0;

 // create an object that mocks a {@link DataSource}, an object typically used to retrieve
 // information from the network.
 // Even though multiple calls to {@link Model.prototype.get} will be made on the 
 // batched {@link Model}, we expect that only one request will be sent to the
 // server.
 var mockDataSource = {
    // expecting two calls:
    // 1. ["titlesById", [99, 23, 44], "name"]
    // 2. ["titlesById", [99, 23, 44], "rating"]
    get: function(path) {
        requestCount++;

        // if path is ["titlesById", [99, 23, 44], "name"]
        if (path[2] === "name") {
            // return an Observable stream of the {@link JSONGraphEnvelope} that the server would send
            return falcor.Observable.of({
                paths: [["titlesById", [23,44, 99], "name"]],
                jsong: {
                    "titlesById": {
                        "99": {
                            "name": "House of Cards"
                        },
                        "23": {
                            "name": "Orange is the New Black"
                        },
                        "44": {
                            "name": "Arrested Development"
                        }
                    }
                }
            })
        }
        // if path is ["titlesById", [99, 23, 44], "rating"]
        else {
            // return an Observable stream of the {@link JSONGraphEnvelope} that the server would send
            return falcor.Observable.of({
                paths: [["titlesById", [23,44, 99], "rating"]],
                jsong: {
                    "titlesById": {
                    "99": {
                        "rating": 5
                    },
                    "23": {
                        "rating": 5
                    },
                    "44": {
                        "rating": 5            
                    }
                }
            })
        }
    }
 };

 // Create a Model that uses the mock {@link DataSource} for data retrieval
 var model = new falcor.Model(mockDataSource);

// Loading a fragment of the JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        }
    });

// Create a batched {@link Model} that accumulates get and set 
// requests into batches and sends them at the end of the current tick.
var batchedJsongModel = model.batch();

// Immediately unbatch the batched {@link Model}. Every attempt
// to get or set paths on this {@link Model} should trigger a 
// new {@link DataSource} request. In other words this {@link Model} should
// behave the same way as the originally-created model.
var unbatchedJsongModel = batchedJsongModel.unbatch();

// creating an Observable stream of a JSON object that contains the names of the first two titles in the first genre list
var names = unbatchedJsongModel.get(["genreLists", 0, {to:1}, ["name"]]);

// creating an Observable stream of a JSON object that contains the ratings of the first two titles in the first genre list
var ratings = unbatchedJsongModel.get(["genreLists", 0, {to:1}, ["rating"]]);

// retrieving the JSON object with the ratings from the stream
names.subscribe(function(jsonEnvelope) {
    console.log("Names arrived:")
    console.log(JSON.stringify(jsonEnvelope));
    console.log("Total number of data source requests:", requestCount);
})

// retrieving the JSON object with the ratings from the stream
ratings.subscribe(function(jsonEnvelope) {
    console.log("Ratings arrived:")
    console.log(JSON.stringify(jsonEnvelope));
    console.log("Total number of data source requests:", requestCount);
})

// Each the requests for names and ratings should result in a call to the
// {@link DataSource}.
// The code above prints the following to the console:
// Names arrived:
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     name: "Orange is the New Black"
//                 },
//                 "1": {
//                     name: "House of Cards"
//                 }
//             }
//         }
//     }
// }
// Total number of data source requests: 1
// Ratings arrived:
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     rating: 5
//                 },
//                 "1": {
//                     rating: 5
//                 }
//             }
//         }
//     }
// }
// Total number of data source requests: 2
 */

/**
 * Returns a copy of the {@link Model} does not allow synchronous access to the cache outside of a selector function. In safe mode, {@link Model.prototype.getValueSync}, {@link Model.prototype.setValueSync}, and {@link Model.prototype.bind} is only allowed within the selector functions passed to Model methods. Selector functions are guaranteed to execute once the requested data has been downloaded into the cache, and therefore allowing synchronous access to the Model's cache is safe. Outside of a selector function, synchronous access to the cache is inherently unsafe as there is no way of knowing whether data is undefined or simply not present in the cache at the moment. In safe mode (the default) an attempt to synchronously acces cache data outside of a selector method will throw.
 * @name safeMode
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that throws if an attempt is made to synchronously access the cache outside of a selector function.
 */

/**
* Returns a copy of the {@link Model} that allows synchronous access to the cache outside of a selector function. In safe mode, {@link Model.prototype.getValueSync}, {@link Model.prototype.setValueSync}, and {@link Model.prototype.bind} is only allowed within the selector functions passed to Model methods. Selector functions are guaranteed to execute once the requested data has been downloaded into the cache, and therefore allowing synchronous access to the Model's cache is safe. Outside of a selector function, synchronous access to the cache is inherently unsafe as there is no way of knowing whether data is undefined or simply not present in the cache at the moment. In unsafe mode an attempt to synchronously acces cache data outside of a selector method will not throw. This API is inherently unsafe and should only be used if you know what you're doing.
 * @name unsafeMode
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that does not throw if an attempt is made to synchronously access the cache outside of a selector function.
 */

/**
 * Returns a copy of the {@link Model} that unboxes {@link Atom} values before returning them. By default {@link Model}s unbox values before returning them. 
 * @name unboxValues
 * @memberof Model.prototype
 * @see Atom
 * @function
 * @return {Model} a {@link Model} that the values inside of {@link Atom}s rather than the atom instances themselves.
 */

/**
 * Returns a copy of the {@link Model} that does not unbox Atom values values before returning them. Returning {@link Atom}s, {@link Reference}s, or {@link Error}s rather than their values allows any metadata attached to the value to be inspected.
 * @name boxValues
 * @memberof Model.prototype
 * @see Atom
 * @function
 * @return {Model} a {@link Model} that returns atom values rather than the value inside them. 
 * @example
var model = new falcor.Model();
model.setCache({
    user: {
        name: {
            // Metadata that indicates this object is a Atom
            $type: "atom",
            // The value property contains the value box by the Atom
            value: "Jim Parsons",
            // Metadata that dictates that this value should be purged from the {@link Model}'s cache after two minutes. Negative numbers imply that expiration occurs relative to the current time.
            $expires: -(1000 * 60 * 2)
        }
    }
});

model.boxValues().getValue(["user", "name"]).subscribe(function(value) {
    console.log(value.$type, value.value, value.$expires);
})

// The code above outputs the following text to the console:
// atom Jim Parsons -120000
// Note that the Atom object was returned rather than just the value "Jim Parsons."
 */

/**
 * Synchronously retrieves a single value from the local cache. This method can only be invoked within a selector function passed to get, getProgressively, or call. For more information on the correct usage of this method see {@link Model.prototype.get}.
 * The getValueSync method differs from the asynchronous get methods (ex. get, getValues) in that it can be used to retrieve objects in addition to JSONGraph values.
 * @name getValueSync
 * @memberof Model.prototype
 * @function
 * @arg {Path} path the path(s) to retrieve synchronously from the local cache.
 * @return {Object} the value found at the path.
 */

/**
 * Set the {@link Model}'s local cache to a JSONGraph value. This method can be a useful way of mocking a remote document, or restoring state previously saved to local storage.
 * @name setCache
 * @memberof Model.prototype
 * @function
 * @arg {JSONGraph} jsonGraph a JSONGraph object to use as the local cache.
 * @example
// In this example we will retrieve data from the model and converted it into an HTML representation.
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model(new XMLHttpDataSource('http://netflix.com/model.jsonGraph'));

// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Converts a integer into a string of stars
function getStars(num) {
    var stars = "",
        counter;

    if (num !== undefined) {
        for(counter = 0; counter < num; counter++) {
            stars += "*";
        }
    }

    return stars;
}

// Note that in the example below we ask for the first three titles in the first genre list. This will 
// result in a request to the server for ["genreLists", 0, 2, ["name","rating"]] because the third title 
// is not in the cache. When all of the data has been retrieved, the selector function is invoked and the data in the cache is converted into HTML.
var nameAndRatings = model.get(
    ["genreLists", 0, {to:2}, ["name","rating"]], ["genreLists", 0, "name"],
    // When this function is invoked all of the data should be available in the cache, except for those paths that caused an error to occur
    function() {
        var firstGenreList = this.bindSync(["genreLists",0]);
        return "&lt;h1&gt;" + firstGenreList.getValueSync(["name"]) + "&lt;/h1&gt;\n" +
            "&lt;ul&gt;\n" + 
            [0,1,2].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "&lt;li&gt;" + nameAndRating.getValueSync(["name"]) + " " + getStars(nameAndRating.getValueSync(["rating"])) + "&lt;/li&gt;\n";
                }) + 
            "&lt;/ul&gt;";
    });

nameAndRatings.forEach(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black *****&lt;/li&gt;
// &lt;li&gt;House of Cards *****&lt;/li&gt;
// &lt;li&gt;Hemlock Grove *****&lt;/li&gt;
// &lt;/ul&gt;
*/


/**
 * Synchronously sets a single value from the local cache. This method can only be invoked within a selector function, such as the one passed to {@link Model.prototype.get}, {@link Model.prototype.getProgressively}, {@link Model.prototype.get}, or {@link Model.prototype.getValues}. For more information on the correct usage of this method see {@link Model.prototype.get}.
 * @name setValueSync
 * @memberof Model.prototype
 * @function
 * @arg {Path} path the path(s) to retrieve synchronously from the local cache.
 * @return {...Path} the value found at the path.
 */

/**
 * This method creates a new {@link Model} that refers to the object found at a particular path. Binding is useful if multiple operations are going to be performed on the object found at one particular location in the JSONGraph Model. Once a Model is bound to a particular path in the JSON Graph, any paths evaluated on the Model will be relative to the bound path.

The bind method is metaphorically similar to assigning a variable to an object within a JSON object. Bind allows you to pass around references to models within the JSON Graph without exposing the entire graph to application components. Binding Models also allows you to hide the location of a model within a JSON Graph from components that are coupled to the model.

 The bound path must be fully optimized before the bound {@link Model} is created. This ensures that once a {@link Model} is bound, its bound path never changes. In order for a bound path to be optimized it must be evaluated. That's why it is necessary to provide at least one additional path to at least one value found under the bound path. These relativePathsToPreload will be loaded into the cache before the optimized JSONModel is asynchronously pushed through the Observable stream.
 * @name bind
 * @memberof Model.prototype
 * @function
 * @arg {Path} boundPath the path referred to by the resulting Model. Typically the boundPath refers to another Path found in the JSONGraph model. If the boundPath does not evaluate to a JSONGraph Path but rather a branch node in the JSON Graph, at least one relative path to preload must be specified. Specifying a path to preload is necessary in these circumstances because the bound path must be evaluated to ensure it is fully optimized, but it is only possible to evaluate JSONGraph Paths that refer to a value. By preloading and evaluating a path along the bound path, it is possible to evaluate and fully optimize the bound path prefix.
 * @arg {...PathSet} relativePathsToPreload paths to values to preload before Model is created. These paths are relative to the bound path. If the boundPath does not refer to a path or a JSONGraph value, at least one path to a value must be preloaded. This is necessary because the a boundPath cannot be evaluated unless it refers to a JSONGraph value.
 * @return {Observable.<Model>} an Observable stream containing a single bound {@link Model} that arrives once the bound path and all of the relativePathsToPreload have been evaluated. The Observable stream will be empty if nothing is found at the bound path.
 * @example
// In this example we will demonstrate how bind can be used to create a Model that evaluates paths relative to a bound path
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// retrieve a Model bound the first title in the first genre list
// note that the ["name"] path is required because at least one value
// must be preloaded under the bound path.
model.
    bind(["genreLists", 0, 0], ["name"]).

    // retrieve the bound Model from the stream. When the Model arrives
    // it will be bound to the fully optimized path { $type: "ref", value: ["titlesById", 23] } rather than the 
    // requested path ["genreLists", 0, 0].
    subscribe(function(titleModel) {
        
        // set the rating of the first title in the first genre list
        // Note that the path ["rating"] is relative to the bound
        // path { $type: "ref", value: ["titlesById", 23] }.
        titleModel.
            set({path: ["rating"], value: 4.5}).
            // receive output as a stream of {@link PathValue}s.
            toPathValues().
            // print all {@link PathValue}s to the console.
            subscribe(function(pathValue) {
                console.log(JSON.stringify(pathValue))
            });
    });

// The code above prints the following to the console. Note that the path
// in the {@link PathValue} is also relative to the titleModel's bound path.
// {path:["rating"],value:4.5}
*/

/**
 * This method creates a new {@link Model} that refers to the object found at a particular path. Binding is useful if multiple operations are going to be performed on the object found at one particular location in the JSONGraph Model. Once a Model is bound to a particular path in the JSON Graph, any paths evaluated on the Model will be relative to the bound path.

The bindSync method is metaphorically similar to assigning a variable to an object within a JSON object. This method can only be invoked within a selector function, such as the one passed to {@link Model.prototype.get}, {@link Model.prototype.get}, {@link Model.prototype.getProgressively}, or {@link Model.prototype.getValues}. For more information on the when this method can be called, see {@link Model.prototype.get}.
 * @name bindSync
 * @memberof Model.prototype
 * @function
 * @arg {Path} path the path to the object that the new Model should proxy.
 * @example
// In this example we will retrieve data from the model and converted it into an HTML representation.
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model(new XMLHttpDataSource('http://netflix.com/model.jsonGraph'));

// Loading a JSONGraph object into the model's cache. This JSONGraph object models a list of genres, each of which contains several titles.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "1": $ref('genresById[522]'),
            "length": 2
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Comedy",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[44]'),
                "length": 2           
            }
        },
        // map of all titles by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            },
            "44": {
                "name": "Arrested Development",
                "rating": 5            
            }
        }
    });

// Converts a integer into a string of stars
function getStars(num) {
    var stars = "",
        counter;

    if (num !== undefined) {
        for(counter = 0; counter < num; counter++) {
            stars += "*";
        }
    }

    return stars;
}

// Note that in the example below we ask for the first three titles in the first genre list. This will 
// result in a request to the server for ["genreLists", 0, 2, ["name","rating"]] because the third title 
// is not in the cache. When all of the data has been retrieved, the selector function is invoked and the data in the cache is converted into HTML.
var nameAndRatings = model.get(
    ["genreLists", 0, {to:2}, ["name","rating"]], ["genreLists", 0, "name"],
    // When this function is invoked all of the data should be available in the cache, except for those paths that caused an error to occur
    function() {
        // Create a new Model bound to a specific location in the JSON Graph.
        // Note that the bound path will be the optimized path { $type: "ref", value: ["genresById", 123] } rather
        // than the requested path ["genreLists", 0].
        var firstGenreList = this.bindSync(["genreLists",0]);

        return "&lt;h1&gt;" + firstGenreList.getValueSync(["name"]) + "&lt;/h1&gt;\n" +
            "&lt;ul&gt;\n" + 
            [0,1,2].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "&lt;li&gt;" + nameAndRating.getValueSync(["name"]) + " " + getStars(nameAndRating.getValueSync(["rating"])) + "&lt;/li&gt;\n";
                }) + 
            "&lt;/ul&gt;";
    });

nameAndRatings.forEach(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// &lt;h1&gt;Drama&lt;/h1&gt;
// &lt;ul&gt;
// &lt;li&gt;Orange is the New Black *****&lt;/li&gt;
// &lt;li&gt;House of Cards *****&lt;/li&gt;
// &lt;li&gt;Hemlock Grove *****&lt;/li&gt;
// &lt;/ul&gt;
*/

/**
 * Invokes a Function in the JSONGraph model and returns the result as a JSON object. JSONGraph models can contain Function objects, just like JavaScript objects. Function objects cannot be retrieved from a model. However Functions can be invoked using the {@link Model.prototype.callValues} or {@link Model.prototype.call} or {@link Model.prototype.call}. 
 * The call method executes one or more functions and makes the results available in the local cache. The call function is a memory-efficient alternative to the {@link Model.prototype.call} function, because call does not convert the requested data from JSONGraph to JSON. Instead the call function attempts to ensure that the function's results are locally available in the cache when it invokes a selector function. Within the selector function, data is synchronously retrieved from the local cache and translated into another form - usually a view object. Within the selector function you can use helper methods like {@link Model.prototype.getValueSync}, {@link Model.prototype.setValueSync}, {@link Model.prototype.bindSync} to synchronously retrieve data from the cache. These methods are only valid within a selector function, and will throw if executed anywhere else.
 * @name call
 * @memberof Model.prototype
 * @function
 * @arg {Path} functionPath the path to the function to invoke
 * @arg {Array.<Object>} args the arguments to pass to the function
 * @arg {Array.<PathSet>} pathSuffixes paths to retrieve from objects returned from the Function
 * @arg {Array.<PathSet>} paths paths to retrieve after successful Function execution
 * @arg {Function} selector the selector function that retrieves the loaded data from the cache and converts it into the object that appears in the stream
 * @return {ModelResponse.<Object>} an {@link Observable} stream that contains the results of the function converted to JSON.
 * @example
 var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of friends, modeled as a map with ordinal keys
        "friendsList": {
            "0": $ref('friendsById[123]'),
            add: function(path) {
                var self = this;
                return Observable.create(function forEach(observer) {
                    var index = self.length;
                    self[index] = path;
                    self.length++;

                    // function returns information that old length is now index of new path
                    // path suffixes passed to call will be appended to the value path and 
                    // evaluated.
                    observer.onNext({path: [index], value: path});
                    observer.onCompleted();
                }); 
            }
            "length": 1
        },
        // map of all friends, organized by ID
        "friendsById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Dan"
            },
            // genre list modeled as map with ordinal keys
            "522": {
                "name": "Jim"       
            },
            "929": {
                "name": "Terry"
            }
        }
    });

var value = 
    model.
        call(
            // path to function
            ["friendsList", "add"], 
            // arguments to pass to the function
            [
                ["friendsById", 929]
            ],
            // path suffixes to retrieve from function's return value.
            // The function in the document will return 
            // {path:["friendsList", 0], value: ["friendsById", 929]}
            // and the ["name"] suffix will be added to value, producing 
            // ["friendsById",929,"name"]
            [["name"]],
            // paths to retrieve after successful execution of function
            [["friendsList", "length"]],
            // the selector function is invoked with an array of the values in the results  returned from the functions. This array contains one result: ["friendsById", 123].
            function(results) {
                // bind a model to the location in the JSONGraph object returned by the function
                var addedFriend = this.bindSync(results[0]);

                // retrieve the name of the newly added friend.
                return { name: addedFriend.getValueSync(["name"]) };
            });

value.subscribe(function(value) { 
    console.log(JSON.stringify(value)); 
});

// The code above outputs the following string to the console.
// {"name":"Jim"}
 */

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @name set
 * @memberof Model.prototype
 * @function
 * @arg {...PathValue} pathValue a location in the document and the value to set at that location.
 * @return {ModelResponse.<JSON>} an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted.
 * @example
//  Example: set values in various locations in the JSONGraph model

// Create a path evaluator
var model = new falcor.Model();

// Loading a JSONGraph object into the model's cache.
model.setCache(
    {
        // list of user's genres, modeled as a map with ordinal keys
        "genreLists": {
            "0": $ref('genresById[123]'),
            "length": 1
        },
        // map of all genres, organized by ID
        "genresById": {
            // genre list modeled as map with ordinal keys
            "123": {
                "name": "Drama",
                "0": $ref('titlesById[23]'),
                "1": $ref('titlesById[99]'),
                "length": 2
            }
        },
        // map of all titles, organized by ID
        "titlesById": {
           "99": {
                "name": "House of Cards",
                "rating": 5
            },
            "23": {
                "name": "Orange is the New Black",
                "rating": 5
            }
        }
    });

// Create an {@link Observable} stream of {@link PathValue}s containing the values in the JSONGraph model after the set was attempted. Note that the code below does not immediately trigger the set operation, because {@link Observable}s are lazily-evaluated.  The set operation will be delayed until the next line of code, in which we attempt to retrieve the values from the {@link Observable} using its {@link Observable.prototype.forEach} method.
var pathValues = 
    model.
        set(
            {
                path: ["genreLists", 0, 0, "rating"],
                value: 5
            }, 
            {
                path: ["genreLists", 0, 1, "rating"],
                value: 4
            }).
        toPathValues();

pathValues.forEach(function(pathValue) { 
    console.log(JSON.stringify(pathValue)); 
});

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["genreLists",0,0,"rating"],"value":5}
// {"path":["genreLists",0,1,"rating"],"value":4}
// Note that the values above were returned out of order. This was possible 
// because each PathValue provides sufficient context (ie the path) to 
// differentiate which value is being sent.
 */

/**
 * @constructor Observable
 * @see {@link https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md}
 */

/**
 * @constructor XMLHttpRequest
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest}
 */

 /**
 * The forEach method triggers the execution of the Observable, causing the values within to be pushed to a callback. An Observable is like a pipe of water that is closed. When forEach is called, we open the valve and the values within are pushed at us.  These values can be received using either callbacks or an {@link Observer} object.
 * @name forEach
 * @memberof Observable.prototype
 * @function
 * @arg {?Observable~onNextCallback} onNext a callback that accepts the next value in the stream of values.
 * @arg {?Observable~onErrorCallback} onError a callback that accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream.
 * @arg {?Observable~onCompletedCallback} onCompleted a callback that is invoked the {@link Observable} stream has ended, and the {@link Observable~onNextCallback} will not receive any more values.
 * @return {Subscription}
 */

 /**
 * This callback accepts values from the stream.
 * @callback Observable~onNextCallback
 * @param {Object} value the next value in the stream of values
 */

/**
 * This callback accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream. When this callback is invoked, the {@link Observable} stream ends and no more values will be received by the {@link Observable~onNextCallback}.
 * @callback Observable~onErrorCallback
 * @param {Error} value the error that occurred while evaluating the operation underlying the {@link Observable}
 */

 /**
 * This callback is invoked when the {@link Observable} stream ends. When this callback is invoked the {@link Observable} stream has ended, and therefore the {@link Observable~onNextCallback} will not receive any more values.
 * @callback Observable~onCompletedCallback
 */

/**
 * @constructor Subscription
 * @see {@link https://github.com/Reactive-Extensions/RxJS/tree/master/doc}
 */

/**
 * @name dispose
 * @memberof Subscription.prototype
 */

/**
 * A Model object is used to execute commands against a {@link JSONGraph} object. {@link Model}s can work with a local JSONGraph object in its cache, or it can work with a remote {@link JSONGraph} objects through a {@link DataSource} object.
 * @constructor
 * @name Model
 * @arg {?DataSource} source An object used to retrieve data from a remote model on the network.
 * @arg {?number} maxSize the maximum size of the cache.
 * @arg {?number} collectRatio the ratio of the maximum size to collect when the maximum size is exceeded.
 */