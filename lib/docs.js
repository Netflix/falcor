/**
 * Attendees: @trxcllnt, @sdesai, @jhusain, @steveorsomethin, @ktrott

* Move docs into the actual code.
* Some quick way of jumping to the individual methods when you're on a class -- would expect a sub-navigation under the class when you're under it.
* Consider writing a template for JSDoc generation
* Move long examples out into separate examples folder: falcor/examples/model/get for example
* Mixed quotes
* Don't make scroll in examples
* Change remote model object to JSONGraph object
*/

/**
 * A HttpDataSource object is a {@link DataSource} can be used to retrieve data from a remote JSONGraph object using the browser's XMLHttpRequest. 
 * @constructor HttpDataSource
 * @augments DataSource
 * @param jsonGraphUrl the URL of the JSONGraph model.
 * @example
var model = new falcor.Model({source: new falcor.HttpDataSource("http://netflix.com/user.json")});
var movieNames = model.get('genreLists[0...10][0...10].name').toPathValues();
 */

/**
 * The bind method is metaphorically similar to binding a variable to an object within a JSON object.  Bind allows you to pass around references to objects within the JSONGraph without exposing the entire graph to application components. Binding Models also allows you to hide the location of a model within a JSON Graph from the components that are coupled to the model.

 The bind method creates a new {@link Model} that refers to the JSONGraph value found at a particular path. Binding is useful if multiple operations are going to be performed on the object found at one particular location in the JSONGraph Model. Once a Model is bound to a particular path in the JSON Graph, any paths evaluated on the Model will be relative to the bound path.

 The bind method accepts a path and returns an observable stream containing a single {@link Model} bound to that path.  If no object is found at the path, the observable stream will be empty.
 A bound {@link Model} begins evaluating paths at its bound path.  For example, if a {@link Model} is bound to 'genreLists[0]' and the path 'name' is requested from the Model, the path 'genreLists[0].name' is requested from the DataSource.
 When a {@link Model} is bound, one or more JSONGraph references may be encountered along the bound path.  When a JSONGraph reference is encountered while evaluating the bound path, the bound path prefix is replaced with the target of the reference.
 In other words, if a Model is bound to 'genreLists[0]' and the reference "listsById[49]" is discovered at the bound path, the bound path of the Model will be 'listsById[49]'.  A subsequent attempt to retrieve 'name' from the bound Model would send the path 'listsById[49].name' to the DataSource.
 It is necessary to provide the bind method with at least one additional path to a value beyond the bound path.  The reason for this is that while bind allows you to bind to a JSONGraph object, it is not possible to retrieve JSONGraph objects from a Model {@link DataSource}.
 Therefore in order to determine whether a JSONGraph object exists at the bound path, the model needs to be able to retrieve a value nested within the bound JSONGraph object from the DataSource.  All of the values specified beyond the bound path are guaranteed to be loaded into the model cache before the bound model is created.
 * @name bind
 * @memberof Model.prototype
 * @function
 * @arg {Path} boundPath the path to the value to which the model should be bound.
 * @arg {...PathSet} relativePathsToPreload paths to values to preload before Model is created. These paths are relative to the bound path.
 * @return {Observable.<Model>} an Observable stream containing either the bound model, or nothing if no object was found at the bound path.
 * @example
// In this example we will demonstrate how bind can be used to create a Model that evaluates paths relative to a bound path
var model = new falcor.Model();
var $ref = falcor.Model.ref;

//TODO: output printed twice?

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

// Retrieve a Model bound the first title in the first genre list
// note that the "name" path is required because at least one value
// must be preloaded under the bound path.
model.
    bind("genreLists[0][0]", "name").
    // retrieve the bound Model from the stream. When the Model arrives
    // it will be bound to the fully optimized path "titlesById[23]" rather than the 
    // requested path "genreLists[0][0]".
    subscribe(function(titleModel) {
        
        // set the rating of the first title in the first genre list
        // Note that the path "rating" is relative to the bound
        // path $ref("titlesById[23]").
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
 * This method creates a new {@link Model} that refers to the object found at a particular path. Binding is useful if 
 * multiple operations are going to be performed on the object found at one particular location in the JSONGraph Model. 
 * Once a Model is bound to a particular path in the JSON Graph, any paths evaluated on the Model will be relative to the 
 * bound path.

 * The bindSync method is metaphorically similar to assigning a variable to an object within a JSON object. This method can 
 * only be invoked within a selector function, such as the one passed to {@link Model.prototype.get}.
 * @name bindSync
 * @memberof Model.prototype
 * @function
 * @arg {Path} path the path to the object that the new Model should proxy.
 * @example
// In this example we will retrieve data from the model and converted it into an HTML representation.
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model();
var $ref = falcor.Model.ref;

//TODO: Hemlock Grove?

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
// result in a request to the server for "genreLists[0][2]["name","rating"]" because the third title 
// is not in the cache. When all of the data has been retrieved, the selector function is invoked and the data in the cache is converted into HTML.
var nameAndRatings = model.get(
    'genreLists[0][0..2]["name", "rating"]', 'genreLists[0].name',
    // When this function is invoked all of the data should be available in the cache, except for those paths that caused an error to occur
    function() {
        // Create a new Model bound to a specific location in the JSON Graph.
        // Note that the bound path will be the optimized path "genresById[123]" rather
        // than the requested path "genreLists[0]".
        var firstGenreList = this.bindSync("genreLists[0]");

        return "<h1>" + firstGenreList.getValueSync("name") + "</h1>\n" +
            "<ul>\n" + 
            [0,1,2].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "<li>" + nameAndRating.getValueSync("name") + " " + getStars(nameAndRating.getValueSync("rating")) + "</li>\n";
                }).join("") + 
            "</ul>";
    });

nameAndRatings.forEach(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// <h1>Drama</h1>
// <ul>
// <li>Orange is the New Black *****</li>
// <li>House of Cards *****</li>
// <li>Hemlock Grove *****</li>
// </ul>
*/

