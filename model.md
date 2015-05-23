# The Falcor Model
 
Falcor provides a Model object, which is intended to be the "M" in your MVC. An application that uses Falcor doesn't work with JSON data directly, but rather works with JSON data _indirectly_ through the Model object. The Model object provides a set of familiar JavaScript APIs for working with JSON data, including get, set, and call. The main difference between working with JSON data directly and working with it indirectly through a Model object, is that the Falcor Model has a _push API_.

```JavaScript
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

Note that in the example above, the name of the TODO is _pushed_ to a call back.
 
The main advantage of using a push API is that you can code against JSON data the same way regardless of whether the data is local or remote. This makes it very easy to begin coding your application against mocked data at first, and then work against server data later on without changing client code.

In this example we retrieve the name of the first TODO from a JSON Object: 

```JavaScript
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

In this code sample the data has been moved to the cloud, but the client code that retrieves the data remains the same:

```JavaScript
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(log);
```

Another advantage of using a Falcor Model is that it caches the JSON data it retrieves from the server _in-memory_. As a result, you don't need to maintain a cache of the data that you retrieve from a Falcor Model. Whenever you need data, just retrieve it from the Model. If the Model finds the data in its cache, it will push the data to you immediately. Otherwise the Model will retrieve your data from the server, insert it into the cache, and push it to you asynchronously.
 
```JavaScript
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(function() {
    // This request is served out of the local cache:
    model.getValue('todos[0].name').then(log);
});
```

In addition to JSON data the Falcor model also supports JSON Graph. JSON Graph is a convention for modeling graph information in JSON. JSON graph can help you ensure that the same object never appears more than once in either server responses or the Model cache. This means you never need to worry about propagating changes to multiple copies of the same object.
 
```JavaScript
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
 
Every Falcor Model is associated with a JSON value. Models use DataSources to retrieve the data from their associated JSON values. Falcor ships with HttpDataSource, an implementation of the DataSource interface which remotes requests to another DataSource running on an HTTP server (usually a Router).
 
```JavaScript
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});
```

You can implement the DataSource interface to allow a Model to communicate with a remote JSON object over a different transport layer (ex. web sockets).

If a Model does _not_ have a DataSource, all Model operations will be performed on the Model's local cache. When you initialize the Model, you can provide it with JSON data to prime its local cache.
 
```JavaScript
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
 
```JavaScript
var log = console.log.bind(console)

var model = new falcor.Model({
    source: new falcor.HttpDataSource('/model.json'),
});

model.getValue('todos[0].name').then(log);
```

When data is retrieved from a DataSource, it is placed into the Model's local cache. Subsequent requests for the same information will not trigger a request to the DataSource if the data has not been purged from the local cache.

```JavaScript
// Does not trigger a request to the server.
model.getValue('todos[0].name').then(log);
```

For more information on how the Model JSON cache works, see The Model Cache.

# Working with JSON data using a Model

Every Model is associated with a JSON value. The Falcor Model provides APIs to allow developers to retrieve data from its JSON value. To retrieve a single value from a Model, you pass a JavaScript path through the JSON object to the Model's get method.

```JavaScript
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

## Retrieving Values from a Falcor Model

The following JSON object contains a list of TODOs.

```JavaScript
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

```JavaScript
var customer = json.todos[1].customer;
log(JSON.stringify(customer, null, 4))

// This outputs the following to the console:
// customer: {
//    name: 'Jim Hobart'
//    address: '123 pacifica ave., CA, US'
// }
```

When working with the same JSON object indirectly through a Falcor Model, you can _not_ retrieve Arrays or Objects - only value types like null, string, boolean, and number.

```JavaScript
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache:json});

model.getValue("todos[1].customer").then(function(customer) { log(customer); }); // undefined behavior
```

The only paths which can be retrieved from the Model above are those that retrieve the basic JSON value types. That means any of the following paths are legal to retrieve from a Model:

```JavaScript
model.getValue("todos[0].name").then(log); // prints "get milk from the corner store"
model.getValue("todos[0].done").then(log); // prints "false"
model.getValue("todos[1].customer.name").then(log); // prints "Jim Hobart"
model.getValue("todos[1].priority").then(log); // prints 4
```

