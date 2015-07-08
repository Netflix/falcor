---
layout: page
title: model
menu: model
lang: en
---

# The Falcor Model
 
Falcor provides a Model object, which is intended to be the "M" in your MVC. An application that uses Falcor doesn't work with JSON data directly, but rather works with JSON data _indirectly_ through the Model object. The Model object provides a set of familiar JavaScript APIs for working with JSON data, including get, set, and call. The main difference between working with JSON data directly and working with it indirectly through a Model object, is that the Falcor Model has a _push API_.

~~~js
var log = console.log.bind(console)

var model = {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
};

console.log(model.todos[0].name);

// This outputs the following to the console:
// get milk from corner store 


// Working with JSON indirectly through a Falcor Model.

var log = console.log.bind(console)

var model = new falcor.Model({cache: {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
}});

model.getValue('todos[0].name').then(log);

// This outputs the following to the console:
// get milk from corner store 
~~~

Note that in the example above, the name of the TODO is _pushed_ to a call back.
 
The main advantage of using a push API is that you can code against JSON data the same way regardless of whether the data is local or remote. This makes it very easy to begin coding your application against mocked data at first, and then work against server data later on without changing client code.

In this example we retrieve the name of the first TODO from a JSON Object: 

~~~js
var log = console.log.bind(console)

var model = new falcor.Model({cache: {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
}});

model.getValue('todos[0].name').then(log);
~~~

In this code sample the data has been moved to the cloud, but the client code that retrieves the data remains the same:

~~~js
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(log);
~~~

Another advantage of using a Falcor Model is that it caches the JSON data it retrieves from the server _in-memory_. As a result, you don't need to maintain a cache of the data that you retrieve from a Falcor Model. Whenever you need data, just retrieve it from the Model. If the Model finds the data in its cache, it will push the data to you immediately. Otherwise the Model will retrieve your data from the server, insert it into the cache, and push it to you asynchronously.
 
~~~js
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(function() {
    // This request is served out of the local cache:
    model.getValue('todos[0].name').then(log);
});
~~~

In addition to JSON data the Falcor model also supports JSON Graph. JSON Graph is a convention for modeling graph information in JSON. JSON graph can help you ensure that the same object never appears more than once in either server responses or the Model cache. This means you never need to worry about propagating changes to multiple copies of the same object.
 
~~~js
var log = console.log.bind(console)

