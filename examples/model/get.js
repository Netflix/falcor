// In this example, we will create a JSONGraph model and populate its cache with a list of genres and titles to mock the server. Then we will request the name and rating of the first two titles in the first genre list. We will then retrieve the resulting JSON object from an observable stream and convert it into an HTML list.
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

var nameAndRatings = 
    model.get('genreLists[0][0..1]["name", "rating"]', 'genreLists[0].name');

// When we then to the Observable stream, we get the following JSON structure containing all of the requested paths:
// {
//    "json": {
//        "genreLists": {
//            "0": {
//                "name": "Drama",
//              "0": {
//                  name: "Orange is the New Black",
//                  rating: 5
//              },
//              "1": {
//                  name: "House of Cards",
//                  rating: 5
//              }
//          }
//      }
//   }
// }

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

nameAndRatings.subscribe(function(value) { 
    // Convert the JSON data into an HTML list...
    var html = "",
        json = value.json;
    if (json.genreLists && json.genreLists[0]){
        var genre = json.genreLists[0];
        html += "<h1>" + genre.name + "</h1>\n" +
        "<ul>\n";
        for(var counter = 0; counter < 2; counter++){
            if (genre[counter]){
                var title = genre[counter];
                html += "<li>" + title.name + ' ' + getStars(title.rating) + "</li>\n";
            }
        } 
        html += "</ul>";
    }
    console.log(html);
});

// The code above outputs the following to the console:
// <h1>Drama</h1>
// <ul>
// <li>Orange is the New Black *****</li>
// <li>House of Cards *****</li>
// </ul>


// In this example, we will perform the same operation as the last example: we will retrieve data from a local JSONGraph model cache and convert it into an HTML list. In the previous example, we converted the JSONGraph in the cache to JSON and then subsequently into HTML. In this example, we will avoid this intermediary JSON transformation by providing a selector function to the get method. Within the selector function, we will access the JSONGraph data in the Model's local cache and transform it directly into HTML.

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

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating an intermediary JSON result.
// Within the selector function we read data directly from the cache, and convert it directly into HTML.
var html = model.get(
    'genreLists[0][0..1]["name", "rating"]', 'genreLists[0].name',
    // When this function is invoked all of the requested paths should be available in the cache, except for those paths that could not be retrieved due to an error.
    function() {
        var firstGenreList = model.bindSync('genreLists[0]');
        return "<h1>" + firstGenreList.getValueSync('name') + "</h1>\n" +
            "<ul>\n" + 
            [0,1].
                // filter out indexes that have not been retrieved from the server yet
                filter(function(index) {
                    // when retrieving values from the local cache, it is possible to retrieve objects as well as values.
                    return firstGenreList.getValueSync([index]) !== undefined;
                }).
                map(function(index) {
                    var nameAndRating = firstGenreList.bindSync([index]);
                    return "<li>" + nameAndRating.getValueSync('name') + " " + getStars(nameAndRating.getValueSync('rating')) + "</li>\n";
                }).join("") + "</ul>";
    });