In contrast the following get operation has _undefined behavior_ because it attempts to retrieve the entire "todos" Array:
```JavaScript
model.getValue("todos").then(log); // undefined behavior
```

Likewise of the following get operation also has undefined behavior, because it retrieves an entire customer object:
```JavaScript
model.getValue("todos[1].customer").then(log);  // undefined behavior
```

The requests above can not reliably be expected to return data. Therefore you should never request an Object or an Array from a Falcor Model.

### "Why can't I request Objects or Arrays from a Model?"

_Falcor is optimized for displaying information to human beings in real-time._ Both Arrays and Objects can contain an unbounded amount of data. This means it’s impossible to predict how much data will be retrieved from the server when you request a JSON Array or Object. An Array that contains 5 items today, can grow to contain 10,000 items later on. This means that Requests which are initially served quickly can become slower over time as more data is added to backend data stores.  This can cause the performance of your application to degrade slowly over time. 

Models force developers to be explicit about which value types they would like to retrieve in order to maximize the likelihood that server requests for data will have **stable performance** over time. Rather than allow you to retrieve an entire Object, Model's force you to _be explicit_ and retrieve only those values needed in a given scenario:

(Example of requesting three properties and displaying them)
```JavaScript
var model = new falcor.Model({
    cache: {
        todos: [
            {
                name: 'get milk from corner store',
                done: false,
                priority: 4
            }
        ]
    }});

model.get('todos[0]["name", "done", "priority"]').
	then(function(x) { console.log(JSON.stringify(x, null, 4)); });
```

Similarly when displaying an Array of items Models do not allow you to retrieve the entire Array upfront. Instead you must request the first visible page of an Array, and follow up with additional page requests as the user scrolls.

(Example of retrieving first page of a list)
```JavaScript
var model = new falcor.Model({
    cache: {
        todos: [
            {
                name: 'get milk from corner store',
                done: false
            },
            {
                name: 'withdraw money from ATM',
                done: false
            }            
        ]
    }});

model.get('todos[0]["name", "done"]').
	then(function(x) { console.log(JSON.stringify(x, null, 4)); });
```

