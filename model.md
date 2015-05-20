# The Falcor Model
 
Falcor provides a Model object, which is intended to be the "M" in your MVC. An application that uses Falcor doesn't work with JSON data directly, but rather works with JSON data _indirectly_ through the Model object. The Model object provides a set of familiar JavaScript APIs for working with JSON data, including get, set, and call. The main difference between working with JSON data directly and working with it indirectly through a Model object, is that the Falcor Model has a push API.

```
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
```

Note that in the example above, the name of the TODO is pushed to a call back.
 
The main advantage of using a push API is that you can code against JSON data the same way regardless of whether the data is local or remote. This makes it very easy to begin coding your application against mocked data at first, and then work against server data later on without changing client code.

In this example we retrieve the name of the first TODO from a JSON Object: 

```
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
```

In this code sample the data has been moved to the cloud but the client code which retrieves the data remains the same:

```
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(log);
```

Another advantage of using a Falcor Model is that it caches the JSON data it retrieves from the server in-memory. As a result, you don't need to maintain a cache of the data that you retrieve from a Falcor Model. Whenever you need data, just retrieve it from the Model. If the Model finds the data in its cache, it will push the data to you immediately. Otherwise the Model will retrieve your data from the server, insert it into the cache, and push it to you asynchronously.
 
```
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(function() {
    // This request is served out of the local cache:
    model.getValue('todos[0].name').then(log);
});
```

In addition to JSON data the Falcor model also supports JSON Graph. JSON Graph is a convention for modeling graph information in JSON. JSON graph can help you ensure that the same object never appears more than once in either server responses or the Model cache. This means you never need to worry about propagating changes to multiple copies of the same object.
 
```
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
})

// This outputs the following to the console:
// true
```
 
In addition to using JSON graph to make sure that objects don't appear more than once in the Model's cache, the model uses the references in JSON graph to optimize server requests. For more information, see Path Optimization.

## Working with JSON using a Model
 
Every Falcor Model is associated with a JSON value. Models use DataSources to retrieve the data from their associated JSON values. Falcor ships with HttpDataSource, an implementation of the DataSource interface that communicates with a remote DataSource over HTTP.
 
```
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});
```

You can implement the DataSource interface to allow a Model to communicate with a remote JSON object over a different transfer protocol, like web sockets for example. If a Model does not have a DataSource, all Model operations will be performed on the Model's local JSON cache. When you initialize the Mode, you can provide it with JSON data to prime its local cache.
 
```
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
```
 
It is common practice to begin working against mock data in a Model cache, and then replace it with a DataSource that retrieves data from the server later on.
 
```
var log = console.log.bind(console)

var model = new falcor.Model({
    source: new falcor.HttpDataSource('/model.json'),
});

model.getValue('todos[0].name').then(log);
```

When data is retrieved from a DataSource, it is placed into the Model's local cache. Subsequent requests for the same information will not trigger a request to the DataSource if the data has not been purged from the local cache.

```
// Does not trigger a request to the server.
model.getValue('todos[0].name').then(log);
```

For more information on how the Model JSON cache works, see the Model JSON cache.

# Working with JSON data using a Model

Every Model is associated with a JSON value. The Falcor model provides APIs to allow developers to retrieve data from its JSON value. To retrieve a single value from a Model, you pass a JavaScript path through the JSON object to the Model's get method.
 
```
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

model.get('todos[0].name').then(log);

// This outputs the following to the console:
// {
//    todos: {
//        "0": {
//            "name": 'get milk from corner store'
//        }
//    }
// }
```
There is one important difference between working with a JSON object directly and working with that same JSON object through a Falcor Model: **you can only retrieve value types from a Model.**  

## Retrieving values from a Falcor Model

The following JSON object contains a list of TODOs.

```
var log = console.log.bind(console)

var json = {
    todos: [
        {
            name: 'get milk from corner store',
            done: false,
            priority: 4,
            customer: null
        },
        {
            name: 'deliver pizza',
            done: false,
            priority: 4,
            customer: {
            name: 'Jim Hobart'
            address: '123 pacifica ave., CA, US'
        }        
    ]
};
```