var model = new falcor.Model({cache: {
    todos: [
        {
            $type: "ref",
            value: ['todosById', 44]
        },
        {
            $type: "ref",
            value: ['todosById', 54]
        }        
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [{
                $type: "ref",
                value: ['todosById', 54]
            }]
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.setValue('todos[1].done', true).then(function(x) {
    model.getValue('todos[0].prerequisites[0].done').then(log);
})

// This outputs the following to the console:
// true
~~~
 
In addition to using JSON graph to make sure that objects don't appear more than once in the Model's cache, the model uses the references in JSON graph to optimize server requests. For more information, see [Path Optimization](#Path-Optimization).

# How the Model Works

Every Falcor Model is associated a JSON object. Models use a DataSource to retrieve data from the JSON object. Falcor ships with HttpDataSource, an implementation of the DataSource interface which proxies requests to another DataSource running on an HTTP server (usually a falcor Router).
 
![How the Model Works]({{ site.baseurl }}/falcor-end-to-end.png)

You can associate a DataSource with a Model by passing it to the Model constructor.

~~~js
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});
~~~

You can implement the DataSource interface to allow a Model to communicate with a remote JSON object over a different transport layer (ex. web sockets). For more information see (Data Sources).

If a Model does _not_ have a DataSource, all Model operations will be performed on the Model's local cache. When you initialize the Model, you can prime its cache with a JSON object.
 
~~~js
var log = console.log.bind(console)

var model = new falcor.Model({
    cache: {
        todos: [
            {
                name: 'get milk from corner store',
                done: false
            },
            {
                name: 'withdraw money from ATM',
                done: true
            }
        ]
    }});

model.getValue('todos[0].name').then(log);

// This outputs the following to the console:
// get milk from corner store
~~~
 
It is common practice to begin working against mock data in a Model cache, and then replace it with a DataSource that retrieves data from the server later on.
 
~~~js
var log = console.log.bind(console)

var model = new falcor.Model({
    source: new falcor.HttpDataSource('/model.json'),
});

model.getValue('todos[0].name').then(log);
~~~

When data is retrieved from a DataSource, it is placed into the Model's local cache. Subsequent requests for the same information will not trigger a request to the DataSource if the data has not been purged from the local cache.

~~~js
// Does not trigger a request to the server.
model.getValue('todos[0].name').then(log);
~~~

There is one important difference between working with a JSON object directly and working with that same JSON object through a Falcor Model: **you can only retrieve value types from a Model.**  

## "Why can't I request Objects or Arrays from a Model?"

_Falcor is optimized for displaying information to human beings in real-time._ Both Arrays and Objects can contain an unbounded amount of data. This means it's impossible to predict how much data will be retrieved from the server when you request a JSON Array or Object. An Array that contains 5 items today, can grow to contain 10,000 items later on. This means that Requests which are initially served quickly can become slower over time as more data is added to backend data stores.  This can cause the performance of your application to degrade slowly over time. 

Models force developers to be explicit about which value types they would like to retrieve in order to maximize the likelihood that server requests for data will have **stable performance** over time. Rather than allow you to retrieve an entire Object, Model's force you to _be explicit_ and retrieve only those values needed in a given scenario, similarly when displaying an Array of items Models do not allow you to retrieve the entire Array upfront. Instead you must request the first visible page of an Array, and follow up with additional page requests as the user scrolls.

In the following example we page through a list of TODOs, selecting the name and done property of all the TODOs in the current page.

~~~js
var model = new falcor.Model({
    source: new falcor.HttpDataSource('/todos.json')
});

function showPage(page) {
    //selecting just the props needed to display table row
    var from = page, to = page + 5;
    model.get('todos[' + from + '..' + to + ']["name", "done"]').
        then(function(response) {
            var html = "<ul>";
            var todo;
            for (var i = from; i < to; i++) {
                todo = response.json.todos[i];
                if (todo)
                    html += "<li>" + todo.name + " <img src='" + (todo.done ? "check.png" : "blank.png") + "'></li>";
            }
            html += "</ul><a onclick='showPage(" + to + ")'>Next</a>";
            document.body.innerHTML = html;
        });
};
showPage(0);

// // The code above prints the following html:
// <ul>
//     <li>get milk from corner store <img src="blank.png"></li>
//     <li>withdraw money from ATM <img src="check.png"></li>
// </ul>
// <a onclick="showPage(5)">Next</a>
~~~

If you are certain that an Object or Array will remain a constant size, you can indicate to a Model that they should always be retrieved in their entirety by using an Atom. For more information, see [JSON Graph Atoms](#JSON-Graph-Atoms).

## Paths

A Path is a sequence of Keys, which is evaluated from the root of a JSON object. A path refers to a location within a JSON object. When executing JSON operations, Paths are passed to the Model to specify which values to transform/retrieve in the Model's associated JSON object.

~~~js
var model = new falcor.Model({
  cache: {
    todos: [
      {
        name: 'get milk from corner store',
        done: false
      }
    ]
  }
});

// prints 'get milk from corner store'
model.
  getValue("todos[0].name").
  then(name => console.log(name);
~~~

Models can accept Paths specified in one of two ways:

1. An Array of Keys
2. Path Syntax String

### Paths as Arrays of Keys

A Path can be represented as an array of 0..n Keys. The following types are considered valid Keys:

1. string
2. boolean
3. number
4. null

Each non-null value that is not a string is converted to a string immediately prior to being looked up on the JavaScript object. String conversion follows the rules of JavaScript's toString algorithm.

### Path Syntax Strings

Models support JavaScript-like Path expressions via Path Syntax Strings. Path Syntax Strings are immediately parsed into Path Arrays, which has a run-time cost. 

~~~js
"todos[0].name" -> ["todos", 0, "name"]
~~~

Here are some examples of the valid Path Strings:

* "todos[0].name"
* "todos[0]["name"]"
* "todos["0"]["name"]"

_Unlike_ JavaScript's Path syntax it is also possible to use indexers for the first key in the path.

* '["todos"][0]["name"]'
* '["todos"][0].name'

### Path

In addition to Path Syntax Strings, Models can also be passed an Arrays of Keys, simply referred to as a Path. Here are a few examples of valid Paths:

* ["todos", 0, "name"]
* ["todos", 5, true]
* ["todos", 9, null]

Using a Path Array is more efficient than the Path Syntax, because under the hood a Model immediately parses Path Syntax Strings into Path Arrays. Furthermore a Path Array is often preferable when you have to build Paths programmatically, because string concatenation can be avoided.

~~~js
// Path Syntax String
function loadTodoStatusByIndex(index) {
  return model.get("todos[" + index + "].done"]);
}

// Path (no concatenation required)
function loadTodoStatusByIndex(index) {
  return model.get(["todos", index, "done"]);
}
~~~

Models always emit Paths as Arrays of Keys, because it is easier for consumers to analyze the path. For example:

~~~js
var model = new falcor.Model({
  cache: {
    todos: [
      { name: 'get milk from corner store', done: false },
      { name: 'go to ATM', done: false }
    ]
  }
});

// prints the following (notice outgoing Paths are always represented as Arrays):
// { path: ["todos", 0, "name"], value: 'get milk from corner store' }
// { path: ["todos", 1, "name"], value: 'go to ATM' }
model.
  getValue("todos[0].name", "todos[1].name").
  asPathValues().
  subscribe(pathValue => console.log(JSON.stringify(pathValue));
~~~

## PathSets

A PathSet is a human-readable short-hand for a set of Paths. Any Model method which can accept multiple Paths, can also accept multiple PathSets.

In other words of writing this...

~~~js
var response = 
  model.get(
    "todos[0].name",
    "todos[0].done",
    "todos[1].name",
    "todos[1].done",
    "todos[2].name",
    "todos[2].done");
~~~

...you can write this....

~~~js
var response = model.get("todos[0..2]['name','done']");
~~~

PathSets are a superset of the Path grammer because in addition to Keys, PathSets can contain KeySets. A KeySet can be any of the following values:

* Key
* Range
* Array of Keys or Ranges

Two Paths can be collapsed into a PathSet if they are identical save for one Key position. In other words ["todos",0,"done"] can ["todos",5,"done"] be collapsed into ["todos", [0, 5], "done"]. Furthermore where a KeySet contains a sequence of consecutive integers, these keys can be collapsed into a range. In other words ["todos", 1, "done"], ["todos",  2, "done"], and ["todos", 3, "done"] can be collapsed into ["todos", { from: 1, to: 3 }, "done"].

Models can accept PathSets in one of two formats:

1. PathSet Syntax String
2. An Array of KeySets

### PathSet Syntax String

PathSet Syntax Strings expand on the Path Syntax Grammer, adding ranges, and the ability to specify multiple keys or ranges in indexers. PathSet Syntax Strings are immediately parsed into PathSet Arrays, which has a run-time cost. Any Models which can accept multiple Paths can also accept PathSets.

The following PathSet Strings are valid:

* "todos[0..2].name" is equivalent to "todos[0].name", "todos[1].name", and "todos[2].name"
* "todos[0...2].name" is equivalent to "todos[0].name", and "todos[1].name"
* "todos[0..1]['name','done']" is equivalent to "todos[0].name", "todos[0].done", "todos[1].name", and "todos[1].done"
* "todos[0..1, "length"] is equivalent to "todos[0]", "todos[1]", and "todos.length"

### PathSet Array

PathSet Syntax Strings expand on the Path Syntax Grammer, adding ranges, and the ability to specify multiple keys or ranges in indexers. PathSet Syntax Strings are immediately parsed into PathSet Arrays, which has a run-time cost. Any Models which can accept multiple Paths can also accept PathSets.

The following PathSet Strings are valid:

* "todos[0..2].name" is equivalent to "todos[0].name", "todos[1].name", and "todos[2].name"
* "todos[0...2].name" is equivalent to "todos[0].name", and "todos[1].name"
* "todos[0..1]['name','done']" is equivalent to "todos[0].name", "todos[0].done", "todos[1].name", and "todos[1].done"
* "todos[0..1, "length"] is equivalent to "todos[0]", "todos[1]", and "todos.length"

## Working with JSON Graph Data using a Model

In addition to being able to work with JSON documents, Models can also operate on JSON Graph documents. JSON Graph is a convention for modeling graph information in JSON. JSON Graph documents extend JSON with **References**. References can be used anywhere within a JSON object to refer to a value elsewhere within the same JSON object. This removes the need to duplicate objects when serializing a graph into a hierarchical JSON object.

Let's say that we wanted to introduce a list of prerequisites for each TODO in a TODO list.

~~~js
var log = console.log.bind(console)

var json = {
    todos: [
        {
            id: 2692,
            name: 'get milk from corner store',
            done: false,
            prerequisites: [
                {
                    name: 'withdraw money from ATM',
                    done: false  
                }
            ]
        },
        {
            id: 4291,
            name: 'withdraw money from ATM',
            done: false  
        }   
    ]
};
~~~

Notice that the TODO "withdraw money from the ATM" appears twice in the JSON object above. Let's say we want to mark this task as done:

~~~js
json.todos[1].done = true;
~~~

If we examine the JSON object after this change, we will notice that the change has _not_ been propagated to all of the copies of the task. Because the same task also appears in the prerequisites array of task 2692, its "done" value remains false.

~~~js
console.log(JSON.stringify(json, null, 4));
/* Prints the following to the console:
{
    todos: [
        {
            id: 2692,
            name: 'get milk from corner store',
            done: false,
            prerequisites: [
                {
                    id: 4291,
                    name: 'withdraw money from ATM',
                    done: false  
                }
            ]
        },
        {
            id: 4291,
            name: 'withdraw money from ATM',
            done: true 
        }
    ]
};
*/
~~~

This highlights one of the hazards of representing your data as JSON: **most application domains are Graphs and JSON models Trees.**

When application servers send subsets of the graph across the network as JSON, they typically use the *duplicate and identify strategy*. If the same object appears more than once in the JSON response, the application server includes a unique ID within the object. The application client is expected to use the IDs to determine if the two copies of an object represent the same entity. This code must often be specialized for each new type of message that comes back from the server. Failing to de-dupe objects can lead to stale data being displayed to the user.

Falcor attempts to solve this problem by introducing JSON Graph. JSON Graph is a convention for modeling graph information in JSON. You can convert any JSON object into a JSON Graph in two steps:

1. Move all objects to a unique location within the JSON object
2. Replace all other occurrences of the object with a **Reference** to that object's unique location

We can use the task ID to create a unique location in the JSON for each task. We start by adding a map of all Tasks that is organized by Task ID to the root of the document:

~~~js
var json = {
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: []
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    },
    todos: [
        {
            id: 44,
            name: 'get milk from corner store',
            done: false,
            prerequisites: [
                {
                    id: 54,
                    name: 'withdraw money from ATM',
                    done: false  
                }
            ]
        },
        {
            id: 54,
            name: 'withdraw money from ATM',
            done: true 
        }
    ]
};
~~~

Next we replace every other occurrence of each task with a Reference value. A Reference is a JSON object that contains a path to another location within an object. References can be constructed using the Model.ref factory function. 

~~~js
var $ref = falcor.Model.ref;
var json = {
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')]
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    },
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ]
};
~~~

Although a Reference is a JSON object, it is treated as a value type by the Model. In other words it is legal to retrieve a reference from a Falcor Model.

~~~js
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')]
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.get('todos[1]').
    then(function(x) { console.log(JSON.stringify(x, null, 4)); })

// This outputs the following to the console:
// {
//     "json": {
//         "todos": {
//             "1": [
//                 "todosById",
//                 54
//             ]
//         }
//     }
// }
~~~

Note that in the example above each TODO appears only once. If we use a Model to set a TODO to false we will observe that the new state will be reflected regardless of where in the JSON Graph we retrieve the TODO's information.

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')]
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.setValue('todos[1].done', true).then(function(x) {
    model.getValue('todos[0].prerequisites[0].done').then(log);
    model.getValue('todos[1].done').then(log);
})

// This outputs the following to the console:
// true
// true
~~~

Note that in the example operations above we use a path which extends *beyond* the reference object in the JSON Graph. However instead of short-circuiting and returning the reference, the Model *follows* the path in the reference and continues evaluating the remaining keys and the path at the location referred to by the path in the reference. In the next section we will explain how models evaluate paths against JSON and JSON Graph objects.

### JSON Graph Path Evaluation

When evaluating paths against a JSON object, the Falcor model starts at the root of its associated JSON object and continues looking up keys until it arrives at a value type.

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')],
            customer: null
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.getValue('todosById[44].name').then(log);

// This outputs the following to the console:
// get milk from corner store 
~~~

If a value type is encountered before the path is fully evaluated, the path evaluation process is short-circuited and the value discovered is returned.

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')],
            customer: null
        },
        "54": {
            name: 'deliver pizza',
            done: false,
            prerequisites: [],
            customer: {
                name: "Jim Donut",
                address: "123 Seaside blvd. Pacifica, CA"
            }
        }
    }
}});

