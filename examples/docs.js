/**
 *
* TODO: Some quick way of jumping to the individual methods when you're on a class -- would expect a sub-navigation under the class when you're under it.
* TODO: Consider writing a template for JSDoc generation
 */

/**
 * TODO: Jafar things in here do not exist in Falcor at this moment. Needs discussion
 */

// TODO: Adapt this to eventual progressive API on model.
/**
 * The progressive method retrieves several {@link Path}s or {@link PathSet}s from the JSONGraph object, and makes them
 * available in the local cache. Like the {@link Model.prototype.getProgressively} function, getProgressively invokes a 
 * selector function every time is available, creating a stream of objects where each new object is a more populated version 
 * of the one before. The getProgressively function is a memory-efficient alternative to the getProgressively function, because get does not convert the requested data from JSONGraph to JSON. Instead the getProgressively function attempts to ensure that the requested paths are locally available in the cache when it invokes a selector function. Within the selector function, data is synchronously retrieved from the local cache and translated into another form - usually a view object. Within the selector function you can use helper methods like getValueSync and setValueSync to synchronously retrieve data from the cache. These methods are only valid within the selector function, and will throw if executed anywhere else.
 * @name progressively
 * @memberof ModelResponse.prototype
 * @function
 * @arg {...PathSet} path the path(s) to retrieve
 * @arg {Function} selector the callback that runs once all of the values have been loaded into cache
 * @return {ModelResponse.<JSONEnvelope>} the values found at the requested paths.
 * @example
// In this example we will retrieve data from the model and convert it into an HTML representation.
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model();
var $ref = falcor.Model.ref;

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
var nameAndRatings = model.progressive().get(
    'genreLists[0][0..2]["name", "rating"]', 'genreLists[0].name',
    // When this function is invoked all of the data should be available in the cache, except for those paths that caused an error to occur
    function() {
        var firstGenreList = model.bindSync('genreLists[0]');
        return "<h1>" + firstGenreList.getValueSync('name') + "</h1>\n" +
            "<ul>\n" + 
            [0,1,2].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "<li>" + nameAndRating.getValueSync('name') + " " + getStars(nameAndRating.getValueSync('rating')) + "</li>\n";
                }).join("") + 
            "</ul>";
    });

nameAndRatings.forEach(function(html) { 
    console.log(html); 
});

// The code above outputs the following two HTML fragments to the console.
// <h1>Drama</h1>
// <ul>
// <li>Orange is the New Black *****</li>
// <li>House of cards *****</li>
// </ul>
// <h1>Drama</h1>
// <ul>
// <li>Orange is the New Black *****</li>
// <li>House of Cards *****</li>
// <li>Hemlock Grove *****</li>
// </ul>
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
var $ref = falcor.Model.ref;

var mockServerModel = new falcor.Model({
    cache: { 
        genresById: {
            "123": {
                "2": $ref('titlesById[78]')
            }
        },
        titlesById: {
            "78": {
                "name": "Daredevil",
                "rating": 5
            }
        }
    }
})

var model = new falcor.Model({source: mockServerModel.asDataSource() });

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
var nameAndRatings = model.get(
    'genreLists[0][0..2].["name", "rating"]').
    progressively();

nameAndRatings.forEach(function(data) { 
    console.log(JSON.stringify(data, null, 4)); 
});


// The code above outputs the following two trees to the console. 
// {
//     "json": {
//         "genreLists": {
//             "0": {
//                 "0": {
//                     "name": "Orange is the New Black",
//                     "rating": 5
//                 },
//                 "1": {
//                     "name": "House of Cards",
//                     "rating": 5
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
//                     "name": "Orange is the New Black",
//                     "rating": 5
//                 },
//                 "1": {
//                     "name": "House of Cards",
//                     "rating": 5
//                 },
//                 "2": {
//                     "name": "Daredevil",
//                     "rating": 5
//                 }
//             }
//         }
//     }
// } 

// Note that the first time the tree is output to the console it contains only the data in the cache. The second time it contains the new data that has arrived from the remote model on the server.
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