When working with a JSON object directly in JavaScript you can retrieve an Object or an Array and print it to the console:

```
var customer = json.todos[1].customer;
log(JSON.stringify(customer, null, 4))

// This outputs the following to the console:
// customer: {
//    name: 'Jim Hobart'
//    address: '123 pacifica ave., CA, US'
// }
```

When working with the same JSON object indirectly through a Falcor Model, you can _not_ retrieve Arrays or Objects - only value types like null, string, boolean, and Array.

```
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache:json});

model.getValue("todos[1].customer").then(function(customer) { log(customer); }); // undefined behavior
```

The only paths which can be retrieved from the Model above are those that retrieve the basic JSON value types. That means any of the following paths are legal to retrieve from a Model:

```
model.getValue("todos[0].name").then(log); // prints "get milk from the corner store"
model.getValue("todos[0].done").then(log); // prints "false"
model.getValue("todos[1].customer.name").then(log); // prints "Jim Hobart"
model.getValue("todos[1].priority").then(log); // prints 4
```

In contrast the following get operation has _undefined behavior_ because it attempts to retrieve the entire "todos" Array:
```
model.getValue("todos").then(log); // undefined behavior
```

Likewise of the following get operation also has undefined behavior, because it retrieves an entire customer object:
```
model.getValue("todos[1].customer").then(log);  // undefined behavior
```

The requests above can not reliably be expected to return data. Therefore you should never request an Object or an Array from a Falcor Model.

### "Why can't I request Objects or Arrays from a Model?"

Falcor is optimized for displaying information to human beings in real-time. Both Arrays and Objects can contain an unbounded amount of data. This means it’s impossible to predict how much data will be retrieved from the server when you request them. Server requests that take less than a second at first can become slower over time as more data is added to backend data stores.  This can cause the performance of your application to degrade slowly, and eventually may even cause it to become unusable as more and more data finds its way into your persistent data stores.

In order to ensure that backend requests for data have more **predictable performance** over time Falcor Models force developers to be explicit. If your view will only be displaying a few properties, you should those properties explicitly. 

(Example of requesting properties and displaying them)

Furthermore if you intend to display a list of items, request the first visible page of an array and follow up with additional page requests as the user scrolls.

(Example of retrieving first page of a list)

## Working with JSON Graph Data using a Model

In addition to being able to work with JSON documents, Models can also operate on JSON Graph documents. JSON Graph is a convention for modeling graph information in JSON. JSON Graph documents introduce references, allowing an object to be referenced from multiple places in the JSON while allowing it to appear only once in the object. 

Let's say that we wanted to introduce a list of prerequisites for each TODO in a TODO list.  
```
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
```

Notice that the TODO "withdraw money from the ATM" appears twice in the JSON object above. Let's say we want to mark this task as done:

```
json.todos[1].done = true;
```

If we examine the JSON object after this change, we will notice that the change has _not_ been propagated to all of the copies of the task. 

```
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
```

This highlights one of the hazards of representing your data as JSON: **most application domains are Graphs and JSON models Trees.**

When application servers send subsets of the graph across the network as JSON, they typically use the *duplicate and identify strategy*. If the same object appears more than once in the JSON response, the application server includes a unique ID within the object. The application client is expected to use the IDs to determine the two copies of an object represent the same entity. This code must often be specialized for each new type of message that comes back from the server. Failing to de-dupe objects can lead to stale data being displayed to the user.

Falcor attempts to solve this problem by introducing JSON Graph. JSON Graph is a convention for modeling graph information in JSON. You can convert any JSON object into a JSON Graph in two steps:

1. Move all objects to a unique location within the cereal object
2. Replace all other occurrences of the object with a **Reference** to that object's unique location

We can use the task ID to create a unique location in the JSON for each task. We start by adding a map of all Tasks that is organized by Task ID to the root of the document:

(Example of tasks by ID)

Next we replace every other occurrence of each task with a Reference value. A Reference is a JSON object that contains a path to another location within an object. References can be constructed using the Model.ref factory function. 

(Example that shows references)

Although a Reference is a JSON object, it is treated as a value type by the Model. In other words it is legal to retrieve a reference from a Falcor Model.

