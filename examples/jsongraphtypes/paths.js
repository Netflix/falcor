var $ref = falcor.Model.ref;
var model = new falcor.Model({
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
// TODO: Aren't these examples invalid because they require falcor-path-syntax library?
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