model.getValue('todosById[44].customer.name').then(log);

// This outputs the following to the console:
// null
~~~

The one exception to this rule is the case in which  a Model encounters a **Reference** value type. When a Model encounters a reference while evaluating a path, it behaves differently than does if it encounters any other value type. If a Model encounters a reference before evaluating all of the keys in a path, the unevaluated keys are appended to the path within the reference and evaluation is resumed from root of the JSON object.

In the following piece of code, we attempt to retrieve the name of the first TODO:

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')],
            customer: null
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.getValue('todos[0].name').then(log);

// This outputs the following to the console:
// get milk from corner store
~~~

First the model evaluates the keys "todo" and "0" and encounters a reference value. However instead of short-circuiting and returning the reference value, the Model resumes evaluation from the location in the JSON referred to in the reference path. This is accomplished by dynamically rewriting the path from "todos[0].name" to "todosById[44].name" and resuming evaluation from the root of the JSON object. 

Note that **references are only followed if there are more keys in the path that have not yet been evaluated.** If we shorten the path to "todos[0]" the model returns the reference path rather than the object it refers to.

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')],
            customer: null
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.getValue('todos[0]').then(log);

// This outputs the following to the console:
// ["todosById", 44]
~~~

The process of rewriting a path when a reference is encountered is known as *Path Optimization*. For more information on how Path Optimization can improve the efficiency of server-side data retrieval, see [Path Optimization](#Path-Optimization).

<a name="JSON-Graph-Sentinels"></a>

### JSON Graph Sentinels

In addition to References, JSON graph introduces two more new value types: Atoms and Errors. These three special value types are all classified as *Sentinels*.

Sentinels are JSON objects that are treated by the Falcor Model as value types. References, Atoms, and Errors are all JSON objects with a "$type" value of "ref", "atom", and "error" respectively. 

(Example of a reference, atom, and error.)

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        {
            $type: "ref",
            value: ['todosById', 44]
        },
        {
            $type: "ref",
            value: ['todosById', 54]
        }
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false
        },
        "45": {
            $type: "error",
            value: "todo #45 missing."
        },
        "46": {
            $type: "atom",
            value: [1, 2, 3]
        }
    }
}});
~~~

