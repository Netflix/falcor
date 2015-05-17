var model = new falcor.Model();
var $ref = falcor.Model.ref;

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
var values = model.get('genreLists[0..1][0..1]["name", "rating"]');

// The path evaluator expands the path set above to a set of 8 {@link Path} objects.
// In other words the code below produces the same dataset as the code above:
// var values = model.get(
//     ["genreLists", 0, 0, "name"],
//     ["genreLists", 0, 0, "rating"],
//     ["genreLists", 0, 1, "name"],
//     ["genreLists", 0, 1, "rating"],
//     ["genreLists", 1, 0, "name"],
//     ["genreLists", 1, 0, "rating"],
//     ["genreLists", 1, 1, "name"],
//     ["genreLists", 1, 1, "rating"]);

values.then(function(json) {
    console.log(JSON.stringify(json, null, 4));
});

//  The code above prints the following to the console:
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
//             },
//             "1": {
//                 "0": {
//                     "name": "Orange is the New Black",
//                     "rating": 5
//                 },
//                 "1": {
//                     "name": "Arrested Development",
//                     "rating": 5
//                 }
//             }
//         }
//     }
// } 