If you are certain that an Object or Array will remain a constant size, you can indicate to a Model that they should always be retrieved in their entirety by using an Atom. For more information, see [JSON Graph Atoms](#JSON-Graph-Atoms).

## Working with JSON Graph Data using a Model

In addition to being able to work with JSON documents, Models can also operate on JSON Graph documents. JSON Graph is a convention for modeling graph information in JSON. JSON Graph documents extend JSON with **References**. References can be used anywhere within a JSON object to refer to a value elsewhere within the same JSON object. This removes the need to duplicate objects when serializing a graph into a hierarchical JSON object.

Let's say that we wanted to introduce a list of prerequisites for each TODO in a TODO list.  
```JavaScript
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

```JavaScript
json.todos[1].done = true;
```

If we examine the JSON object after this change, we will notice that the change has _not_ been propagated to all of the copies of the task. Because the same task also appears in the prerequisites array of task 2692, its "done" value remains false.

```JavaScript
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

1. Move all objects to a unique location within the JSON object
2. Replace all other occurrences of the object with a **Reference** to that object's unique location

We can use the task ID to create a unique location in the JSON for each task. We start by adding a map of all Tasks that is organized by Task ID to the root of the document:

(Example of tasks by ID)

Next we replace every other occurrence of each task with a Reference value. A Reference is a JSON object that contains a path to another location within an object. References can be constructed using the Model.ref factory function. 

(Example that shows references)

Although a Reference is a JSON object, it is treated as a value type by the Model. In other words it is legal to retrieve a reference from a Falcor Model.

(Example that shows retrieving a reference for a Falcor model)

Note that in the example above each TODO appears only once. If we use a Model to set a TODO to false we will observe that the new state will be reflected regardless of where in the JSON Graph we retrieve the TODO's information.

(Example demonstrating that when we use set value to set the done property of the second two due to false, we get done:true when we read it from both places in the to do list)

Note that in the example operations above we use a path which extends *beyond* the reference object in the JSON Graph. However instead of short-circuiting and returning the reference, the Model *follows* the path in the reference and continues evaluating the remaining keys and the path at the location referred to by the path in the reference. In the next section we will explain how models evaluate paths against JSON and JSON Graph objects.

### Path Evaluation and JSON Graph

When evaluating paths against a JSON object, the Falcor model starts at the root of its associated JSON object and continues looking up keys until it arrives at a value type.

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

### JSON Graph Sentinels

In addition to References, JSON graph introduces two more new value types: Atoms and Errors. These three special value types are all classified as *Sentinels.*

Sentinels are JSON objects that are treated by the Falcor Model as value types. References, Atoms, and Errors are all JSON objects with a "$type" value of "ref", "atom", and "error" respectively. 

(Example of a reference, atom, and error.)

Each Sentinel objects also contains a "value" key with its actual value. One way to think about a Sentinel is a *box around a value*  that indicates the type of the value within. Sentinels influence the way that Models interpret their values, allowing them to distinguish a path from a string or an regular object from an error for example.

Despite being JSON objects, all Sentinels are considered JSON Graph value types and therefore can be retrieved from a Model. However when a Sentinel is retrieved from a Model, the Model *unboxes* the value within the Sentinel and returns the value instead of the entire Sentinel object.

(Example of calling get value on an Atom)

You can create a new Model which does not have this unboxing behavior by calling "boxValues." 

(Example of calling get value on an Atom with boxValues on)

For more information see Boxing and Unboxing.

As sentinels are value types, their contents cannot be changed. Like numbers and strings, they must be replaced entirely.

(Example of Setting an Atom in the cache)

Each Sentinel affects the way in which the Model interprets its value differently. References were explained in the previous section. In the next two sections, Atoms and Errors will be explained.

#### JSON Graph Atoms <a name="JSON-Graph-Atoms"></a>

JSON Graph allows metadata to be attached to values to control how they are handled by the Model. For example, metadata can be attached to values to control how long values stay in the Model cache and indicate whether one value is a more recent version of another value. For more information see Sentinel Metadata.

One issue is that JavaScript value types do not preserve any metadata attached to them when they are serialized as JSON:

(Example of creating a JavaScript number, attaching an "$expires" property to it, and then Json stringifying it)

Atoms "box" value types inside of a JSON object, allowing metadata to be attached to them. 

(Example of creating a atom with a value of 4 and an "$expired property and then serializing)

The value of an Atom is always treated like a value type, meaning it is retrieved and set in its entirety. Mutating an Adam is ineffectual. Instead you must replace it entirely using the Model's set operation.

(Example showing that it is ineffectual to modify the value of an atom directly. We clone Adams when they are retrieved from the model, so this example should show that mutating an Adam directly has no effect by then retrieving the same object, and displaying it's data which will be unchanged)

In addition to making it possible to attach metadata to JSON values, Atoms can be used to get around the restriction against retrieving JSON Objects and Arrays from a Falcor Model. 

Let's say that we have an Array which we are certain will remain small, like a list of video subtitles for example. 

(Example of a JSON graph object with a Netflix title which contains an array of subtitles)

By boxing the Array in an Atom, we cause the Falcor model to treat it as a value and returned it in its entirety. 

(Example of retrieving the entire array using a  model)

Internally the Model boxes all retrieved values that have been successfully retrieved from the data source before storing these values in its local cache.

#### JSON Graph Errors

When a model's DataSource encounters an error while attempting to retrieve a value from a JSON Graph object, it is represented as an error object. 

(Example of an error when attempting to retrieve the rating of a Netflix title from a model)

By default a Model delivers Errors differently than other values. If synchronous methods are used to retrieve the data from the model, the error is thrown.  If the data is asynchronously being requested from the model as a observable or a promise, the error will be delivered in a special call back.

(Example of receiving an error in an observable)

(Example of receiving an error in a promise)

To learn more about the different ways to retrieve information from a model, see Retrieving Data from a Model.

##### "What if I don't want a Model to treat errors differently from other values?"

There are many reasons why you might want errors reported the same way as other values. For example you might retrieve several paths from a model in a single request, and want to be resilient against the possibility that one of them fails. Furthermore you might want to display errors in a template alongside successfully-retrieved values. 

The "treatErrorsAsValues" function creates a new Model which reports errors the same way as values. 

(Example of retrieving a single error from a JSON graph using get value)

Note that using "treatErrorsAsValues" will cause the model to deliver errors as values. However it will not provide you with a way to distinguish errors from values. If you would like to be able to receive errors alongside values, but retain the ability to distinguish between errors and values, you can chain "treatErrorsAsValues" and "boxValues" together. When I model is operating in "boxValues" mode, it always returns the sentinels that box each value and indicate their type. 

(Identical example as above, except this time we also call box values in addition to treat errors as values)

When you receive a Sentinel, you can check the "$type" property of each sentinel to distinguish whether a value is an error ("error") or a successfully-retrieved value ("atom"). For more information see Boxing and Unboxing.

 #### Sentinel Metadata

Metadata can be attached to Sentinels to control the way the Model handles them once they have been retrieved from the data source. Metadata is any key that starts with the prefix "$".

(Example of using setValue to add an atom that expires in two seconds  ($expires: -2000) and then attempting to retrieve it after four seconds only to prove that it is gone)


## Retrieving Data from a Model

(Example of using get value sync to retrieve the rating)

Errors are cached in the Model just like any other value. As it is possible to retrieve more than one path at a time from a model,
```JavaScript
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

The following paths are legal to retrieve because  atoms, errors, and references are considered value types in JSON Graph:

```JavaScript
model.getValue("todos[0].customer").then(log); 
// prints {name: "Jim Hobart", address:"123 pacifica ave., CA, US"} because the value of an Atom is considered a value
```

"Why can't I retrieve Arrays or Objects from a Model?"

Instead you must be explicit, and request all of the value types that you need.
  
In addition to the JavaScript path syntax, models can also process paths with ranges in indexers:

```JavaScript
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
 
```JavaScript
model.get('todos[0..1].name', 'todos[0..1].done').then(log);
```

The paths in the previous example can be simplified to one path, because in addition to allowing ranges in indexers, Falcor models also allow multiple keys to be passed in a single indexer:

```JavaScript
model.get('todos[0..1]["name", "done"]').then(log);
```

Do you get method also except optional selector function, which can be used to transform the data retrieved from the server before...
 
One of the limitations of working with JSON data through a Falcor model is that you can only retrieve values.
 
 ## Boxing and Unboxing
 
 
 
 ## Sentinel Metadata

Metadata can be attached to value types to control the way the Model handles them once they have been retrieved from the data source. Metadata can be to any JSON object as a key that starts with the prefix "$". Note that any keys set on JSON value types (string, number, boolean, and null) will not persist when serialized to JSON. 

(Example of attaching a metadata key to a JavaScript number, and then JSON stringifying it only to discover that the key is missing.)

Therefore in order to add metadata to JSON value types, the value types must be boxed in an atom. For more information on Atoms see JSON Graph Atoms.




For more information on sentinels, see JSON Graph Sentinels.


## Transactions

A Model automatically collects least-recently-used items in the local cache when the size of the cache breaches the Model's maximum cache size. However the Model also attempts to ensure that data that is currently being delivered 
A transaction is a period of time during which no cache collections occur. 

When you request data from a Falcor model, any request the data that is not in the local cash is retrieved from the data source, added to the cash, and then pushed to a callback.  By default, a transaction begins when the data is written to the cache and ends when the callback function has finished executing.

The Falcor model uses push APIs to deliver data, giving it the flexibility to retrieve data from the data source if it is not synchronously available in the Model's cache. Under normal circumstances the model does not allow synchronous access to the cache. The reason why don't you just cannot be synchronously retrieved from the model cash is that there is no way for a developer to ascertain whether a model a value is undefined or simply not present in the cash.


There are a several Model methods which can _only_ be called within a transaction. These methods end in the suffix "Sync", because they are both _synch_ronous and _sync_hronized, meaning they synchronously retrieve data from the model cache but throw if not run within a transaction. 

Synchronized methods allow you to synchronously read data directly from the Falcor cache. 




## Error Handling

## Cache Control

## The Model Cache

## Schedulers

## Path Optimization and the DataSource

When you request a path from a Model, the Model first attempts to retrieve the data from an in-memory cache. If the model fails to find the data in its cache, the Model request the data from its data source.

Typically a path that has been optimized can be retrieved more efficiently by the Model's DataSource because it requires fewer steps through the graph to retrieve the data. 


When attempting to retrieve paths from the cache, Models optimize paths whenever they encounter references. This means that even if a Model is not able to find the requested data in its local cache, it may be able to request a more optimized path from the data source.
