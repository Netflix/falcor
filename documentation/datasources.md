---
layout: toc-page
title: Data Sources
id: data_sources
lang: en
---

* Table of contents. This line is required to start the list.
{:toc}

<a name="Data-Sources"></a>

# Data Sources

A DataSource is an interface which can be implemented to expose [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) information to a [Model](http://netflix.github.io/falcor/documentation/model.html). Every DataSource is associated with a single [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object. [Models](http://netflix.github.io/falcor/documentation/model.html) execute [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) operations (get, set, and call) to retrieve values from the DataSource's [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object. DataSources may retrieve JSON Graph information from anywhere, including device memory, a remote machine, or even a lazily-run computation.

![DataSource Diagram](./datasource.png)

## DataSource Operations

DataSources implement the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) operations:

* get
* set
* call

Each [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) operation is executed asynchronously, resulting in an Observable of JSONGraphEnvelope. Unlike the [Model](http://netflix.github.io/falcor/documentation/model.html), DataSources do *not* support [Path Syntax](http://netflix.github.io/falcor/documentation/paths.html#path-syntax-strings). DataSources can only accept [Path Arrays and PathSet Arrays](http://netflix.github.io/falcor/documentation/paths.html#path).

### The get Method

The `get` method on the DataSource interface executes the abstract [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) get operation on the DataSource's associated [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object.

~~~js
interface DataSource {
  get(pathSets: Array<PathSet>): Observable<JSONGraphEnvelope>
}
~~~

To demonstrate the `get()` method in action, we'll create a DataSource by adapting a [Model](http://netflix.github.io/falcor/documentation/model.html) with an in-memory cache to the DataSource interface using the `asDataSource()` method.

~~~js
var dataSource =
    new falcor.Model({
        cache: {
            todos: [
                { $type: "ref", value: ['todosById', 44] },
                { $type: "ref", value: ['todosById', 54] },
                { $type: "ref", value: ['todosById', 97] }
            ],
            todosById: {
                "44": {
                    name: 'get milk from corner store',
                    done: false,
                    prerequisites: [
                        { $type: "ref", value: ['todosById', 54] },
                        { $type: "ref", value: ['todosById', 97] }
                    ]
                },
                "54": { name: 'withdraw money from ATM', done: false },
                "97": { name: 'pick car up from shop', done: false }
            }
        }
    }).asDataSource();
~~~

Here is an example which requests the name and status of the first two prerequisites of the first task in a TODO list.

~~~js
var response = dataSource.get([
    ["todos", 0, ["name", "done"]],
    ["todos", 0, "prerequisites", { from: 0, to: 1 }, ["name", "done"]]
]);

response.subscribe(jsonGraphEnvelope => JSON.stringify(jsonGraphEnvelope, null, 4); });
// eventually prints...
// {
//     jsonGraph: {
//         todos: {
//             0: { $type: "ref", value: ["todosById", 44] },
//         },
//         todosById: {
//             44: {
//                 name: 'get milk from corner store',
//                 done: false,
//                 prerequisites: [
//                     { $type: "ref", value: ['todosById', 54] },
//                     { $type: "ref", value: ['todosById', 97] }
//                 ]
//             },
//             "54": { name: 'withdraw money from ATM', done: false },
//             "97": { name: 'pick car up from shop', done: false }
//         }
//     }
// }
~~~

### The set Method

The `set` method on the DataSource interface executes the abstract [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) set operation on the DataSource's associated [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object.

~~~js
interface DataSource {
  set(JSONGraphEnvelope): Observable<JSONGraphEnvelope>
}
~~~

To demonstrate the `set()` method in action, we'll create a DataSource by adapting a [Model](http://netflix.github.io/falcor/documentation/model.html) with an in-memory cache to the DataSource interface using the `asDataSource()` method.