/**
 * Invokes a Function in the JSONGraph model and returns the result in a {@link ModelResponse}.
 * @name call
 * @memberof Model.prototype
 * @function
 * @arg {Path} functionPath the path to the function to invoke
 * @arg {Array.<Object>} args the arguments to pass to the function
 * @arg {Array.<PathSet>} pathSuffixes paths to retrieve from objects returned from the Function
 * @arg {...PathSet} calleePaths paths to retrieve from function callee after successful Function execution
 * @arg {Function} selector the selector function that retrieves the loaded data from the cache and converts it into the object that appears in the stream
 * @return {ModelResponse.<Object>|Observable} either a ModelResponse containing the results of the call operation, or an Observable stream containing the results of the selector function if a selector function is provided.
 * @example
var model = new falcor.Model({source: new falcor.HttpDataSource("/model.json")});
var $ref = falcor.Model.ref;
// In this example we add invoke the add function on a "persons" array in the JSON Graph
// exposed by the {@link HttpDataSource}. Then we retrieve the several properties from the 
// newly-created person as well as the new length of the list.
model.call(
 // the path to the function which adds a person object to the persons list.
 "persons.add", 
 // The arguments to the function.
 ["Jim", "Parsons"], 
 // This function creates a person in the "personsById" map and adds a reference to that
 // person to the next available index in the "persons" list. This function call internally
 // generates a {@link JSONGraphEnvelope} response which contains the reference at the new 
 // index in the list. The response also indicates that length property of the "persons"
 // list has been invalidated. This will cause any {@link Model} connected to this 
 // {@link DataSource} to purge ["persons", "length"] from its cache as soon as it receives
 // the response.
 // {
 //   paths: [["persons", 7]],
 //   jsong: {
 //    persons: {
 //     7: { $type: "ref", value: ["personsById", 22] }
 //    }
 //   },
 //   invalidated: [["persons", "length"]]
 // }
 // Once the JSON Graph function has completed successfully, the call method 
 // continues by evaluating a get operation on the path created by appending 
 // each path suffix onto each path in the {@link JSONGraphEnvelope}'s paths
 // array.
 // In this instance, there is only one path suffix containing three keys...
 ["name","surname", "createdAt"],
 // ... therefore the call method evaluates a get operation 
 // on 'persons[7]["name", "surname", "createdAt"]' and adds the 
 // results to the {@link JSONGraphEnvelope}. This yields the following
 // result:
 // {
 //   paths: [["persons", 7, ["name","age", "createdAt"]]],
 //   jsong: {
 //    persons: {
 //     7: { $type: "ref", value: ["personsById", 22] }
 //    },
 //    personsById: {
 //     22: { name: "Jim", surname: "Parsons", createdAt: 2348723423 }
 //    }
 //   },
 //   invalidated: [["persons", "length"]]
 // } 
 // At this point the function appends the calleePaths to the path 
 // to the function callee object. The path to the function callee object is 
 // callPath.splice(0, callPath.length - 1).
 // In this instance there is only one path specified...
 "length").
 // ...which means that the call function evaluates a get operation for
 // the path ["persons", "length"]. The results of this get operation are 
 // added to the {@link JSONGraphEnvelope}, producing the following
 // result:
 // {
 //   paths: [["persons", 7, ["name","age", "createdAt"]], ["persons", 7, "length"]],
 //   jsong: {
 //    persons: {
 //     7: { $type: "ref", value: ["personsById", 22] },
 //     "length": 8
 //    },
 //    personsById: {
 //     22: { name: "Jim", surname: "Parsons", createdAt: 2348723423 }
 //    }
 //   },
 //   invalidated: [["persons", "length"]]
 // }  
  subscribe(function(json) {
   console.log(JSON.stringify(jsonGraph, null, 4));
  });
 // The code above prints the following {@link JSONEnvelope} to the console:
 // {
 //   json: {
 //     persons: {
 //       "7": {
 //         "name": "Jim",
 //         "surname": "Parsons",
 //         "createdAt": 2348723423
 //       }
 //       "length": 8
 //    }
 //  }
 */

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @name set
 * @memberof Model.prototype
 * @function
 * @arg {...(PathValue | JSONGraphEnvelope | JSONEnvelope)} value A value or collection of values to set into the Model.
 * @return {ModelResponse.<JSON> | Observable} an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted.
 * @example
