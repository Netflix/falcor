---
layout: toc-page
title: Router
id: router
lang: en
---

* Table of contents. This line is required to start the list.
{:toc}

# The Falcor Router

A Falcor Router is an implementation of the [DataSource](http://netflix.github.io/falcor/documentation/datasources.html) interface. Falcor [Model](http://netflix.github.io/falcor/documentation/model.html) objects use [DataSource](http://netflix.github.io/falcor/documentation/datasources.html)s to retrieve [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) data. However [Model](http://netflix.github.io/falcor/documentation/model.html)s typically run on the client and Routers typically run on the Application server. As a result communication between a [Model](http://netflix.github.io/falcor/documentation/model.html) and the Router is typically remoted across the network using an HttpDataSource.

![Falcor End to End](../falcor-end-to-end.png)

A Router works by matching requested [paths](http://netflix.github.io/falcor/documentation/paths.html) against a "virtual" [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object. The [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object is referred to as "virtual", because the object rarely exists anywhere - in memory or on disk. Instead when [paths](http://netflix.github.io/falcor/documentation/paths.html) are requested from the Router, the Router typically creates the necessary subsets of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) on-demand by retrieving the necessary data from persistent data stores. Once the newly-created subset of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) has been delivered to the caller, the Router frees the memory. This allows the Application Server running the Router to remain stateless, and keep the application's data in one or more persistent data stores.

In order to create the requested subset of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object, the Router matches the requested [paths](http://netflix.github.io/falcor/documentation/paths.html) against a series of Routes. A Route is an object with a pattern that can match a set of [paths](http://netflix.github.io/falcor/documentation/paths.html), and is responsible for creating the subset of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object which contains the data requested by those [paths](http://netflix.github.io/falcor/documentation/paths.html). Typically Routes build a subset of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object on-demand by retrieving the data from persistent data stores or web services. The Route transforms the data retrieved from the data sources into the the schema of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html), and delivers it to the Router. Once the Router receives the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) subset from the Route, it evaluates the [paths](http://netflix.github.io/falcor/documentation/paths.html) against the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) subset using the (Path Evaluation) algorithm. If the router encounters References in the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html), it may optimize the requested [paths](http://netflix.github.io/falcor/documentation/paths.html), and recursively evaluate them against the Routes. The Router's final output is the subset of virtual [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) that combines all the responses produced by the evaluated the requested [paths](http://netflix.github.io/falcor/documentation/paths.html) against the Routes.

## When to use a Router

The Router is appropriate as an abstraction over a service layer or REST API. Using a Router over these types of APIs provides just enough flexibility to avoid client round-trips without introducing heavy-weight abstractions. Service-oriented architectures are common in systems that are designed for scalability. These systems typically store data in different data sources and expose them through a variety of different services. For example Netflix uses a Router in front of its [Microservice architecture](http://techblog.netflix.com/2015/02/a-microscope-on-microservices.html). 

**It is rarely ideal to use a Router to directly access a single SQL Database**. Application's that use a single SQL store often attempt to build a single SQL Query for every server request. Router's work splitting up requests up for different sections of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) document into seperate handlers and sending individual requests to services to retrieve the requested data. As a consequence Router's rarely have sufficient context to produce a single optimized SQL query. We are currently exploring different options for supporting this type of data access pattern in Falcor in future.

## Contrasting a REST Router with a Falcor Router 

Falcor Routers serve the same purpose as Routers for RESTful endpoints: they allow app servers to remain stateless by retrieving requested data from persistent data stores on-demand. However a Falcor Router differs from the Router used by RESTful application servers in a few ways in order to accommodate the unique way in which Falcor app servers expose their data.

There are three primary differences between a traditional Application Router and a Falcor Router.

### 1. Falcor Routers match JSON paths, not URL Paths

Instead of matching patterns in URLs, the Falcor Router matches patterns in the [paths](http://netflix.github.io/falcor/documentation/paths.html) requested in the query string of the single JSON resource.

~~~js
http://.../model.json?paths=[["todos","name"],["todos","length"]]
~~~

~~~js
var Router = require("falcor-router");
var router = new Router([
    {
        route: 'todos.name',
        get: function(pathSet) {
            return todosService.
                getTodoList().
                then(function(todoList) {
                    return { path: ["todos", "name"], value: todoList.name };
                });
        }
    },
    {
        route: 'todos.length',
        get: function(pathSet) {
            return todosService.
                getTodoList().
                then(function(todoList) {
                    return { path: ["todos", "length"], value: todoList.length };
                });
        }
    }
]);
~~~

### 2. A Single Falcor Route Can Match Multiple Paths

Traditional App server Routers only need to match the URL path, because HTTP requests are designed to retrieve a single resource. In contrast a single HTTP request to a Falcor application server may contain multiple [paths](http://netflix.github.io/falcor/documentation/paths.html) in the query string. As a result a single Falcor route can match multiple [paths](http://netflix.github.io/falcor/documentation/paths.html) at once. Matching multiple [paths](http://netflix.github.io/falcor/documentation/paths.html) in a single route can be more efficient in the event they can be retrieved with a single backend request.

The following request attempts to retrieve the name and length of the todos list:

~~~js
http://.../model.json?paths=[["todos",["name", "length"]]]
~~~

The following route will match both [paths](http://netflix.github.io/falcor/documentation/paths.html) and handle them at the same time:

~~~js
var Router = require("falcor-router");
var router = new Router([
    {
        route: 'todos["name","length"]',
        get: function(pathSet) {
            return todosService.
                getTodoList().
                then(function(todoList) {
                    return pathSet[1].map(function(key) {
                        return { path: ["todos", "name"], value: todoList.name };
                    });
                });
        }
    }
]);
~~~

The route above retrieves the data for multiple [paths](http://netflix.github.io/falcor/documentation/paths.html) using a single request to a webservice, and returns the results as a Promise of several path/value pairs.

~~~js
[
    { path: ["todos", "name"], value: "Stuff to do today" },
    { path: ["todos", "length"], value: 10 }
]
~~~

The Router accepts all of these path/value pairs, adds them to a single JSON object, and then sends it back to the client as the response.

~~~js
{
    "jsonGraph": {
        "todos": {
            "name": "Stuff to do today",
            "length": 10
        }
    }
} 
~~~

### 3. Falcor Routers can Retrieve Related Resources Without a Roundtrip

In addition to allowing multiple values to be retrieved in a single request, Falcor routers can also traverse entity relationships and retrieve related values within the same request.

REST APIs often expose different kinds of resources at different end points. These resources often contain hyperlinks to related resources. For example the following endpoint /todos returns a JSON array of hyperlinks to task resources:

~~~js
[
    "/task/8964",
    "/task/5296",
    "/task/9721"
]
~~~

RESTful clients traverse entity relationships by making follow-up requests for the resources at these hyperlinks. 

![Server Roundtrips](../images/server-roundtrips.png)

Unlike RESTful servers, Falcor Application servers expose all of an application's domain data as a single [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) resource. Within a the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) resource, entity relationships are expressed as references to other entities in the same resource rather than hyperlinks to different resources. 

When Falcor clients request [paths](http://netflix.github.io/falcor/documentation/paths.html) to values within the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) resource, Falcor Routers follow the Path Evaluation Algorithm and automatically traverse any references encountered along the path provided by the client.

For example the following path retrieves a reference to the first task object in a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) resource, much the same way as the RESTful /todos resource contains hyperlinks to task resources. 

~~~js
http://.../model.json?paths=[["todos",0]]
~~~

The server responds with the following JSONGraphEnvelope:

~~~js
{
    "jsonGraph": {
        "todos": {
            "0": { $type: "ref", value: ["todosById", 8964] }
        }
    }
} 
~~~

However if the path is altered to retrieve keys from the entity located at the reference, the Falcor Router traverses the reference on the server and retrieves the values from the entity located at the reference path. The result is a fragment of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object which contains all of the references encountered during path evaluation as well as the requested value.

~~~js
http://.../model.json?paths=[["todos",0,"name"]]
~~~

The server responds with the following JSONGraphEnvelope:

~~~js
{
    "jsonGraph": {
        "todos": {
            "0": { $type: "ref", value: ["todosById", 8964] }
        },
        "todosById": {
            "8964": {
                "name": "get milk from corner store."
            }
        }
    }
} 
~~~

## Creating a Router Class
 
A Router Class is created by invoking the Router.createClass method. This Class factory method accepts an Array of Route objects. Each Route object contains a path pattern, and an optional series of handlers for the various [DataSource](http://netflix.github.io/falcor/documentation/datasources.html) methods: get, set, and call.
 
~~~js
var Router = require("falcor-router");

// Create a Router base class
var BaseRouter = Router.createClass([
    {
        route: 'todos[{integers:indices}].name',
        // Route handlers are run with the Router instance as their this object
        get: function(pathSet) {
            if (this.userId == null) {
                throw new Error("not authorized");
            }  
            // Route implementation snipped
        },
        set: function(jsonGraph) {
            if (this.userId == null) {
                throw new Error("not authorized");
            }  
            // Route implementation snipped
        }        
    }
]);

// Creating a constructor for a class that derives from BaseRouter
var TODORouter = function(userId){
    // Invoking the base class constructor
    BaseRouter.call(this);
    this.userId = userId;
};

// Creating a derived class using JavaScript's classical inheritance pattern
TODORouter.prototype = Object.create(BaseRouter);
~~~

The next version of JavaScript (ES2015) has native support for classes. If you are using a version of node that supports classes, or you are using a transpiler, you can write this code instead of the code seen above:

~~~js
var Router = require("falcor-router");

// Create a Router base class
class TODORouter extends
    // create base class in-line
    Router.createClass([
        {
            route: 'todos[{integers:indices}].name',
            // Route handlers are run with the Router instance as their this object
            get: function(pathSet) {
                if (this.userId == null) {
                    throw new Error("not authorized");
                } 
                // Route implementation snipped
            },
            set: function(jsonGraph) {
                if (this.userId == null) {
                    throw new Error("not authorized");
                }
                // Route implementation snipped
            }      
        }
    ]) {
    
    constructor(userId) {
        super();
        this.userId = userId;
    }
}
~~~

### Why Create a Router Class Instead of a Router Instance?
 
When an Array of routes is passed to the createClass method, an internal Route Map is generated. The Route Map is a stateless data structure designed to improve the speed of pattern matching. Ideally the process of creating the Route Map should only be performed once when your Web server starts up. However Router instances often require access to request information (ex. authorization information included in the cookies). Creating a Router Base class generates the route map once, and allows the route map to be shared with every new instance of the Router class. This allows us to create new instances of Routers inexpensively and throw them away at the end of each request.

~~~js
// todo-router.js
var Router = require("falcor-router");
// Create a Router base class
class TODORouter extends
    // create base class in-line
    Router.createClass([
        {
            route: 'todos[{integers:indices}].name',
            get: function(pathSet) {
                // Route handlers are run with the Router instance as their this object.
                // Therefore the userId member must be set by the constructor.
                if (this.userId == null) {
                    throw new Error("not authorized");
                } 
                // Route implementation snipped
            }
        }
    ]) {
    
    constructor(userId) {
        super();
        this.userId = userId;
    }
}

module.exports = TODORouter;
~~~

These derived Router class instances can be instantiated at connection time, and passed request information via their constructor. All route handler functions are applied to the concrete Router instance, which means that Routes can access request information passed to the Router via the "this" pointer.
 
Typically one instance of the derived Router class is created is created per request and then thrown away.

~~~js
// app.js
var express = require('express');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var falcorMiddleware = require('falcor-express');
var TODORouter = require('./todo-router');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());

// Create a new Router instance for each new request
app.use('/model.json', falcorMiddleware.dataSourceRoute(function(req, res) {
    return new TODORouter(req.cookies.userId);
}));

var server = app.listen(80);
~~~

### Route Objects
 
Each Route object passed to the Router constructor contains a pattern that can be used to match [Path Sets](http://netflix.github.io/falcor/documentation/paths.html#pathsets), as well as three optional handlers that correspond to each of the [DataSource](http://netflix.github.io/falcor/documentation/datasources.html) interface's methods.
 
When one of the [DataSource](http://netflix.github.io/falcor/documentation/datasources.html) methods is invoked on the Router object, the Router attempts to match the [paths](http://netflix.github.io/falcor/documentation/paths.html) against the patterns in each route.  If a Route's pattern is matched, the corresponding route handler method is invoked.  The Route handler is expected to perform the corresponding action and generate the subset of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) containing the requested path.
 
For an example, take the following Router:

~~~js
var BaseRouter = Router.createClass([
    {
        route: 'user.["name", "surname"]',
        get: function(pathSet) {
            // pathSet is ["user", ["name"]] or ["user", ["surname"]] or ["user", ["name", "surname"]]
            if (this.userId == null) {
                throw new Error("not authorized");
            } 
            return userService.
                get(this.userId).
                then(function(user) {
                    // pathSet[1] is ["name"] or ["surname"] or ["name", "surname"]
                    return pathSet[1].map(function(key) {
                        return { path: ["user", key], value: user[key] };
                    });
                });
        }
    }
]);

// Creating a constructor for a class that derives from BaseRouter
var AppRouter = function(userId){
    // Invoking the base class constructor
    BaseRouter.call(this);
    this.userId = userId;
};

// Creating a derived class using JavaScript's classical inheritance pattern
AppRouter.prototype = Object.create(BaseRouter);    
~~~
 
Let's say the following request is made for the "name" and "surname" of the user:

~~~js 
routerInstance.get([["user", ["name", "surname"]]])
~~~
 
Once the Router determines that a route's pattern matches a subset of the requested Path Set, the Router will invoke the matching route's get handler with a [PathSet](http://netflix.github.io/falcor/documentation/paths.html#pathsets) containing the set of [paths](http://netflix.github.io/falcor/documentation/paths.html) that matched the route pattern:
 
~~~js
matchingRoute.get.call(routerInstance, ["user",["name","surname"]])
~~~

Note that each Route handler is applied to the Router instance, meaning it can access Router properties using the "this" object.  Note as well that the matching path is passed to the handler using the [Path Array](http://netflix.github.io/falcor/documentation/paths.html#path) syntax. 
 
Each route is responsible for creating a subset of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object that contains the requested values.
 
~~~js
{
    route: 'user.["name", "surname"]',
    get: function(pathSet) {
        // pathSet is ["user", ["name"]] or ["user", ["surname"]] or ["user", ["name", "surname"]]
        if (this.userId == null) {
            throw new Error("not authorized");
        } 
        return userService.
            get(this.userId).
            then(function(user) {
                // pathSet[1] is ["name"] or ["surname"] or ["name", "surname"]
                return pathSet[1].map(function(key) {
                    return { path: ["user", key], value: user[key] };
                });
            });
    }
}
~~~ 

The Router combines the values retrieved from each route handler into a single [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object, and returns it to the caller in an envelope. For example the code below...


~~~js
router.
    get([
        ["user", ["name", "surname"]
    ]).
    subscribe(function(jsonGraphEnvelope) {
        console.log(JSON.stringify(jsonGraphEnvelope, null, 4));
    });
~~~

...prints the following to the console:

~~~js
{
    jsongGraph: {
        "user": {
            "name": "Steve",
            "surname": "McAdams"
        }
    }
}
~~~

#### Route Handlers
 
Each route handler for get or set operations is responsible for creating a PathValue for every [path](http://netflix.github.io/falcor/documentation/paths.html) it matches. A PathValue is an object with a [path](http://netflix.github.io/falcor/documentation/paths.html) and value key.
 
~~~js
{
    route: 'user.["name", "surname"]',
    get: function(pathSet) {
        // pathSet is ["user", ["name"]] or ["user", ["surname"]] or ["user", ["name", "surname"]]
        if (this.userId == null) {
            throw new Error("not authorized");
        } 

        return userService.
            get(this.userId).
            then(function(user) {
                // pathSet[1] is ["name"] or ["surname"] or ["name", "surname"]
                return pathSet[1].map(function(key) {
                    return { path: ["user", key], value: user[key] };
                });
            });
    }
}
~~~ 

This route returns two PathValue objects containing the name and surname of a user respectively. When a Router receives a series of PathValues, it creates the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) envelope by writing each PathValue's value into an object at the PathValue's [path](http://netflix.github.io/falcor/documentation/paths.html).
 
~~~js
[
    { path: ["user","name"], value: "Anupa" },
    { path: ["user","surname"], value: "Husain" }
]
// is converted to...
{
    jsonGraph: {
        user: {
            name: "Anupa",
            surname: "Husain"
        }
    },
    paths: [
        ["user", ["name", "surname"]]
    ]
}
~~~ 

Once all of the routes have finished, the Router responds with a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object containing all of the values returned from each individual route.
 
#### Route Handler Concurrency
 
In addition to returning either [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) envelopes or PathValues synchronously, Router handlers can also return their data asynchronously by delivering their output data in either of the following containers:

* Promise
* Observable
 
In the following example a Route handler retrieves the name and surname of a user from a persistent DataStore, and returns the results in an ES6 Promise:
 
~~~js
{
    route: 'user.["name", "surname"]',
    get: function(pathSet) {
        // pathSet is ["user", ["name"]] or ["user", ["surname"]] or ["user", ["name", "surname"]]
        if (this.userId == null) {
            throw new Error("not authorized");
        } 
        return userService.
            get(this.userId).
            then(function(user) {
                // pathSet[1] is ["name"] or ["surname"] or ["name", "surname"]
                return pathSet[1].map(function(key) {
                    return { path: ["user", key], value: user[key] };
                });
            });
    }
}
~~~ 

For more information on Promises, see this [article](https://www.promisejs.org/)
 
Alternately a Router Handler can return the PathValue results progressively using an Observable:
 
~~~js
var Rx = require("rx");
var Observable = Rx.Observable;

// snip...
{
    route: 'user.["name", "surname"]',
    get: function(pathSet) {
        // pathSet is ["user", ["name"]] or ["user", ["surname"]] or ["user", ["name", "surname"]]
        if (this.userId == null) {
            throw new Error("not authorized");
        } 
        return Observable.
            fromPromise(userService.get(this.userId)).
            flatMap(function(user) {
                // pathSet[1] is ["name"] or ["surname"] or ["name", "surname"]
                return Observable.
                    fromArray(pathSet[1]).
                    map(function(key) {
                        return { path: ["user", key], value: user[key] };
                    });
            });
    }
}
~~~

An Observable is similar to a Promise, with the principal difference being that an Observable can send multiple values over time. The main advantage of using an Observable over a Promise is the ability to progressively return PathValues to the Router as soon as they are returned from the underlying [DataSource](http://netflix.github.io/falcor/documentation/datasources.html).  In contrast, when delivering values in a Promise, all values must be collected together in a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) envelope or an Array of PathValues and returned to the Router at the same time.
 
Using an Observable can improve throughput, because Routers may make additional requests to backend services in the event references are discovered in a Route Handler's [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) output.

When a Router discovers a reference before a [path](http://netflix.github.io/falcor/documentation/paths.html) has been fully evaluated, it optimizes the Path and matches the newly optimized [path](http://netflix.github.io/falcor/documentation/paths.html) against the Routes. When a [path](http://netflix.github.io/falcor/documentation/paths.html) is optimized it is matched against the Router's Routes again. This may in turn trigger subsequent backend requests, which means that getting the references within a Route response back to the Router earlier can sometimes improve throughput.
 
For an overview on Observable, see this [video](https://www.youtube.com/watch?v=XRYN2xt11Ek).
 
#### Route Pattern Matching
 
Route patterns support a superset of the PathSet syntax, which means they can match any PathSet. In addition to allowing matching explicit Ranges and KeySets in indexers, Route patterns may contain any of the following three special tokens:

~~~
{integers}
{ranges}
{keys}
~~~

##### The {integers} Pattern

The {integers} pattern will match any integers in a KeySet, including those specified in a Range. All matched keys are normalized into an Array of integers.

For example...

~~~
titlesById[235,223,555,111...113].name
~~~

...matched against...

~~~
titlesById[{integers}].name
~~~

...will produce the following [Path Sets](http://netflix.github.io/falcor/documentation/paths.html#pathsets) to be passed to the route handler:

~~~
["titlesById", [234,223,555,111,112,113],"name"]
~~~

This pattern is most often when matching entities by an integer ID. For example, the following route builds a map of all tasks by ID.

~~~js
var jsong = require('falcor-json-graph');
var Router = require('falcor-router');

var router = new Router([{
    route: 'tasksById[{integers:ids}]["name","done"]',
    get: function(pathSet) {
        // pathSet.ids is [234,122]
        return todoService.
            get(pathSet.ids).
            then(function(taskMap) {
                // taskMap is
                // {
                //     "234": { name: "Go to ATM", done: false },
                //     "122": null
                // }
                var jsonGraph = {},
                    tasksById = jsonGraph.tasksById = {},
                    task;
                
                pathSet.ids.forEach(function(id) {
                    var taskRecord = taskMap[id];
                    // if a Task does not exist, we explicitly insert an empty value
                    // at the task object, rather than its "name" or "done" field.
                    if (taskRecord == null) {
                        tasksById[id] = jsong.atom(taskMap[id]);
                    }
                    else {
                        task = tasksById[id] = {};
                        pathSet[2].forEach(function(key) {
                            task[key] = jsong.atom(taskRecord[key]);
                        });
                    }
                });
                
                return { jsonGraph: jsonGraph };
            });
    }
}]);

router.get([
    ["tasksById", [234, 122], "name"]
]).subscribe(function(jsongGraphEnvelope) {
    console.log(JSON.stringify(jsongGraphEnvelope, null, 4));
});
~~~
 
##### The {ranges} Pattern

The {ranges} pattern will match any integers in a KeySet whether specified in a Range, a string, or simply as a number. All matched keys are normalized into an Array of ranges.

For example...

~~~
genreList[0,1,5..7,9,"name"]
~~~

...matched against...

~~~
genreList[{ranges}].name
~~~

...will produce the following [Path Sets](http://netflix.github.io/falcor/documentation/paths.html#pathsets) to be passed to the route handler:

~~~
["genreList", [{from:0,to:1}, {from:5,to:7}, {from:9,to:9}], "name"]
~~~

The {ranges} pattern is most often when matching indices in a list. It is ideal when the underlying service API supports paging. For example the following route retrieves the names of Netflix genre lists:

~~~js
var jsong = require('falcor-json-graph');
var Router = require('falcor-router');

var router = new Router([{
    route: 'genrelist[{ranges:indexRanges}].name',
    get: function(pathSet) {
        // pathSet.indexRanges is [{from:0,to:1}, {from:5,to:7}, {from:9,to:9}] 
        return genreListService.
            getGenreListsByRanges(pathSet.indexRanges).
            then(function(listItems) {
                // listItems is...
                // [ 
                //    { index: 0, value: { name: "Horror", titles: [ ... ] },
                //    { index: 1, value: { name: "Drama", titles: [ ... ] },
                //    { index: 5, value: { name: "New Releases", titles: [ ... ] },
                //    { index: 6, value: { name: "Action", titles: [ ... ] },
                //    { index: 7, value: { name: "Romantic Comedies", titles: [ ... ] },
                //    { index: 9, value: null }
                // ]
                return listItems.map(function(listItem) {
                    // if no object exists at a list item, insert an undefined value explicitly at the
                    // list item.
                    if (listItem.value == null) {
                        return { path: ["genrelist", listItem.index], value: jsong.atom(listItem.value) };
                    }
                    else {
                        return { path: ["genrelist", listItem.index, "name"], value: listItem.value.name };
                    }
                });
            });
    }
}]);

router.get([
    ["genreList", [0,1,5,6,7,9], "name"]
]).subscribe(function(jsongGraphEnvelope) {
    console.log(JSON.stringify(jsongGraphEnvelope, null, 4));
});
~~~
 
##### The {keys} Pattern

The {keys} pattern will match any valid key (string, number, boolean), or KeySet (an array of ranges or keys) and normalize the matching set of keys into an Array of keys.

For example...

~~~
genreList[0, 2..4, "length"]
~~~

...matched against...

~~~
genreList[{keys}]
~~~

...will produce the following [Path Sets](http://netflix.github.io/falcor/documentation/paths.html#pathsets) to be passed to the route handler:

~~~
["genreList", [0, 2, 3, 4, "length"]]
~~~

This pattern is most often when matching entities by a GUID. For example, the following route builds a map of all titles by GUID.

~~~js
var jsong = require('falcor-json-graph');
var Router = require('falcor-router');

var router = new Router([{
    route: 'tasksById[{keys:ids}][{keys:props}]',
    get: function(pathSet) {
        // pathSet.ids is ["a32e8912f34","51f2928f34"]
        // pathSet.keys is ["name"]
        return todoService.
            get(pathSet.ids).
            then(function(taskMap) {
                // taskMap is
                // {
                //     "a32e8912f34": { name: "Go to ATM", done: false },
                //     "51f2928f34": null
                // }
                var jsonGraph = {},
                    tasksById = jsonGraph.tasksById = {},
                    task;
                
                pathSet.ids.forEach(function(id) {
                    var taskRecord = taskMap[id];
                    // if a Task does not exist, we explicitly insert an empty value
                    // at the task object, rather than its "name" or "done" field.
                    if (taskRecord == null) {
                        tasksById[id] = jsong.atom(taskMap[id]);
                    }
                    else {
                        task = tasksById[id] = {};
                        pathSet.keys.forEach(function(key) {
                            task[key] = jsong.atom(taskRecord[key]);
                        });
                    }
                });
                
                return { jsonGraph: jsonGraph };
            });
    }
}]);

router.get([
    ["tasksById", ["a32e8912f34", "51f2928f34"], "name"]
]).subscribe(function(jsongGraphEnvelope) {
    console.log(JSON.stringify(jsongGraphEnvelope, null, 4));
});
~~~

The {keys} can also be used to expose any key on a server object to the client. 

Each pattern will produce an array of results, even when matched against a single value.

## Walkthrough: Building a Router for Netflix-like Application

Netflix is an online streaming video service with millions of subscribers.  When a member logs on to the Netflix service, they are presented with a list of genres, each of which contains a list of titles which they can stream.

![Netflix Homepage](http://netflix.github.io/falcor/images/netflix-screenshot.png)

In this exercise we will build a Router for an application similar to Netflix, which merchandises titles to members based on their preferences, and allows them to provide user ratings for each title. This exercise is purely a demonstration of how to build a Router for a web application that displays a catalog of information to a user. This is **not** intended to demonstrate how to Netflix actually works, and any similarities to the actual Netflix Router's implementation are superficial. The entire source for this guide is [online](https://github.com/netflix/falcor-router-demo).

Our goal is to define a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) resource on the Application server that exposes all of the data that our Netflix clone needs. The [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) schema should be designed in such a way that the application can retrieve all of the data it needs for any given application scenario in a single network request.

We would like to create a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object on the server that looks like this:

~~~js
{
  titlesById: {
    234: {
      "name": ”House of Cards",
      "year": 2014,
      "description": ”Ambition and politics...",
      "boxshot": ”/images/9236/1919236.jpg",
      "rating”: 4.2,
      "userRating": 5
    },
    // many more titles snipped
  },
  genrelist: [
    {
      name: ”Drama",
      titles: [
        { $type: "ref", value: ["titlesById", 234] },
        // more title references snipped
      ]
    },
    // more genre lists snipped
  ]
}
~~~

We will create a Router that retrieves the data for this [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) from three different data sources.

Each of these services will inform a different portion of the virtual JSON object:

![Services Diagram](../images/services-diagram.png)

Once we have built this virtual [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object, the client will be able to make requests like this:

~~~js
var model = new falcor.Model({ source: new falcor.HttpDataSource("/model.json") });

//  grab the name of the first four genre lists, as well as the
// name and boxshot of the first five titles within each genre list
model.
    get(
        "genrelists[0..3].name", 
        "genrelists[0..3].titles[0..4]['name','boxshot']").
    then(function(jsonResponse) {
        console.log(JSON.stringify(jsonResponse, null, 4);
    });
~~~

### 1. The Title Service

This service can be used to retrieve information about titles in the catalog. This information is not personalized, and changes relatively infrequently. As a result it makes sense to store it in a different database than either the personalized recommendations or the Ratings.

### 2. The Rating Service

This service can be used to retrieve predicted ratings for every user and title combination. In addition, if users choose to override the predicted rating, this service is used to store their preferred rating. The rating information may be updated frequently based on user ratings, and is therefore stored in a separate database.

### 3. The Recommendation Service

This service can be used to retrieve a personalized list of genres for each user. Each genre list contains a personalized list of titles included based on information gathered about the user's past preferences. The data in this service is stored in a separate database, and the personalized recommendations for all users are recomputed twice a day.

### Choosing Your Routes

It would be challenging if we had to build a route for every possible [path](http://netflix.github.io/falcor/documentation/paths.html) that the client might request from the virtual JSONGraph object.  Luckily this is not necessary. Why not?

**It is only legal to retrieve value types from a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object.**

As a result, it is only necessary to build routes which match [paths](http://netflix.github.io/falcor/documentation/paths.html) at which primitive value types can be found. Recall that these are the JSON value types:

* null
* string
* number
* true
* false

JSONGraph also adds three additional value types to JSON:

* ref
* atom
* error

Given that these are the only valid types which can be retrieved from a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object, we only need to build the following routes to match the example JSONGraph object above.

~~~
"titlesById[234].name"
"titlesById[234].year"
"titlesById[234].description"
"titlesById[234].boxshot"
"titlesById[234].rating"
"titlesById[234].userRating"
"genrelist.length"
"genrelist[0].name"
"genrelist[0].titles.length"
"genrelist[0].titles[0]"
~~~

Once again it is not necessary to build a route that matches the [paths](http://netflix.github.io/falcor/documentation/paths.html) "titlesById", "genrelist", "genrelist[0].titles", because each of these [paths](http://netflix.github.io/falcor/documentation/paths.html) would evaluate to either Objects or Arrays. As it is illegal to request either of these types from a [DataSource](http://netflix.github.io/falcor/documentation/datasources.html), we do not need to worry about matching these [paths](http://netflix.github.io/falcor/documentation/paths.html) with routes.

Of course there may be any number of genrelists or any number of titles within a genrelist. Furthermore, the titlesById map may contain any number of titles. In order to match a request for any genrelist index, any index within a genrelist's titles array, or any id in the titlesById map, we will generalize our routes using the {integers} pattern.

~~~
"titlesById[{integers}].name"
"titlesById[{integers}].year"
"titlesById[{integers}].description"
"titlesById[{integers}].boxshot"
"titlesById[{integers}].rating"
"titlesById[{integers}].userRating"
"genrelist.length"
"genrelist[{integers}].name"
"genrelist[{integers}].titles.length"
"genrelist[{integers}].titles[{integers}]"
~~~

If we create handlers for each of these routes, we should be able to create the illusion that the JSON object exists by matching incoming [paths](http://netflix.github.io/falcor/documentation/paths.html) and retrieving data from the relevant services.

We could create a separate route handler for each one of the routes listed above. However this could lead to redundant code and inefficient call patterns. Many of these routes will end up making the same service calls, and could differ by only a few characters. How do we avoid repeating ourselves?

#### Matching Multiple Paths With KeySets

The good news is that it is possible to to match multiple [paths](http://netflix.github.io/falcor/documentation/paths.html) that differ by only one key using a KeySet. A KeySet is a discrete set of keys expressed as an indexer containing multiple values. In other words instead of creating the following two routes...

~~~js
"titlesById[{integers}].name"
"titlesById[{integers}].year"
~~~

...we can create a single route that matches both the name and year of a title:

~~~js
var router = new Router([
    {
        route: "titlesById[{integers:titleIds}]['name','year']",
        get: function (pathSet) {
            var titleKeys = pathSet[2];
            return titleService.getTitles(pathSet.titleIds).
                then(function(titles) {
                    var response = {};
                    var jsonGraphResponse = response['jsonGraph'] = {};
                    var titlesById = jsonGraphResponse['titlesById'] = {};

                   pathSet.titleIds.forEach(function(titleId) {
                        var responseTitle = titles[titleId],
                            title = {};
                        if (responseTitle.error) {
                            titlesById[titleId] = $error(responseTitle.error);
                        } else {
                            // going through each of the matched keys
                            // ["name"] or ["year"] or ["name", "year"]
                            titleKeys.forEach(function(key) {
                                title[key] = responseTitle.doc[key];
                            });
                            titlesById[titleId] = title;
                        }
                    });
                    return response;
                });
        }
    }
]);
~~~

Note that by matching several [paths](http://netflix.github.io/falcor/documentation/paths.html) with a single route, we are able to both make a single request to the database and eliminate a large amount of repetitive code.

Given the advantages of matching multiple [paths](http://netflix.github.io/falcor/documentation/paths.html) with a single route, one might think that we would want to cover all legal [paths](http://netflix.github.io/falcor/documentation/paths.html) with as few routes as possible. For example it is possible to match any incoming [path](http://netflix.github.io/falcor/documentation/paths.html) request for our application's [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) schema using the following routes:

~~~
"titlesById[{integers}]['name', 'year', 'description', 'boxshot', 'rating', 'userRating']"
"genrelist.length"
"genrelist[{integers}].name"
"genrelist[{integers}].titles.length"
"genrelist[{integers}].titles[{integers}]"
~~~

However it doesn't always make sense to create routes that match as many [paths](http://netflix.github.io/falcor/documentation/paths.html) as possible. Note that the title's "rating" and "userRating" keys are retrieved from the RatingService, while all of the other title keys are retrieved from the TitleService. As a result creating a single route which matches both the "name" and "rating" of a title wouldn't be useful, because serving each individual key would require a request to an entirely different service. Furthermore the code to create each of these values would be very different. Under the circumstances there is little to be gained by handling both these [paths](http://netflix.github.io/falcor/documentation/paths.html) in a single route.

A better strategy than creating routes which match as many [paths](http://netflix.github.io/falcor/documentation/paths.html) as possible is to create routes that match [paths](http://netflix.github.io/falcor/documentation/paths.html) that are retrieved from the same service. The code to retrieve values stored in the same service is likely to be similar, and more importantly it may provide us with opportunities to make a single service call to retrieve multiple values.

In other words, we should probably create the following routes instead:

~~~
"titlesById[{integers}]['name', 'year', 'description', 'boxshot']"
"titlesById[{integers}]['rating', 'userRating']
"genrelist.length"
"genrelist[{integers}].name"
"genrelist[{integers}].titles.length"
"genrelist[{integers}].titles[{integers}]"
~~~

Note that although the genre list routes all retrieve their data from the recommendation service, we cannot collapse them into a single route. Two routes can only be collapsed if they are the same length and differ by one key. We will address this issue later in the walkthrough.

## Handling Authorization

Now that we have chosen our routes we need to consider whether our route handlers have sufficient information to handle requests. Note that _many of the routes in the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object are personalized for the current user_. For example, two different Netflix users will likely see completely different personalized recommendations in their "genrelist" arrays. The "rating" and "userRating" fields are also specific to the current user. The "rating" field is the algorithmically-predicted rating for the user based on the user's previous viewing history and user-specified ratings. The "userRating" field is the user–specified rating for the title, and it should not be possible to set this value if a user is not logged in.

While a login is clearly required to change data or receive personalized recommendations, we would like to be able to use to allow users to browse the catalog without logging in. That's why both the recommendations service and rating service fallback to providing generic recommendations and ratings in the absence of a user ID.

Clearly the Router's route handlers need access to the currently user's ID, if available. To provide the handlers with this information, we can create a Router class which accepts the userID in its constructor.

~~~js
var routes = [
    // routes will go here
];
var BaseRouter = Router.createClass([routes]);

// Creating a constructor for a class that derives from BaseRouter
var NetflixRouter = function(userId){
    // Invoking the base class constructor
    BaseRouter.call(this);
    this.userId = userId;
};

// Deriving the NetflixRouter from the BaseRouter using JavaScript's classical inheritance pattern
NetflixRouter.prototype = Object.create(BaseRouter);
~~~

As explained in previous sections, creating a BaseRouter class using createClass will build a route table for rapidly matching [paths](http://netflix.github.io/falcor/documentation/paths.html) once when the application server starts up. This optimized route table will be shared across all new instances of the derived NetflixRouter class. This makes it inexpensive to create a new NetflixRouter object for every incoming server request.

~~~js
var express = require('express');
var app = express();
var NetflixRouter = require("./netflix-router");
var middleware = require('falcor-express');
var getUserID = require("./auth-user");

// app server setup snipped..

app.use('/model.json', middleware.dataSourceRoute(function(req, res) {
    return new NetflixRouter(getUserID(req.cookies["authToken"]))
}));
~~~

Creating a new Router for each connection and throwing it away immediately after sending a response reduces the chances that we will accidentally accumulate state on the application server over its lifetime.

Now that we have created a NetflixRouter class, we can add routes to it. Remember that each route handler runs with the Router as its "this" object. As a result, each route handler will have access to the userId member defined on the Router. In the next section we will see how handlers use the Router's userId member to return different values depending on which user is logged in.

### Creating the Routes for the "titlesById" Map

Our [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object has a titlesById map that contains all of the titles in the catalog. Each title's key within the map is its ID.

~~~js
{
  titlesById: {
    234: {
      "name": ”House of Cards",
      "year": 2014,
      "description": ”Ambition and politics...",
      "boxshot": ”/images/9236/1919236.jpg",
      "rating”: 4.2,
      "userRating": 5
    },
    // many more titles snipped
  }
}
~~~

We will create this map using two different routes:

~~~
"titlesById[{integers}]['name', 'year', 'description', 'boxshot']"
"titlesById[{integers}]['rating', 'userRating']
~~~

The first route will retrieve it's information from the title service, which is a repository of non-personalized title metadata. The second route will retrieve its information from the rating service, which provides personalized ratings based on the users past preferences.

Let's start with the first route, because it does not require any user authentication:

#### "titlesById[{integers}]['name', 'year', 'description', 'boxshot']"

This route matches any request for title fields that are retrieved from the title service. The title service is not personalized. It exposes generic metadata that is true for all users.  The title service has a getTitles method which can be used to retrieve any number of title objects by ID.

~~~js
titleService.getTitles([1, 2]).then(function(titles) { console.log(JSON.stringify(titles, null, 3)); })

//will output roughly:
{
   "1": {
      "doc": {
         "year": 2011,
         "description": "Little ones can learn a lot from George -- one of the most curious monkeys in all of literature -- with adventures narrated by William H. Macy.",
         "rating": 1,
         "boxshot": "http://cdn.test.nflximg.net/images/3670/3843670.jpg",
         "name": "Curious George",
         "_id": "1",
         "_rev": "1-2ee1959b61d75dcd79baa1f06ede73ab"
      }
   },
   "2": {
      "doc": {
         "year": 2011,
         "description": "Hugh Laurie stars as the ornery Dr. Gregory House, a paradoxical physician who loathes his patients but is a genius at treating mysterious ailments.",
         "rating": 1.1,
         "boxshot": "http://cdn.test.nflximg.net/images/5161/4185161.jpg",
         "name": "House, M.D.",
         "_id": "2",
         "_rev": "1-3ec6bbb698af163a7946825844e9fddf"
      }
   }
}     
~~~

Note that the output of the title service is a map of record objects organized by each title ID. A record object is an object with a "doc" key containing the requested title. If an error occurs while attempting to retrieve a particular title, the record object will contain an error" key instead.

~~~js
{
   "1": {
      "error": "something went wrong."
   },
   "2": {
      "error": "something went wrong."
   }
}     

~~~


Let's use the title service to retrieve each title's generic fields. We will start by creating a route object which matches any [path](http://netflix.github.io/falcor/documentation/paths.html) that would retrieve these title fields.

~~~js
    {
        route: "titlesById[{integers}]['name','year','description','boxshot']",
        get: function (pathSet) {
            // code to create values goes here
        }
    }
~~~

Note that this route could match any of the following [paths](http://netflix.github.io/falcor/documentation/paths.html) or [path sets](http://netflix.github.io/falcor/documentation/paths.html#pathsets):

~~~
titlesById[738, 6638]["name", "year"]
titlesById[738..739, 672, 982]["boxshot", "description"]
titlesById[573].year
~~~

No matter what the input, the {integers} range will normalize the incoming KeySet to an array of integers before passing it to the route handler.

~~~
titlesById[738..739, 672, 982]["boxshot", "description"] -> route.get.call(routerInstance, ["titlesById", [738, 739, 672, 982], ["boxshot", "description"]])
~~~

The route handler's responsibility is to create a PathValue object for each [path](http://netflix.github.io/falcor/documentation/paths.html) that the route matches. In other words, if the route matches the following [PathSet](http://netflix.github.io/falcor/documentation/paths.html#pathsets)...

~~~
"titlesById[683, 528]['name', 'year']"
~~~

...the route handler must create a Promise of an array of PathValue objects, one for each of the following [paths](http://netflix.github.io/falcor/documentation/paths.html):

~~~js
["titlesById", 683, "name"]
["titlesById", 683, "year"]
["titlesById", 528, "name"]
["titlesById", 528, "year"]
~~~

Inside the route handler we can get access to the array of integers produced by the {integers} pattern positionally. 

~~~js
{
    route: "titlesById[{integers}]['name','year','description','boxshot']",
    get: function (pathSet) {
        var ids = pathSet[1];
        // create values here
    }
}
~~~

Alternately we can define a "titleIds" alias for the integers pattern and use the alias to retrieve the array of title ids.

~~~js
{
    route: "titlesById[{integers}]['name','year','description','boxshot']",
    get: function (pathSet) {
        var ids = pathSet.titleIds;
        // create values here
    }
}
~~~

Once we have access to the ids of the requested titles, we can make a call to the title service to retrieve them.

~~~js
{
    route: "titlesById[{integers:titleIds}]['name','year','description','boxshot']",
    get: function (pathSet) {
        return titleService.getTitles(pathSet.titleIds).
            then(function(titles) {
                // code to retrieve title values goes here
            });
    }
}
~~~

Now we will use two nested forEach calls to create a PathValue object for every title id and title key combination.  

~~~js
{
    route: "titlesById[{integers:titleIds}]['name','year','description','boxshot']",
    get: function (pathSet) {
        return titleService.getTitles(pathSet.titleIds).
            then(function(titles) {

                var results = [];
                
                pathSet.titleIds.forEach(function(titleId) {
                    pathSet[2].forEach(function(key) {
                        var titleRecord = titles[titleId];

                        if (titleRecord.error) {
                            results.push({
                                path: ['titlesById', titleId, key],
                                value: $error(titleRecord.error)
                            });
                        } else {
                            results.push({
                                path: ['titlesById', titleId, key], 
                                value: titleRecord.doc[key]
                            });
                        }
                    });
                });
                
                return results;
            });
    }
}
~~~        
                                    
Now we should be able to retrieve title keys by ID from the Router:

~~~js
router.get([["titlesById", [9, 10], ["name", "year"]]]).subscribe(function(jsonGraph) {
    console.log(JSON.stringify(jsonGraph, null, 4));
});
~~~

The router collects up all of the PathValue objects returned from route handlers, adds each value to a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object, and returns it as a response.  The code above prints the following to the console:

~~~js
{
    "jsonGraph": {
        "titlesById": {
            "10": {
                "name": "The Reunion",
                "year": 2011
            },
            "9": {
                "name": "Snow on Tha Bluff",
                "year": 2011
            }
        }
    }
}
~~~

What do you think will happen if we attempt to retrieve keys from a title that does not exist? Let's try to retrieve the name of a title that does not exist (id = -1), and a title that does exist (id=7). 

~~~js
router.get([["titlesById", [-1, 7], "name"]]).subscribe(function(jsonGraph) {
    console.log(JSON.stringify(jsonGraph, null, 4));
});

//will output:
{
    "jsonGraph": {
        "titlesById": {
            "-1": {
                "$type": "error",
                "value": "undefined is not an object"
            },
            "7": {
                "$type": "error",
                "value": "undefined is not an object"
            }
        }
    }
}
~~~

Note that the output is a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) error object at each individual [path](http://netflix.github.io/falcor/documentation/paths.html). Why did this happen? 

We did not guard against the possibility that the title doesn't exist in our route handler. As a result our route threw an "undefined is not an object" error when it attempted to look up "name" on an undefined value. When the router catches an error thrown from a route handler, it creates a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) error object at every [path](http://netflix.github.io/falcor/documentation/paths.html) passed to that route handler. That means we don't get any data back - not even the name of the title that does exist.

Clearly we have to be defensive when coding our route handlers, but this begs the question: "what should a route handler return when a title doesn't exist"? 

If there is a null or undefined value at "titleById[-1]" the route should return a PathValue indicating as much. Note the additional check added to the route below.

~~~js
{
    route: "titlesById[{integers:titleIds}]['name','year','description','boxshot']",
    get: function (pathSet) {
        return titleService.getTitles(pathSet.titleIds).
            then(function(titles) {

                var results = [];
                
                pathSet.titleIds.forEach(function(titleId) {
                    pathSet[2].forEach(function(key) {
                        var titleRecord = titles[titleId];

                        if (titleRecord.error) {
                            results.push({
                                path: ['titlesById', titleId, key],
                                value: $error(titleRecord.error)
                            });
                        } else if (titleRecord.doc) {
                            results.push({
                                path: ['titlesById', titleId, key], 
                                value: titleRecord.doc[key]
                            });
                        } else {
                            results.push({
                                path: ['titlesById', titleId],
                                value: undefined
                            });
                        }
                    });
                });
                
                return results;
            });
    }
}                    
~~~

Now let's see what gets printed to the console if we repeat the same request as last time:

~~~js
router.get([["titlesById", [-1, 7], "name"]]).subscribe(function(jsonGraph) {
    console.log(JSON.stringify(jsonGraph, null, 4));
});

//will output:
{
    "jsonGraph": {
        "titlesById": {
            "-1": {
                "name": {
                    "$type": "atom"
                }
            },
            "7": {
                "name": "LEGO Ninjago: Masters of Spinjitzu: Way of the Ninja"
            }
        }
    }
}
~~~

Notice that the Router inserts a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) atom, indicating that no value is present at ["titlesById", -1].

The practice of checking for the existence of value types along the matched [path](http://netflix.github.io/falcor/documentation/paths.html) is referred to as **branch guarding**, and it is every route handler's responsibility. If null, undefined, or _any [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) value type_ (ex.string, number, atom), is discovered along a [path](http://netflix.github.io/falcor/documentation/paths.html), a route handler must return a PathValue that indicates which [path](http://netflix.github.io/falcor/documentation/paths.html) at which the value type was discovered, as well as the specific value type found there. In the example above we only bother to check for null or undefined because we feel confident that the data has been sanitized already, and no other value type (ex. string, number) could appear instead of the title. Depending on how much you trust your data, you may want to be more zealous.

Now that we can retrieve non-personalized fields from titles, let's create a route that adds personalized fields like rating and userRating to our [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object.

#### "titlesById[{integers}]['rating', 'userRating']"

This route matches any request for the rating on title objects. The rating service is personalized, and provides predicted ratings for each user based on their previous preferences. In the event that there is no user ID available, the rating service will create a rating based on the ratings provided by registered members. The rating service has a getRatings method which can be used to retrieve any number of rating records objects by title ID.

~~~js
// "1" is userID
ratingService.getRatings([1,2], "1").
    then(function(titles) { console.log(JSON.stringify(titles, null, 3)); })

//will output roughly:
{
   "1": {
      "doc": {
         "rating": 1,
         "userRating": 1
      }
   },
   "2": {
      "doc": {
         "rating": 1.1,
         "userRating": 1
      }
   }
} 
~~~

Note that like the title service, the output of the rating service is a map of record objects organized by each title ID. Each record object contains a "doc" field with an object that contains two fields:

1. The "rating" which is the algorithmically-predicted rating based on the user's previous ratings of similar titles.
2. The "userRating" which, if present, is the users explicitly specified rating for this title.

Like the title service records, the rating record will contain a "error" key instead of a "doc" key in the event that an error occurs while attempting to retrieve the rating record.

Now that we understand how the rating service works, let's create a route that matches the title's rating fields. This routes get handler will follow pretty much the same template as the title service route with one exception: the rating route retrieves the userId member from the Router and passes it to the ratings service.

~~~js
    {
        route: "titlesById[{integers:titleIds}]['userRating', 'rating']",
        get: function(pathSet) {
            var userId = this.userId;

            return ratingService.getRatings(pathSet.titleIds, userId).
                then(function(ratings) {
                    var results = [];
                    
                    pathSet.titleIds.forEach(function(titleId) {
                        pathSet[2].forEach(function(key) {
                            var ratingRecord = ratings[titleId];

                            if (ratingRecord.error) {
                                results.push({
                                    path: ['titlesById', titleId, key],
                                    value: $error(ratingRecord.error)
                                });
                            } else if (ratingRecord.doc) {
                                results.push({
                                    path: ['titlesById', titleId, key], 
                                    value: ratingRecord.doc[key]
                                });
                            } else {
                                results.push({
                                    path: ['titlesById', titleId],
                                    value: undefined
                                });
                            }
                             
                        });
                    });
                    
                    return results;
                });
        }
    }
~~~

Each one of the Routers route handlers runs with the Router instance as it's "this" object. That means that our route handler has access to the Router's userId member. The handler passes the Router's userId to the recommendation service, which retrieves a personalized genre list for the current user. If the current user is not authenticated, the Router's userId will be undefined. If an undefined userId is passed to the rating service, the service simply returns a record with a generic "rating" and no "userRating" key.

Now we should be able to retrieve any title field by ID.

~~~js
var falcorRouterDemoFactory = require('falcor-router-demo');
var router = falcorRouterDemoFactory("1");
router.get([["titlesById", 1, ["name", "year", "userRating"]]]).subscribe(function(jsonGraph) {
    console.log(JSON.stringify(jsonGraph, null, 4));
});
~~~

The request above matches both routes we have created. The Router adds the resulting PathValues to a single [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) response. The code above prints the following to the console:

~~~js
{
    "jsonGraph": {
        "titlesById": {
            "1": {
                "name": "Curious George",
                "userRating": 1,
                "year": 2011
            }
        }
    }
}
~~~

Note how the router presents the consumer with what appears to be a single title object, but sources the data for the title from multiple services. The result is a simple API for the consumer without compromising any flexibility about where data is stored on the backend.

Now we have the ability to retrieve information about any title in the catalog using that ID. However in practice our users will not be navigating titles by ID. When a user starts the application, they will be presented with a list of genres, each of which contains a list of recommended titles. Users will navigate through these titles positionally, scrolling vertically and horizontally. As a consequence the application needs to be able to retrieve titles by position within the user's personalized recommendations list. To accommodate this requirement, we will add the users genre list to the Router's virtual [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object.

### Creating the Genre List Routes

We chose the following routes to create the user's personalized genre list:

~~~
"genrelist.length"
"genrelist[{integers}].name"
"genrelist[{integers}].titles.length"
"genrelist[{integers}].titles[{integers}]"
~~~

Each of these routes will retrieve their information from the recommendation service. The recommendationService's getGenreList method returns a Promise that resolves to the current user's list of genres, each of which contains a personalized list of titles based on their preferences. Here's an example usage of getGenreList:

~~~js
recommendationService.
    // passing a user ID to the service
    getGenreList(1).
    then(function(genrelist) {
        console.log(JSON.stringify(genrelist, null, 4));
    });
~~~

The code above prints the following (abbreviated) output to the console:

~~~js
{
    genrelist: [
        {
            name: "Horror",
            titles: [
                 62873, // title ID
                 52883, // title ID
                 58378, // title ID
                 // more title IDs snipped
            ]
        },
        // more genre lists snipped
    ]
}
~~~

The getGenreList method can also be called without a user ID. If no user ID is provided the service will fallback to a non-personalized list of recommendations containing the highest rated titles in the catalog. 

Now that we understand how the service works, let's use it to create the routes for the current user's genre list.

#### The "genrelist.length" route

The job of the "genrelist.length" route's get handler is simple: retrieve the user's genre list from the recommendation service and return its length. 

~~~js
var routes = [
    {
        route: 'genrelist.length',
        get: function(pathSet) {
            return recommendationService.getGenreList(this.userId)
                .then(function(genrelist) {             
                    return {
                        path: ['genrelist', 'length'],
                        value: genrelist.length
                    };
                });
        }
    }
]
~~~

As we can see, the route simply transforms the result of the promise into a PathValue containing the matched [path](http://netflix.github.io/falcor/documentation/paths.html) and the length.

Now we should be able to retrieve the length of the genre list from the Router:

~~~js
var falcorRouterDemoFactory = require('falcor-router-demo');
var router = falcorRouterDemoFactory("1");

router.get([["genrelist", "length"]]).subscribe(function(jsonGraph) {
    console.log(JSON.stringify(jsonGraph, null, 4));
});
~~~

The router accepts the PathValue objects from the routes, and adds each of their values to a single [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object. The code above prints the following to the console:

~~~js
{
    "jsonGraph": {
        "genrelist": {
            "length": 29
        }
    }
}
~~~

The genre list length route is easy because it only matches one [path](http://netflix.github.io/falcor/documentation/paths.html). Next let's try a route that can match multiple [paths](http://netflix.github.io/falcor/documentation/paths.html): "genrelist[{integers}].name".


This route starts out much the same way as the previous one: by retrieving the user's genre list from the recommendation service.

~~~js
var routes = [
    {
        route: 'genrelist[{integers:indices}].name',
        get: function(pathSet) {
            return recommendationService.getGenreList(this.userId)
                .then(function(genrelist) {             
                    // to be continued…
                });
        }
    }
]
~~~

Note that this route could match any of the following [paths](http://netflix.github.io/falcor/documentation/paths.html) or [path sets](http://netflix.github.io/falcor/documentation/paths.html#pathsets):

~~~
genrelist[0..1].name
genrelist[0..2, 4...5, 9].name
genrelist[1].name
~~~

No matter what the input, the {integers} range will normalize the incoming KeySet to an array of integers before passing it to the route handler.

~~~
genrelist[0..1, 2].name -> route.get.call(routerInstance, ["genrelist", [0, 1, 2], "name"]])
~~~

Once inside the route, we can get access to the array of integers produced by the {integers} pattern positionally. 

~~~js
    {
        route: 'genrelist[{integers:indices}].name',
        get: function(pathSet) {
            // pathSet could be ["genrelist", [0, 1, 2], "name"] for example
            var indices = pathSet[1];
            // rest snipped
        }
    ]
~~~

Alternately we can define an "indices" alias for the integers pattern and use it to retrieve the array of indices.

~~~js
    {
        route: 'genrelist[{integers:indices}].name',
        get: function(pathSet) {
            // pathSet could be ["genrelist", [0, 1, 2], "name"]] for example
            var indices = pathSet.indices;
            // rest snipped...
        }
    ]
~~~

If a route's get handler is passed ["genrelist", [0, 1, 2], "name"] it must return a Promise containing an Array of PathValues, one for each [path](http://netflix.github.io/falcor/documentation/paths.html) in the [PathSet](http://netflix.github.io/falcor/documentation/paths.html#pathsets).

~~~js
{ path: ["genreList", 0, "name"], value: "Horror" }
{ path: ["genreList", 1, "name"], value: "Thrillers" }
{ path: ["genreList", 2, "name"], value: "New Releases" }
~~~

Once we retrieve the genre list from the recommendations service, we can use the map function to create a PathValue for each index the route matches.

~~~js
    {
        route: "genrelist[{integers:indices}].name",
        get: function (pathSet) {
            return recommendationService.
                getGenreList(this.userId).
                then(function(genrelist) {
                    return pathSet.indices.map(function(index) {
                        var list = genrelist[index];

                        if (list == null) {
                            return { path: ["genrelist", index], value: list };
                        }

                        return {
                            path: ['genrelist', index, 'name'],
                            value: genrelist[index].name
                        };
                    });
                });
        }
    }
~~~

Note that we have been careful to use branch guarding, and check for the existence of each individual list before attempting to retrieve the name. 

Now we can retrieve the name of a user's genre lists from the Router.

~~~js
router.get([["genrelist", 1, "name"]]).subscribe(function(jsonGraph) {
    console.log(JSON.stringify(jsonGraph, null, 4));
});
~~~

Once again the Router converts the output into a [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object, and so we see the following console output:

~~~js
{
    "jsonGraph": {
        "genrelist": {
            "1": {
                "name": "Action & Adventure"
            }
        }
    }
}
~~~

Now let's tackle the most challenging of all of the genre list routes...

#### The "genrelist[{integers}].titles[{integers}]" Route

This route builds the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) references in the titles array within each genre. In other words this route will create this portion of the [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) object:

~~~js
{
  genrelist: [
    {
      name: ”Drama",
      titles: [
        { $type: "ref", value: ["titlesById", 234] },
        // more title references snipped
      ]
    },
    // more genre lists snipped
  ],
  // rest of the object snipped
}
~~~

Each reference in the titles array points to a title in the "titlesById" map. This time we will just go directly to the full solution.

~~~js
    {
        route: "genrelist[{integers:indices}].titles[{integers:titleIndices}]",
        get: function (pathSet) {
            return recommendationService.
                getGenreList(this.userId).
                then(function(genrelist) {
                    var pathValues = [];
                    pathSet.indices.forEach(function (index) {
                        var genre = genrelist[index];
                        
                        if (genre == null) {
                            pathValues.push({
                                path: ['genrelist', index],
                                value: genre
                            });
                        } else {
                            pathSet.titleIndices.forEach(function(titleIndex) {
                                var titleID = genrelist[index].titles[titleIndex];

                                if (titleID == null) {
                                    pathValues.push({ path: ["genrelist", index, "titles", titleIndex], value: titleID });
                                }
                                else {
                                    pathValues.push({
                                        path: ['genrelist', index, 'titles', titleIndex],
                                        value: $ref(['titlesById', titleID])
                                    });
                                }
                            });
                        }
                    });
                    return pathValues;
                });
        }
    }
~~~

Notice that we are branch guarding at both the genre and title level. This ensures that any attempt to retrieve a genre or title that doesn't exist will not throw and will instead return the specific [path](http://netflix.github.io/falcor/documentation/paths.html) at which the undefined value was found.

Note that references are [JSON Graph](http://netflix.github.io/falcor/documentation/jsongraph.html) value types, like strings, booleans, and numbers. That means we can retrieve these references from the Router, just like any other value type:

~~~js
router.
    get([
        ["genrelist", 0, "titles" 0]
    ]).subscribe(function(jsonGraphEnvelope) {
        console.log(JSON.stringify(jsonGraphEnvelope, null, 4));
    });
~~~

The code above prints the following the console:

~~~js
{
    jsonGraph: {
        "genrelist": {
            0: {
                "titles": {
                    0: { $type: "ref", value: ["titlesById", 235] }
            }
        }
    }
}
~~~
The remaining genre list route will be left as an exercise for the user:

~~~
"genrelist[{integers}].titles.length"
~~~

#### More to Come...

This guide is a work in progress. However the complete source code is available at [falcor-router-demo](https://github.com/netflix/falcor-router-demo).
