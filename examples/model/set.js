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