Each Sentinel objects also contains a "value" key with its actual value. One way to think about a Sentinel is a *box around a value*  that indicates the type of the value within. Sentinels influence the way that Models interpret their values, allowing them to distinguish a path from a string or an regular object from an error for example.

Despite being JSON objects, all Sentinels are considered JSON Graph value types and therefore can be retrieved from a Model. However when a Sentinel is retrieved from a Model, the Model *unboxes* the value within the Sentinel and returns the value instead of the entire Sentinel object.

(Example of calling get value on an Atom)

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todosById: {
        "44": {
            $type: "atom",
            value: [1, 2, 3, 4]
        }
    }
}});

model.getValue('todosById[44]').then(log);

// This outputs the following to the console:
// [1, 2, 3, 4]
//@TODO: revisit.
~~~

You can create a new Model which does not have this unboxing behavior by calling "boxValues." 

(Example of calling get value on an Atom with boxValues on)

~~~js
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todosById: {
        "44": {
            $type: "atom",
            value: [1, 2, 3, 4]
        }
    }
}});

//@TODO: revisit.
model.boxValues().getValue('todosById[44]').
    then(function(x) { console.log(JSON.stringify(x, null, 4)); });

// This outputs the following to the console:
// {
//     "$type": "atom",
//     "value": [
//         1,
//         2,
//         3,
//         4
//     ],
//     "$size": 54
// } 
~~~

