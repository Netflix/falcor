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
var response = model.get('genreLists[0][0]["name", "rating"]');

response.toJSON().forEach(function(jsonEnvelope) { 
    console.log(JSON.stringify(jsonEnvelope, null, 4)); 
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