html.subscribe(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// <h1>Drama</h1>
// <ul>
// <li>Orange is the New Black *****</li>
// <li>House of Cards *****</li>
// </ul>


// In this example, we will perform the same operation as the last example: we will retrieve data from a local JSONGraph model cache and convert it into an HTML list. In the previous example, we passed a selector function to the get method and transformed the JSONGraph data in the cache directly into HTML. This improved performance by removing the need to create an intermediary JSON object, but required us to repeat the path twice: once in the method's argument list, and again in the body of the selector function. In this example, we will achieve a good balance between performance and expressiveness by passing arguments to the selector function. 

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

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating a JSON result.
// We pass arguments to the selector function and they are bound to the values of the requested paths. We then convert the path values directly into HTML.
var html = model.get(
    'genreLists[0][0..1]["name", "rating"]', 'genreLists[0].name',
    // Arguments passed to the selector function will be bound to the values of the paths.
    // The process of binding path values to the arguments of selector functions works like this:
    // If a selector function argument is specified for a {@link PathSet}, all {@link Key}s are removed from the JSON data structure, leaving behind only the keys in the {@link KeySet}s.
    // nameAndRatings is bound to the value of ["genreName", 0, {to:1}, ["name","rating"]], which is:
    // {
    //     "0": {
    //         "name": "Orange is the New Black",
    //         "rating": 5
    //     },
    //     "1": {
    //         "name": "House of Cards",
    //         "rating": 5
    //     }
    // }
    // Notice that the {@link Key}s ["genreLists",0] in the path are not present in the JSON object above, only the {@link KeySet}s [{to:1}, ["name","rating"]]. This optimization decreases allocations and repetitive boiler plate code.
    // genreName is bound to the value of ["genreLists", 0, "name"], which is "Drama".
    function(nameAndRatings, genreName) {
        return "<h1>" + genreName + "</h1>\n" +
            "<ul>\n" + 
            [0,1].
                // filter out indexes that are null or undefined
                filter(function(index) {
                    return nameAndRatings[index] != null;
                }).
                map(function(index) {
                    var nameAndRating = nameAndRatings[index];
                    return "<li>" + nameAndRating["name"] + " " + getStars(nameAndRating["rating"]) + "</li>\n";
                }).join("") + "</ul>";
    });

html.subscribe(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// <h1>Drama</h1>
// <ul>
// <li>Orange is the New Black *****</li>
// <li>House of Cards *****</li>
// </ul>


// In this example, we will perform the same operation as in the last example: we will retrieve data from a local JSONGraph model cache and convert it into an HTML list. In the previous example, we achieved a good balance between performance and expressiveness by binding the value of the requested paths to arguments in the selector function. In the code below, we will again pass arguments to the selector function to show another example of how {@link PathSet} values are bound to arguments. 
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

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating a JSON result.
// Within the selector function we read data directly from the cache, and convert it directly into HTML.
var html = model.get(
    ["genreLists", {to:1}, {to:1}, "name"], ["genreLists", {to:1}, "name"],
    // Arguments passed to the selector function will be bound to the values of the paths.
    // The process of binding path values to the arguments of selector functions works like this:
    // If a {@link PathSet} is bound to a selector function argument, all {@link Key}s are removed from the JSON data structure, leaving behind only the keys in the {@link KeySet}s.
    // names is bound to the value of ["genreLists", {to:1}, {to:1}, "name"], which is:
    // {
    //     "0": {
    //         "0": "Orange is the New Black",
    //         "1": "House of Cards"
    //     },
    //     "1": {
    //         "0": "Orange is the New Black",
    //         "1": "Arrested Development"
    //     }
    // }
    // Notice that of the path ["genreLists",{to:1},{to:1}, "name"] the {@link Key}s ["genreLists"] and ["name"] in the path are not present in the structure, only the {@link KeySet}s [{to:1},{to:1}]. This optimization decreases allocations and repetitive boiler plate code.
    // genreNames is bound to the value of ["genreLists", {to:1}, "name"], which is:
    // {
    //     "0": "Drama",
    //     "1": "Comedy"
    // }
    // Notice once again that the {@link Key}s ("genreLists","name") have been removed from the structure, leaving only the keys in the {@link KeySet} ({to:1}) in the data structure.
    function(names, genreNames) {
        return [0,1].
            // filter out indexes that are null or undefined
            filter(function(index) {
                return genreNames[index] != null;
            }).
            map(function(genreIndex) {
                var genreName = genreNames[genreIndex];
                return "<h1>" + genreName + "</h1>\n" +
                "<ul>\n" + 
                    [0,1].
                        // filter out indexes that are null or undefined
                        filter(function(index) {
                            return names[index] != null;
                        }).
                        map(function(index) {
                            //var name = names[index][genreIndex];
                            var name = names[genreIndex][index];
                            return "<li>" + name + "</li>\n";
                        }).join("") + 
                    "</ul>";
            }).join("");
    });

html.subscribe(function(html) { 
    console.log(html); 
});

// The code above outputs the following HTML fragment to the console.
// <h1>Drama</h1>
// <ul>
// <li>Orange is the New Black</li>
// <li>House of Cards</li>
// </ul>
// <h1>Comedy</h1>
// <ul>
// <li>Orange is the New Black</li>
// <li>Arrested Development</li>
// </ul>


// In this example, we will demonstrate what happens when errors are encountered while evaluating paths. 
var model = new falcor.Model();
// Loading a JSONGraph object into the Model's cache to mock a server model locally.
model.setCache(
    {
        user: {
            name: "Frank Underwood",
            hometown: {$type: 'error', value: 'Could not be retrieved from server.'},
            // A JSONGraph Error is any map that contains a $type key of "error." Errors are JSONGraph Atoms, which are special maps that act like values in that they are always returned whole. Errors are handled differently than normal values by the Models. 
            country: {$type: 'error', value: 'Could not be retrieved from server.'}
        }
    });

// Because we intend to transform the data directly into HTML, we specify a selector function to avoid allocating a JSON result.
// Within the selector function we read data directly from the cache, and convert it directly into HTML.
var userHtml = model.get(
    'user.name', 'user.hometown', 'user.country',
    function(name, hometown, country) {
        return "Name: " + name + ", Hometown: " + hometown + ", Country: " + country;
    });

// Use 
userHtml.subscribe(
    function(html) { 
        console.log(html); 
    },
    function(e) {
        console.error(JSON.stringify(e));
    });

// The code above outputs the following to the console:
// Name: Frank Underwood, Hometown: undefined, Country: undefined
// [{"path":["user","hometown"],"value":"Could not be retrieved from server."},{"path":["user","country"],"value":"Could not be retrieved from server."}] 
