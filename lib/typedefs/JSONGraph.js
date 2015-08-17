/**
 * JavaScript Object Notation Graph (JSONGraph) is a notation for expressing graphs in JSON. For more information, see the [JSONGraph Guide]{@link http://netflix.github.io/falcor/documentation/jsongraph.html}.
 * @typedef {Object} JSONGraph
 * @example
 var $ref = falcor.ref;
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
*/
