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
        console.log(JSON.stringify(pathSets));

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
var namesAndRatings = model.get('genreLists[0][0..1]["name","rating"]');

// retrieving the JSON object with the ratings from the stream
namesAndRatings.subscribe(function(jsonEnvelope) {
    console.log("JSON retrieved from Model:")
    console.log(JSON.stringify(jsonEnvelope));

    // output the contents of the {@link Model}'s' local cache to the console.
    var jsonGraph = model.getCache();

    console.log("Contents of {@link Model}'s local cache after get operation:")
    console.log(JSON.stringify(jsonGraph, null, 4));
        
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