For more information see [Boxing and Unboxing](#Boxing-and-Unboxing).

As sentinels are value types, their contents cannot be changed. Like numbers and strings, they must be replaced entirely.

(Example of Setting an Atom in the cache)

~~~js
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todosById: {
        "44": {
            $type: "atom",
            value: [1, 2, 3, 4]
        }
    }
}});

model.setValue('todosById[44]');
//@TODO: how do you set an atom in the cache?
// This outputs the following to the console:
~~~

Each Sentinel affects the way in which the Model interprets its value differently. References were explained in the previous section. In the next two sections, Atoms and Errors will be explained.

<a name="JSON-Graph-Atoms"></a>

#### JSON Graph Atoms

JSON Graph allows metadata to be attached to values to control how they are handled by the Model. For example, metadata can be attached to values to control how long values stay in the Model cache and indicate whether one value is a more recent version of another value. For more information see [Sentinel Metadata](#Sentinel-Metadata).

One issue is that JavaScript value types do not preserve any metadata attached to them when they are serialized as JSON:

(Example of creating a JavaScript number, attaching an "$expires" property to it, and then Json stringifying it)

~~~js
var number = 4;
number['$expires'] = 5000;

console.log(JSON.stringify(number, null, 4))

// This outputs the following to the console:
// 4
~~~

Atoms "box" value types inside of a JSON object, allowing metadata to be attached to them. 

(Example of creating an atom with a value of 4 and an "$expired property and then serializing)

~~~js
var number = {
    $type: "atom",
    value: 4,
    $expires: 5000
};

console.log(JSON.stringify(number, null, 4))

// This outputs the following to the console:
// {
//     "$type": "atom",
//     "value": 4,
//     "$expires": 5000
// } 
~~~

The value of an Atom is always treated like a value type, meaning it is retrieved and set in its entirety. Mutating an Adam is ineffectual. Instead you must replace it entirely using the Model's set operation.

(Example showing that it is ineffectual to modify the value of an atom directly. We clone Atoms when they are retrieved from the model, so this example should show that mutating an Atom directly has no effect by then retrieving the same object, and displaying it's data which will be unchanged)

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;
var $atom = falcor.Model.atom;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]')
    ],
    todosById: {
        "44": {
            name: 'deliver pizza',
            done: false,
            customer: $atom({
                name: 'Jim Hobart',
                address: '123 pacifica ave., CA, US'
            })
        }
    }
}});