~~~js
var dataSource =
    new falcor.Model({
        cache: {
            todos: [
                { $type: "ref", value: ['todosById', 44] },
                { $type: "ref", value: ['todosById', 54] },
                { $type: "ref", value: ['todosById', 97] }
            ],
            todosById: {
                "44": {
                    name: 'get milk from corner store',
                    done: false,
                    prerequisites: [
                        { $type: "ref", value: ['todosById', 54] },
                        { $type: "ref", value: ['todosById', 97] }
                    ]
                },
                "54": { name: 'withdraw money from ATM', done: false },
                "97": { name: 'pick car up from shop', done: false }
            }
        }
    }).asDataSource();
~~~

Here is an example which sets the status of both prerequisites of the first task in a TODO list to `done`.

~~~js
var response = dataSource.set({
  paths: [
    ["todos", 0, "prerequisities", { to:1 }, "done"]
  ],
  jsonGraph: {
    todos: {
      0: {
        prerequisites: {
          0: {
            done: true
          },
          1: {
            done: true
          }
        }
      }
    }
  }
});

response.subscribe(jsonGraphEnvelope => JSON.stringify(jsonGraphEnvelope, null, 4); });
// eventually prints...
// {
//     jsonGraph: {
//         todos: {
//             0: { $type: "ref", value: ["todosById", 44] },
//         },
//         todosById: {
//             44: {
//                 prerequisites: [
//                     { $type: "ref", value: ['todosById', 54] },
//                     { $type: "ref", value: ['todosById', 97] }
//                 ]
//             },
//             "54": { name: 'withdraw money from ATM', done: true },
//             "97": { name: 'pick car up from shop', done: true }
//         }
//     }
// }
~~~

### The call Method

The `call` method on the DataSource interface executes the abstract [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) call operation on the DataSource's associated [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object. The `call` method invokes a single function located inside of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object.

Functions are useful for non-idempotent operations which cannot be performed using `get` or `set` (ex. like adding to a list). Using a Function is appropriate when the application is performing a transactional operation that cannot be represented as a series of set operations.

[JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) Functions can _not_ return transient data (ex. 2 + 2 = 4). A [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) function can only return a JSONGraphEnvelope containing a subset of the data in its `this` object (the object which contains the function as a member).

