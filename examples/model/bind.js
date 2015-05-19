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