model.getValue('todosById[44].customer').
    then(function(x) { 
        log(x); 
        x.name = "not Jim Hobart"
        model.getValue('todosById[44].customer').then(log)
    })

//@TODO: example is inaccurate.
~~~


In addition to making it possible to attach metadata to JSON values, Atoms can be used to get around the restriction against retrieving JSON Objects and Arrays from a Falcor Model. 

Let's say that we have an Array which we are certain will remain small, like a list of video subtitles for example. 

(Example of a JSON graph object with a Netflix title which contains an array of subtitles)

~~~js
var log = console.log.bind(console)
var $ref = falcor.Model.ref;
var $atom = falcor.Model.atom;

var model = new falcor.Model({cache: {
    titlesById: {
        "44": {
            name: "Die Hard",
            subtitles: $atom(['en', 'fr'])
        }
    }
}});
~~~

By boxing the Array in an Atom, we cause the Falcor model to treat it as a value and return it in its entirety. 

(Example of retrieving the entire array using a model)

~~~js
model.getValue('titlesById[44].subtitles').then(log)

// This outputs the following to the console:
// ['en', 'fr']
~~~

Internally the Model boxes all retrieved values that have been successfully retrieved from the data source before storing these values in its local cache.

#### JSON Graph Errors

When a Model's DataSource encounters an error while attempting to retrieve a value from a JSON Graph object, it is represented as an error object. 

(Example of an error when attempting to retrieve the rating of a Netflix title from a model)

~~~js
var model = new falcor.Model({cache: {
    titlesById: {
        "44": {
            $type: "error",
            value: "failure to retrieve title."
        }
    }
}});