//  Example: set values in various locations in the JSONGraph model

//TODO: verify?

// Create a path evaluator
var model = new falcor.Model();
var $ref = falcor.Model.ref;

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
 * @constructor HttpDataSource
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HttpDataSource}
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
 * This callback accepts a value that was emitted while evaluating the operation underlying the {@link Observable} stream.
 * @callback Observable~onNextCallback
 * @param {Object} value the value that was emitted while evaluating the operation underlying the {@link Observable}
 */

/**
 * This callback accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream. When this callback is invoked, the {@link Observable} stream ends and no more values will be received by the {@link Observable~onNextCallback}.
 * @callback Observable~onErrorCallback
 * @param {Error} error the error that occurred while evaluating the operation underlying the {@link Observable}
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
 * The {@link Model}'s error selector is applied to any errors that occur during Model operations.  The return value of the error selector is substituted for the input error, giving clients the opportunity to translate error objects before they are returned from the {@link Model}.
 * @callback Model~errorSelector
 * @param {Object} requestedPath the requested path at which the error was found.
 * @error {Error} error the error that occured during the {@link Model} operation.
 * @returns {Error} the translated error object.
 */

/**
 * TODO: collectRatio needs better clearer docs
 * TODO: Rename cache to data
 * A set of options used to customize the behaviour of the {@link Model}.
 * @typedef {Object} ModelOptions
 * @property {?DataSource} source - the DataSource the Model uses to access the JSONGraph object.
 * @property {?JSONGraph} cache - the initial state of the Model cache.
 * @property {?number} maxSize - the maximum size of the cache.
 * @property {?number} collectRatio the ratio of the maximum size to collect when the maximum size is exceeded.
 * @property {?Model~errorSelector} errorSelector A function used to translate errors that occur during {@link Model} operations before they are returned from the {@link Model}.
 */

/**
 * TODO: Add a matrix for modes and combinations
 * TODO: Model constructor needs to document about the cache.
 * TODO: Document that Models are immutable
 * A Model object is used to execute commands against a {@link JSONGraph} object. {@link Model}s can work with a local JSONGraph cache, or it can work with a remote {@link JSONGraph} object through a {@link DataSource}.
 * @constructor
 * @name Model
 * @arg {?ModelOptions} options A set of options used to customize the behaviour of the {@link Model}.
 */