(Example that shows retrieving a reference for a Falcor model)

Note that in the example above each TODO appears only once. If we use a Model to set a TODO to false we will observe that the new state will be reflected regardless of where in the JSON Graph we retrieve the TODO's information.

(Example demonstrating that when we use set value to set the done property of the second two due to false, we get done:true when we read it from both places in the to do list)

Note that in the example operations above we use a path which extends *beyond* the reference object in the cereal graph. However instead of short-circuiting and returning the reference, the Model *follows* the path in the reference and continues evaluating the remaining keys and the path at the location referred to by the path in the reference. In the next section we will explain how models evaluate paths against JSON and JSON Graph objects.

### Path Evaluation and JSON Graph

When evaluating paths against a serial object, the Falcor model starts at the root of its associated JSON object and continues looking up keys until it arrives at a value type.

(Example of looking up a path using get value)

If a value type is encountered before the path is fully evaluated, the path evaluation process is short-circuited and the value discovered is returned.

(example of what I said above, this time running into a null at a branch node)

The one exception to this rule is the case in which  a Model encounters a **Reference** value type. When a Model encounters a reference while evaluating a path, it behaves differently than does if it encounters any other value type. If a Model encounters a reference before evaluating all of the keys in a path, the unevaluated keys are appended to the path within the reference and evaluation is resumed from root of the JSON object.

In the following piece of code, we attempt to retrieve the name of the first TODO:

(Get value todos, 0, name)

First the model evaluates the keys "todo" and "0" and encounters a reference value. However instead of short-circuiting and returning the reference value, the Model resumes evaluation from the location in the JSON referred to in the reference path. This is accomplished by dynamically rewriting the path from "todos[0].name" to "todosById[2692].name" and resuming evaluation from the root of the JSON object. 

Note that **references are only followed if there are more keys in the path that have not yet been evaluated.** If we shorten the path to "todos[0]" the model returns the reference path rather than the object it refers to.

(Example of what I said above printed to the console)

The process of rewriting a path when a reference is encountered is known as *Path Optimization.* for more information on how Path Optimization can improve the efficiency of server-side data retrieval, see Path Optimization.

### JSON Graph Atoms and Errorsa

In addition to References, cereal graph introduces two additional value types which can be retrieved from the Model:

1. Atoms
2. Errors

#### JSON Graph Atoms

Cereal graph allows a  metadata to be attached to values to control how they are handled by the Model. For example, metadata can be attached to values to control how long they stay in the cache and also to indicate whether one value is a more recent version than another.

Notice in the JSON document above
1. atom
2. error
3. reference



```
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
```

The following paths are legal to retrieve because although atoms, errors, and references are considered value types in JSON Graph:

```
model.getValue("todos[0].customer").then(log); 
// prints {name: "Jim Hobart", address:"123 pacifica ave., CA, US"} because the value of an Atom is considered a value
```

"Why can't I retrieve arrays and objects from Model?"

Instead you must be explicit, and request all of the value types that you need.
  
In addition to the JavaScript path syntax, models can also process paths with ranges in indexers:

```
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
```
 
Models allow you to select as many paths as you want in a single network request.
 
```
model.get('todos[0..1].name', 'todos[0..1].done').then(log);
```

The paths in the previous example can be simplified to one path, because in addition to allowing ranges in indexers, Falcor models also allow multiple keys to be passed in a single indexer:

```
model.get('todos[0..1]["name", "done"]').then(log);
```

Do you get method also except optional selector function, which can be used to transform the data retrieved from the server before...
 
One of the limitations of working with JSON data through a Falcor model is that you can only retrieve values.
 
 ## Supported Metadata

## Transactions

## Error Handling

## Cache Control

## Path Optimization and the DataSource

When you request a path from a Model, the Model first attempts to retrieve the data from an in-memory cache. If the model fails to find the data in its cache, the Model request the data from its data source.

Typically a path that has been optimized can be retrieved more efficiently by the Model's DataSource because it requires fewer steps through the graph to retrieve the data. 


When attempting to retrieve paths from the cache, Models optimize paths whenever they encounter references. This means that even if a model is not able to find the requested data in its local cash, it may be able to request a more optimized path from the data source.
