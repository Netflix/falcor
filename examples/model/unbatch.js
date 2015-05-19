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
    // 1. ["titlesById", [99, 23], "name"]
    // 2. ["titlesById", [99, 23], "rating"]
    get: function(pathSets) {
        requestCount++;
        // if path is ["titlesById", [99, 23], "name"]
        if (pathSets[0][2] === "name") {

            // return an Observable stream of the {@link JSONGraphEnvelope} that the server would send
            return falcor.Observable.of({
                paths: [["titlesById", [23, 99], "name"]],
                jsong: {
                    "titlesById": {
                        "99": {
                            "name": "House of Cards"
                        },
                        "23": {
                            "name": "Orange is the New Black"
                        }
                    }
                }
            })
        }
        // if path is ["titlesById", [99, 23], "rating"]
        else {
            // return an Observable stream of the {@link JSONGraphEnvelope} that the server would send
            return falcor.Observable.of({
                paths: [["titlesById", [23, 99], "rating"]],
                jsong: {
                    "titlesById": {
                        "99": {
                            "rating": 5
                        },
                        "23": {
                            "rating": 5
                        }
                    }
                }
            })
        }
    }
 };

// Create a Model that uses the mock {@link DataSource} for data retrieval
var model = new falcor.Model({source: mockDataSource});
var $ref = falcor.Model.ref;

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
var names = unbatchedJsongModel.get('genreLists[0][0..1]["name"]');

// creating an Observable stream of a JSON object that contains the ratings of the first two titles in the first genre list
var ratings = unbatchedJsongModel.get('genreLists[0][0..1]["rating"]');

// retrieving the JSON object with the ratings from the stream
names.subscribe(function(jsonEnvelope) {
    console.log("Names arrived:")
    console.log(JSON.stringify(jsonEnvelope, null, 4));
    console.log("Total number of data source requests:", requestCount);
})

// retrieving the JSON object with the ratings from the stream
ratings.subscribe(function(jsonEnvelope) {
    console.log("Ratings arrived:")
    console.log(JSON.stringify(jsonEnvelope, null, 4));
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
