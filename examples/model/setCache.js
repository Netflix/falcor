// In this example we will retrieve data from the model and converted it into an HTML representation.
// Creating a model and passing a data source that connects it to a remote JSONGraph model.
var model = new falcor.Model();
var $ref = falcor.Model.ref;

//TODO: hemlock grove?

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
// is not in the cache. When all of the data has been retrieved, the selector function is invoked and the data in the cache is converted into HTML.
var nameAndRatings = model.get(
    'genreLists[0][0..2]["name", "rating"]', 'genreLists[0].name',
    // When this function is invoked all of the data should be available in the cache, except for those paths that caused an error to occur
    function() {
        var firstGenreList = this.bindSync(["genreLists",0]);
        return "<h1>" + firstGenreList.getValueSync(["name"]) + "</h1>\n" +
            "<ul>\n" + 
            [0,1,2].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "<li>" + nameAndRating.getValueSync(["name"]) + " " + getStars(nameAndRating.getValueSync(["rating"])) + "</li>\n";
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