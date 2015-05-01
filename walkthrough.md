In a Falcor application you access and modify your application's JSON data using a Falcor Model object. The Falcor Model allows you to work with JSON data using familiar JavaScript operations like get, set, and call. The main difference is that the Falcor Model's Falcor APIs are asynchronous. By providing an asynchronous API, the Falcor model allows developers to manipulate all JSON data the same way regardless of whether the data is in local memory, or in the cloud.

Let's start by working with the JSON data we expect the server to provide. In this example we will use a JSON object that represents an individual Netflix member's (abbreviated) personalized recommendations.

Every Netflix member gets a set of recommendations that is personalized based on their tastes. The recommended titles are organized into genres, such as horror, comedy, and action.

To keep the code short we will abbreviate the model to two genre lists ("New Releases" and "Recently Watched"), each of which has a single title.

We can use the following JavaScript code to retrieve the name of the first title in the first genre list.

```JavaScript
var model = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 1007,
                    name: 'Bloodline',
                    rating: 4,
                    boxshot: '../assets/bl.webp'
                }
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
};

console.log(model.genreLists[0].titles[0].name);
```

The code above outputs the following to the console:
```JavaScript
Bloodline 
```

Instead of working with the JSON data directly, let's load it into a Falcor model.  To retrieve the name of the first title in the first list from the Falcor Model, we can use the same JavaScript path we used on the JSON object. Note that the only difference is that the model returns a promise, which resolves to the result asynchronously.

```JavaScript
var cache = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 1007,
                    name: 'Bloodline',
                    rating: 4,
                    boxshot: '../assets/bl.webp'
                }
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
};

var model = new falcor.Model({cache: cache});

model.getValue('genreLists[0].titles[0].name').then(function(x) {
    console.log(JSON.stringify(x, null, 4));
});
```

The code above outputs the following to the console:
```JavaScript
"Bloodline"
```

In addition to normal JavaScript path syntax, models also support ranges in indexers. In the example below we use a range to retrieve the names of the titles in both of the genre lists.

```JavaScript
var cache = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 1007,
                    name: 'Bloodline',
                    rating: 4,
                    boxshot: '../assets/bl.webp'
                }
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
};

var model = new falcor.Model({cache: cache});

model.get('genreLists[0..1].titles[0].name').then(function(x) {
    console.log(JSON.stringify(x, null, 4));
});
```

The code above outputs the following to the console:
```JavaScript
{
    "json": {
        "genreLists": {
            "0": {
                "titles": {
                    "0": {
                        "name": "Bloodline"
                    }
                }
            },
            "1": {
                "titles": {
                    "0": {
                        "name": "House of Cards"
                    }
                }
            }
        }
    }
}
```

In addition to using ranges to select multiple values, you can also select multiple values by passing multiple paths to a model. In this example we select the name and rating of the titles in both genre lists.

```JavaScript
var cache = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 1007,
                    name: 'Bloodline',
                    rating: 4,
                    boxshot: '../assets/bl.webp'
                }
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
};

var model = new falcor.Model({cache: cache});

model.get(
    'genreLists[0..1].titles[0].name', 'genreLists[0..1].titles[0].rating').
    then(function(x) {
        console.log(JSON.stringify(x, null, 4));
    });
```

The code above outputs the following to the console:
```JavaScript
{
    "json": {
        "genreLists": {
            "0": {
                "titles": {
                    "0": {
                        "name": "Bloodline",
                        "rating": 4
                    }
                }
            },
            "1": {
                "titles": {
                    "0": {
                        "name": "House of Cards",
                        "rating": 4
                    }
                }
            }
        }
    }
} 
```

The two paths above can be collapsed into one, because Falcor allows multiple keys to be passed into indexers.

```JavaScript
model.get(
    'genreLists[0..1].titles[0]["name", "rating"]').
    then(function(x) {
        console.log(JSON.stringify(x, null, 4));
    });
```

The code above will produce the same console output as the last example.

Falcor makes it easy to work with JSON data. Unfortunately using JSON data to model your application's domain data can cause problems. 

For example, when you watch a Netflix title, the title appears at the front of your "Recently Watched" genre list. If we were to watch house of cards, the JSON object would look like this:

```JavaScript
var cache = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
};
```

Notice that the "house of cards" title appears twice in the JSON object. Now let's say that I Netflix user give the title in the recently watchlist a rating of five. This is accomplished using the model's set operation.

```JavaScript
var model = new falcor.Model({cache: cache});

model.setValue(
    'genreLists[0].titles[0].rating', 5).
    then(function() {
        return model.get('genreLists[0..1].titles[0]["name", "rating"]')
    }).
    then(function(x) {
        console.log(JSON.stringify(x, null, 4));
    });
```

The code above outputs the following to the console:
```JavaScript
{
    "json": {
        "genreLists": {
            "0": {
                "titles": {
                    "0": {
                        "name": "House of Cards",
                        "rating": 5
                    }
                }
            },
            "1": {
                "titles": {
                    "0": {
                        "name": "House of Cards",
                        "rating": 4
                    }
                }
            }
        }
    }
} 
```

Now take a close look at the JSON object in the model. Noticed that the rating is only reflected in the "house of cards" object in the recently watched list. If the user scrolls down and sees the same title in the New releases list, the rating will not reflect their changes.

This is a common problem experienced by applications that use JSON as a data interchange format: their application domain models are graphs, but JSON models information as a tree.

When sending subsets of their domain graph over the wire as JSON, most applications 

Netflix for example can display related titles screen for any individual title, which means that the Netflix domain model is a graph where any title may be related to every other title indirectly through the graph. This is very common. For example in the Amazon application, any product May be related to any other product based on similar characteristics, consumer buying habits, and so on.



In addition to retrieving values, we can also set values using the path syntax. In this example we set the rating of the "house of cards" title.

Note that the "house of cards" title appears in two genre lists: "suggestions for you" and "new releases." Unfortunately because the title object has been duplicated in the JSON object, our rating is only applied to one of the copies. That means that the other copy contains stale data.

This is an good demonstration of the problem with using JSON as a data modeling or interchange format. Most applications have a domain model which is organized into a graph. When a subset of an application's domain graph is sent across the network, it is converted into a JSON tree and duplicates are introduced.  In order to avoid data stale data, application clients must use unique identifiers to remove duplicates before storing objects in the local cache. This process is often manual, and specialized logic is usually written for each new type in a domain model or network message. Despite this inconvenience, developers love the convenience of JSON because it universally understood and easily serialized and sent across the network.

To solve the problem of JSON, Falcor           allows you to use a convention for modeling graphs and JSON: JSON graph. If you use the JSON graph format, you can insert references into the serial tree. It's easy to convert JSON objects into JSON graph format: simply move each object with an id into a unique location in the JSON object, and replace all other instances with a reference to the unique location.

All titles in Netflix have a unique integer identifer, First we add the "House of Cards" title to a new  "titlesById" map at the root of the document. We place the title under its identifier 

Now we