try {
    console.log(model.getValueSync('titlesById[44]'))
} catch(e) {
    console.error(e.value)
}

// This outputs the following to the error console:
// failure to retrieve title.
~~~

By default a Model delivers Errors differently than other values. If synchronous methods are used to retrieve the data from the model, the error is thrown.  If the data is asynchronously being requested from the model as a observable or a promise, the error will be delivered in a special call back.

(Example of receiving an error in an observable)

~~~js
var log = console.log.bind(console);

var model = new falcor.Model({cache: {
    titlesById: {
        "44": {
            $type: "error",
            value: "failure to retrieve title."
        }
    }
}});

model.getValue('titlesById[44]').subscribe(log, function(e) { console.error(e[0].value); })

// This outputs the following to the error console:
// failure to retrieve title.
//@TODO: bug?  why does 'subscribe's error callback return an array while 'then's does not?
~~~

(Example of receiving an error in a promise)

~~~js
var log = console.log.bind(console);

var model = new falcor.Model({cache: {
    titlesById: {
        "44": {
            $type: "error",
            value: "failure to retrieve title."
        }
    }
}});

model.getValue('titlesById[44]').then(log, function(e) { console.error(e.value); })

// This outputs the following to the error console:
// failure to retrieve title.
~~~

To learn more about the different ways to retrieve information from a model, see [Retrieving Data from a Model](#Retrieving-Data-from-a-Model).

##### "What if I don't want a Model to treat errors differently from other values?"

There are many reasons why you might want errors reported the same way as other values. For example you might retrieve several paths from a model in a single request, and want to be resilient against the possibility that one of them fails. Furthermore you might want to display errors in a template alongside successfully-retrieved values. 

The "treatErrorsAsValues" function creates a new Model which reports errors the same way as values. 

(Example of retrieving a single error from a JSON graph using get value)

~~~js
var model = new falcor.Model({cache: {
    titlesById: {
        "44": {
            $type: "error",
            value: "failure."
        }
    }
}});

console.log(model.treatErrorsAsValues().getValueSync('titlesById[44]'))

// This outputs the following to the regular console:
// failure.
~~~

Note that using "treatErrorsAsValues" will cause the model to deliver errors as values. However it will not provide you with a way to distinguish errors from values. If you would like to be able to receive errors alongside values, but retain the ability to distinguish between errors and values, you can chain "treatErrorsAsValues" and "boxValues" together. When I model is operating in "boxValues" mode, it always returns the sentinels that box each value and indicate their type. 

(Identical example as above, except this time we also call box values in addition to treat errors as values)

~~~js
var model = new falcor.Model({cache: {
    titlesById: {
        "44": {
            $type: "error",
            value: "failure."
        }
    }
}});

console.log(JSON.stringify(model.treatErrorsAsValues().boxValues().getValueSync('titlesById[44]'), null, 4))

// This outputs the following to the regular console:
// {
//     "$type": "error",
//     "value": "failure.",
//     "$size": 58
// }
~~~

When you receive a Sentinel, you can check the "$type" property of each sentinel to distinguish whether a value is an error ("error") or a successfully-retrieved value ("atom"). For more information see [Boxing and Unboxing](#Boxing-and-Unboxing).

#### Sentinel Metadata

Metadata can be attached to Sentinels to control the way the Model handles them once they have been retrieved from the data source. Metadata is any key that starts with the prefix "$".

(Example of using setValue to add an atom that expires in two seconds  ($expires: -2000) and then attempting to retrieve it after four seconds only to prove that it is gone)

~~~js
//@TODO: look up syntax for how do this.
~~~

<a name="Retrieving-Data-from-a-Model"></a>

## Retrieving Data from a Model

(Example of using get value sync to retrieve the rating)


Errors are cached in the Model just like any other value. As it is possible to retrieve more than one path at a time from a model,

~~~js
var $ref = falcor.Model.ref;
var model = new falcor.Model({cache:{
    todos: [
        $ref('todosById[79]'),
        $ref('todosById[99]')
    ],
    todosById: {
        "99": {
            name: 'deliver pizza',
            done: false,
            priority: 4,
            customer: {
                $type: 'atom',
                value: {
                    name: 'Jim Hobart',
                    address: '123 pacifica ave., CA, US'
                },
                // this customer object expires in 30 minutes.
                $expires: -30 * 60 * 1000
            },
            prerequisites: [$ref('todosById[79]')]      
        },
        "79": {
            $type: 'error',
            value: 'error retrieving todo from database.'
        }
    }
}});
~~~

The following paths are legal to retrieve because atoms, errors, and references are considered value types in JSON Graph:

~~~js
model.getValue("todos[0].customer").then(log); 
// prints {name: "Jim Hobart", address:"123 pacifica ave., CA, US"} because the value of an Atom is considered a value
~~~

"Why can't I retrieve Arrays or Objects from a Model?"

Instead you must be explicit, and request all of the value types that you need.
  
In addition to the JavaScript path syntax, models can also process paths with ranges in indexers:

~~~js
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')]
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.get('todos[0..1].name').then(function(x) {
    console.log(JSON.stringify(x, null, 4));
});

// This outputs the following to the console:
// {
//     "json": {
//         "todos": {
//             "0": {
//                 "name": "get milk from corner store"
//             },
//             "1": {
//                 "name": "withdraw money from ATM"
//             }
//         }
//     }
// }
~~~
 
Models allow you to select as many paths as you want in a single network request.
 
~~~js
model.get('todos[0..1].name', 'todos[0..1].done').then(log);
~~~

The paths in the previous example can be simplified to one path, because in addition to allowing ranges in indexers, Falcor models also allow multiple keys to be passed in a single indexer:

~~~js
model.get('todos[0..1]["name", "done"]').then(log);
~~~

Do you get method also except optional selector function, which can be used to transform the data retrieved from the server before...
 
One of the limitations of working with JSON data through a Falcor model is that you can only retrieve values.
 
<a name="Boxing-and-Unboxing"></a>

## Boxing and Unboxing
 
 
 
<a name="Sentinel-Metadata"></a>

## Sentinel Metadata

Metadata can be attached to value types to control the way the Model handles them once they have been retrieved from the data source. Metadata can be to any JSON object as a key that starts with the prefix "$". Note that any keys set on JSON value types (string, number, boolean, and null) will not persist when serialized to JSON. 

(Example of attaching a metadata key to a JavaScript number, and then JSON stringifying it only to discover that the key is missing.)

Therefore in order to add metadata to JSON value types, the value types must be boxed in an atom. For more information on Atoms see [JSON Graph Atoms](#JSON-Graph-Atoms).




For more information on sentinels, see [JSON Graph Sentinels](#JSON-Graph-Sentinels).


## Transactions

A Model automatically collects least-recently-used items in the local cache when the size of the cache breaches the Model's maximum cache size. However the Model also attempts to ensure that data that is currently being delivered 
A transaction is a period of time during which no cache collections occur. 

When you request data from a Falcor model, any request the data that is not in the local cash is retrieved from the data source, added to the cash, and then pushed to a callback.  By default, a transaction begins when the data is written to the cache and ends when the callback function has finished executing.

The Falcor model uses push APIs to deliver data, giving it the flexibility to retrieve data from the data source if it is not synchronously available in the Model's cache. Under normal circumstances the model does not allow synchronous access to the cache. The reason why don't you just cannot be synchronously retrieved from the model cache is that there is no way for a developer to ascertain whether a model a value is undefined or simply not present in the cache.


There are a several Model methods which can _only_ be called within a transaction. These methods end in the suffix "Sync", because they are both _synch_ronous and _sync_hronized, meaning they synchronously retrieve data from the model cache but throw if not run within a transaction. 

Synchronized methods allow you to synchronously read data directly from the Falcor cache. 

## Error Handling

## Cache Control

<a name="The-Model-Cache"></a>

## The Model Cache

## Schedulers

<a name="Path-Optimization"></a>

## Path Optimization and the DataSource

When you request a path from a Model, the Model first attempts to retrieve the data from an in-memory cache. If the model fails to find the data in its cache, the Model request the data from its data source.

Typically a path that has been optimized can be retrieved more efficiently by the Model's DataSource because it requires fewer steps through the graph to retrieve the data. 


When attempting to retrieve paths from the cache, Models optimize paths whenever they encounter references. This means that even if a Model is not able to find the requested data in its local cache, it may be able to request a more optimized path from the data source.
