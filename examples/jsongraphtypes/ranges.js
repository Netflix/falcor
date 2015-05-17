// Example that uses the "to" property in a range.
var model = new falcor.Model({
    cache: {
        friends: {
            "0": {
                name: "Jim"
            },
            "1": {
                name: "Ted"
            },
            "2": {
                name: "Don"
            },
            length: 23
        }
    }
});

// The following range specifies the numbers 0, 1, and 2.
var range = {from: 0, to: 2};

var results = model.get(["friends", range, "name"]).toPathValues();
results.forEach(function(pathValue) {
    console.log(JSON.stringify(pathValue));
})

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["friends",0,"name"],"value":"Jim"}
// {"path":["friends",2,"name"],"value":"Don"}
// {"path":["friends",1,"name"],"value":"Ted"}

// Example that uses the "length" property in a range.
var model = new falcor.Model({
    cache: {
        friends: {
            "0": {
                name: "Jim"
            },
            "1": {
                name: "Ted"
            },
            "2": {
                name: "Don"
            },
            length: 23
        }
    }
});

// The following range specifies the numbers 1 and 2.
var range = {from: 1, length: 2};

var results = model.get(["friends", range, "name"]).toPathValues();
results.forEach(function(pathValue) {
    console.log(JSON.stringify(pathValue));
})

// The code above outputs the following {@link PathValue}s to the console in non-deterministic order.
// {"path":["friends",2,"name"],"value":"Don"}
// {"path":["friends",1,"name"],"value":"Ted"}
 