When a Function returns a JSONGraphEnvelope, it *must* include a `paths` key which contains [PathSet Arrays or Path Arrays](http://netflix.github.io/falcor/documentation/paths.html#path) that point to all of the values within the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) subset in the `jsonGraph` key. This is necessary, because unlike get in and set, the client has no way of predicting what subset of [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) data will be sent back to the client from the server.

One of the hazards of invoking functions is that they may change any number of values in a client's [Model](http://netflix.github.io/falcor/documentation/model.html) cache. Functions also include an `invalidated` key in their JSONGraphEnvelope result which contains all of the [paths](http://netflix.github.io/falcor/documentation/paths.html) to be invalidated within the [Model](http://netflix.github.io/falcor/documentation/model.html) cache.

~~~js
interface DataSource {
  call(callPath: Path, args: Array, refPaths: Array<PathSet>, thisPaths: Array<PathSet>): Observable<JSONGraphEnvelope>
}
~~~


Note that one invocation of call can only run a single function. The callPath argument is the path to the function within the DataSource's JSON Graph object. The args parameter is the array of arguments to be passed to the function being called.

The refPaths argument is the array of PathSets to retrieve from the JSON Graph References within the function response. The dataSource appends these pathSets to any JSON Graph References that appear within the function response, and adds the values to the JSONGraphEnvelope. Typically, refPaths are used when the function creates a new object and returns a reference to that object. The refPaths can be passed to the call method in order to allow fields to be retrieved from the newly-generated object without the need for a subsequent get operation.

A function is not obligated to return all of the changes that it makes to its `this` object. On the contrary, functions typically return as little data as possible by default. The thisPaths argument is the array of PathSets to retrieve from the function's `this` object after the function has completed execution. The DataSource adds these values to the JSONGraphEnvelope before returning the function's response.



Instead of forcing functions to return all of the changes they make to the JSON Graph object, DataSources allow callers to define exactly which values they would like to refresh after successful function execution. To this end, callers can provide refPaths and thisPaths to the DataSource's call method along with the function path. After the DataSource runs the function, it retrieves the refPaths and thisPaths and adds them to the JSON Graph response.

After the refPaths have been evaluated against any JSON Graph References returned by the function and added to the JSONGraphEnvelope Response, each PathSet in the thisPaths array is evaluated on the function's `this` object. The resulting values are added to the JSON Graph Response returned by the DataSource's call method.

To demonstrate the `call()` method in action, we'll create a [Router](http://netflix.github.io/falcor/documentation/router.html) DataSource that allows titles to be pushed into a Netflix member's list.

We can invoke the `myList.push` function on the Router like so:

~~~js
router.
  call(
    // the callPath
    ["myList", "push"],
    // the args array containing the reference to the title to add to the list
    [{ $type: "ref", value: ["titlesById", 4792] }],
    // retrieve the name of the newly-added title using a refPath
    [
      ["name"]
    ],
    // retrieve the length of the list after the function has completed
    [
      ["length"]
    ]).
  subscribe(function(jsonGraphEnvelope) {
    console.log(JSON.stringify(jsonGraphEnvelope, null, 2);
  });
~~~

Here is the definition of the `myList.push` function in our Router DataSource:

~~~js
var dataSource = new Router([
 {
        route: 'myList.push',
        call: function(callPath, args) {

            // retrieving the title id from the reference path:
            titleId = titleRef.value[1];
            if (parseInt(titleId, 10).toString() !== titleId.toString())
                throw new Error("invalid input");

            return myListService.
                addTitle(titleId).
                then(function(length) {
                    return [
                        {
                            path: ['myList', length - 1],
                            value: titleRef
                        },
                        {
                            path: ['myList', 'length'],
                            value: length
                        }
                    ];
                });
        }
    }
]);
~~~

The Router handler converts the array of PathValues returned by the function into the following JSONGraphEnvelope:

~~~js
{
  jsonGraph: {
    myList: {
      7: { $type: "ref", value: ["titlesById", 4792] }
    }
  },
  paths: [ ["myList", 7] ]
}
~~~

When we called the function, we used the refPaths argument to specify that we wanted to retrieve `["name"]` from all of the JSONGraph References in the function response. Therefore, the Router DataSource evaluates the `["myList", 7, "name"]` and adds the value to the JSONGraphEnvelope:

~~~js
{
  jsonGraph: {
    myList: {
      7: { $type: "ref", value: ["titlesById", 4792] }
    },
    titlesById: {
      4792: {
        name: "House of Cards"
      }
  },
  paths: [ ["myList", 7, "name"] ]
}
~~~

Finally, the Router looks up `["length"]` on the list object and adds the value to the JSONGraphEnvelope.

~~~js
{
  jsonGraph: {
    myList: {
      7: { $type: "ref", value: ["titlesById", 4792] },
      length: 8
    },
    titlesById: {
      4792: {
        name: "House of Cards"
      }
  },
  paths: [ ["myList", 7, "name"], ["myList", 7, "length"] ]
}
~~~

## Why Implement a DataSource?

The most common reason for implementing a DataSource is to allow data to be retrieved from the network using a specific transport protocol. The falcor library ships with the HttpDataSource, which only supports retrieving [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) information from the network using the HTTP/HTTPS protocol.

## DataSource Implementations

Falcor ships with the following DataSource implementations:

* HttpDataSource
* Router (server only)
* ModelDataSource

## Reference Implementation

Here is a [reference implementation](https://github.com/Netflix/falcor/blob/master/examples/datasource/webWorkerSource.js) of a DataSource which retrieves information from a [Model](http://netflix.github.io/falcor/documentation/model.html) running in a WebWorker.
