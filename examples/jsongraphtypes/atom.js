//  In addition to being treated as values by Models, the values within Atoms are automatically "unboxed" when retrieved from a Model. This means that if a Model encounters an Atom while evaluating a path, the Model returns the Atom's value instead of the entire Atom object.

var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                rating: {
                    $type: "atom", 
                    value: 5
                }
            }
        }
    }
});

// The following code prints 5 to the console instead of {$type: "atom", value: 5}, because the value of the Atom is unboxed before being returned by the Model.
model.
    getValue('titlesById[99].rating').
    then(function(rating) { console.log(rating); });


// JSON Objects and Arrays boxed in Atoms are treated as atomic values by the Model, just like strings, numbers, and booleans. Boxing JSON objects in Atoms allows you to ensure that a JSON Object or Array will always be returned from the Model (and by extension the server) in their entirety. 

// In the example below the array of a Netflix title's supported languages are boxed in an Atom, ensuring that they are always returned whole from the Model.
var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                supportedLanguages: {
                    $type: "atom", 
                    value: ["en", "fr"]
                }
            }
        }
    }
});

// Note the attempt to retrieve the first item in the title's supported languages array.
model.
    get('titlesById[99].supportedLanguages[0]').
    then(function(json) { console.log(JSON.stringify(json, null, 4)); });

// If the code above is run the following will be printed to the console:
// {
//     json: {
//         titlesById: {
//            99: {
//                 supportedLanguages: ["en", "fr"]
//            }
//         }
//     }
// }

// Note that entire supported language array was retrieved rather
// than the first item in the array, because the Model treats the 
// values of an atom as atomic.


// In addition to being used to force Model's to treat JSON objects and Array as atomic values, Atoms can be used to associate metadata with a value. As Atoms are maps, they can include metadata keys that can be used by Falcor Models or Applications to influence the way values are handled once downloaded to the client. In the example below, we use an atom to set a cache expiration time for the rating of a Netflix title. 

var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                rating: {
                    $type: "atom", 
                    value: 5, 
                    // expires two seconds from now
                    $expires: -2000
                }
            }
        }
    }
});

// prints "5"
model.
    getValue('titlesById[99].rating').
    then(function(rating) { console.log(rating); });

setTimeout(function() {
    // prints undefined
    model.
        getValue('titlesById[99].rating').
        then(function(rating) { console.log(rating); });
        
}, 3000);

// If you wish to turn off unboxing behavior and retrieve the Atom from a Model, you can use {@Model.prototype.boxValues}.

var model = new falcor.Model({
    cache: {
        titlesById: {
            99: {
                name: "House of Cards",
                rating: {
                    $type: "atom", 
                    value: 5
                }
            }
        }
    }
});

// The following code prints {$type: "atom", value: 5}, because
// because the Atom value is unboxed before the Model returns it.
model.
    boxValues().
    getValue('titlesById[99].rating').
    then(function(rating) { console.log(JSON.stringify(rating)); });

var model = new falcor.Model({
    cache: {
        user: {
            name: {
                // Metadata that indicates this object is a Atom
                $type: "atom",
                // The value property contains the value box by the Atom
                value: "Jim Parsons",
                // Metadata that dictates that this value should be purged from the {@link Model}'s cache after two minutes. Negative numbers imply that expiration occurs relative to the current time.
                $expires: -(1000 * 60 * 2)
            }
        }
    }
});

model.getValue(["user", "name"]).subscribe(function(value) {
    console.log(value);
});

// The code above outputs the following text to the console.
// Jim Parsons
// Note that the value property within the Atom rather than the Atom object itself is returned.
