---
layout: toc-page
title: JSON Graph
id: json_graph
lang: en
---

* Table of contents. This line is required to start the list.
{:toc}

# JSON Graph

## What is JSON Graph?

JSON Graph is a convention for modeling graph information as a JSON object. Applications that use Falcor represent all their domain data as a single JSON Graph object.

JSON Graph is valid JSON and can be parsed by any JSON parser. However JSON Graph introduces new primitive types to JSON to allow JSON to be used to represent graph information in a simple and consistent way. While it is possible to work with JSON Graph data directly, it is much more convenient to work with it indirectly using tools that understand JSON Graph types. One way to think about Falcor is as a set of protocols and tools for transferring, storing, and retrieving data from JSON Graph objects.

Here's a simple example of a JSON Graph Object that represents a TODO list where each task can be linked to one or more prerequisites.

~~~js
var json = {
    todosById: {
        "44": {
            name: "get milk from corner store",
            done: false,
            prerequisites: [{ $type: "ref", value: ["todosById", 54] }]
        },
        "54": {
            name: "withdraw money from ATM",
            done: false,
            prerequisites: []
        }
    },
    todos: [
        { $type: "ref", value: ["todosById", 44] },
        { $type: "ref", value: ["todosById", 54] }
    ]
};
~~~

Note that in the example above the JSON Graph contains references to other locations in the same object. It is this concept of a Reference that allows graphs to be represented in JSON.

## Why JSON Graph?

JSON is a ubiquitous data interchange format. Web applications often exchange data in JSON format because manipulating JSON Data in JavaScript is so easy. JSON is also map–based, which makes it easy to divide a large data set into smaller subsets and send them across the wire on demand.

Unfortunately there is a downside to using JSON to send and store your Web application's data: JSON models trees, and most application domains are *graphs*. As a result, serializing a graph as JSON can introduce duplicates copies of the same entity. 
![Graph to JSON](../images/jsong-json.png)

These duplicates take up additional space when sent across the wire, but they can also create a much bigger hazard: **stale data**. If changes made to one instance of an entity are not propagated to the others, the application may present stale data to the user if they are presented a different instance than the one they changed. 

![Stale Data](../images/stale-data.png)

To avoid this problem, developers often attempt to remove duplicates when integrating entities into the client cache. 

![Removing Duplicates](../images/json-graph-cache.png)

This usually involves assigning a unique identifier to the entity, so that the client can detect duplicates before they are added to the cache. Unfortunately as most object identifiers are not globally unique, but rather are unique among other entities of the same type, custom code must often be written for each new type added to the system.   In addition to being able to represent graphs as a JSON object, JSON Graph provides a set of abstract operations that should allow your application to be able to retrieve all the data it needs in a single round trip. The ability to retrieve precisely the data required for an application scenario in a single round trip can dramatically reduce latency. 

## How Does JSON Graph Work?

**JSON Graph allows a graph to be modeled as JSON without _introducing duplicates_.** Instead of inserting an entity into the same message multiple times, _each entity with a unique identifier is inserted into a single globally–unique location in the JSON Graph object_. The path to the only location within the JSON Graph object where an entity is stored is referred to as the entity's **identity path.** No two entities in an application's domain model should have the same identity path. If an entity's unique identifier (often assigned by a data store) is not globally unique, but rather only unique within the set of its like types, the entity's identity path can be changed to include both the its type and ID. This combination is usually enough to ensure that an entity's identity path is globally unique.

Whenever an entity needs to be referenced by another entity in the same JSON graph object, a **Reference** with the entity's identity path is included instead. A Reference is a new value type that JSON Graph introduces to JSON to allow graph relationships to be modeled within a JSON object. 

Here is a simple example of a JSON Graph object that contains the domain data for a TODO list.

~~~js
var json = {
    todosById: {
        "44": {
            name: "get milk from corner store",
            done: false,
            prerequisites: [{ $type: "ref", value: ["todosById", 54] }]
        },
        "54": {
            name: "withdraw money from ATM",
            done: false,
            prerequisites: []
        }
    },
    todos: [
        { $type: "ref", value: ["todosById", 44] },
        { $type: "ref", value: ["todosById", 54] }
    ]
};
~~~

JSON Graph References are just like symbolic links in the UNIX file system. Symbolic links are just files that contain a path. However if the shell encounters a symbolic link while evaluating a path, the shell begins evaluating the path within the symbolic link. It is this awareness of symbolic links that allows graphs to be represented in a hierarchical structure.

## New Primitive Value Types 

In addition to JSON’s primitive types, JSON Graph introduces three new primitive types:  

1. Reference  
2. Atom  
3. Error   

Each of these types is a JSON Graph object, but their values are always retrieved and replaced in their entirety just like a primitive JSON value.  None of the JSON Graph values can be mutated using any of the available abstract JSON Graph operations. Each of these types also has a key ”$type” which differentiates it from regular JSON objects, and describes the type of its “value” key.

### Reference   

A Reference is a JSON object with a “$type” key that has a value of “ref” and a ”value” key that has a Path array as its value. 

~~~js
{ $type: "ref", value: ["todosById", 44] },
~~~

A Reference’s path points to another location within the same JSON Graph object. Using References, it is possible to model a graph in JSON. Here is an example of a TODO list in which each task can contain References to its prerequisite tasks: 

~~~js
var json = {
    todosById: {
        "44": {
            name: "get milk from corner store",
            done: false,
            prerequisites: [{ $type: "ref", value: ["todosById", 54] }]
        },
        "54": {
            name: "withdraw money from ATM",
            done: false,
            prerequisites: []
        }
    },
    todos: [
        { $type: "ref", value: ["todosById", 44] },
        { $type: "ref", value: ["todosById", 54] }
    ]
};
~~~

A Reference is like a symbolic link in the UNIX file system. When the path is being evaluated, and a Reference is encountered when there are still keys in the path left to evaluate, the reference is followed from the root to its target object, and the remaining keys in the path are evaluated. If a Reference is discovered at the last key in a path, the Reference itself is returned as the result. 

## The Abstract JSON Graph Operations  

There are three abstract JSON Graph operations: 

1. get 
2. set 
3. call   

Each of these operations must be carried out by an intermediary. This layer of indirection allows us to abstract away the location and organization of the data from the caller.
 
Some examples of objects that are capable of carrying out the abstract JSON Graph operations are:  

* DataSources
* The Falcor Model

### The Abstract get Operation

It is possible to retrieve primitive values from a JSON Graph document using the abstract get operation. The input to the abstract get operation can be any number of Paths to the values to be retrieved. The output is a subset of the JSON Graph object that contains all of the primitive values encountered while evaluating the input Paths. The abstract get operation must be idempotent. Executing a get operation must not change any values in the JSON Graph. 

Let's walk through this process on a real JSON Graph object:

~~~js
var json = {
    todosById: {
        "44": {
            name: "get milk from corner store",
            done: false,
            prerequisites: [{ $type: "ref", value: ["todosById", 54] }]
        },
        "54": {
            name: "withdraw money from ATM",
            done: false,
            prerequisites: []
        }
    },
    todos: [
        { $type: "ref", value: ["todosById", 44] },
        { $type: "ref", value: ["todosById", 54] }
    ]
};
~~~

Let’s evaluate the following path in an attempt to retrieve the name of the first task in the TODOs list.

~~~js
["todos", 0, "name"]
~~~

First we evaluate the ”todos” key, which yields an array.  There are more keys to be evaluated, so we continue. Then we evaluate the number “0” key, and it is converted into a string using JSON stringify algorithm. We attempt to look up the value in the array, and we find a reference:  

~~~js
// JSON Graph object
{
    // "todosById" object snipped
    todos: [
        { $type: "ref", value: ["todosById", 44] },
        // rest of list snipped
    ]
}
// JSON Graph subset response
{}
~~~

References are primitive value types, and are therefore immediately inserted into the subset of the JSON Graph object that will be produced by the abstract get operation. 

~~~js
// JSON Graph object
{
    // "todosById" object snipped
    todos: [
        { $type: "ref", value: ["todosById", 44] },
        // rest of list snipped
    ]
}
// JSON Graph subset response
{
    todos: {
        "0": { $type: "ref", value: ["todosById", 44] },
    }
}
~~~

However References are handled specially during path evaluation. If a Reference is encountered when there are still keys left in the path to be evaluated, a new path is created. The new path is formed by concatenating the remaining keys to the end of the reference path. This process is known as “path optimization”, because the optimized path we create is a quicker route to the requested value. Path optimization produces the following path:  

~~~js
["todosById", 44]
{
    // "todosById" object snipped
    todos: [
        { $type: "ref", value: ["todosById", 44] },
        // rest of list snipped
    ]
}
~~~

Once we create an optimized path, we begin evaluating it from the root of the JSON Graph object. 

(pointer to the root of the document, along with the optimized path)  

Now we evaluate the “tasksById” key, which yields an object. Next, we convert the number 44 into a string using the JSON stringify algorithm. Then we look up the resulting string “44” which yields another object. Finally we look up the key “name” and we find a primitive value type ”withdraw money from ATM”. This value is added to the JSON Graph subset and returned as the result of the abstract get operation. 

(the string result)  

###  Retrieving References  

As we saw in the previous section, when references are encountered while there are still keys in the path left to be evaluated, the path is optimized. However, if the reference is encountered and there are no more keys in the path left to be evaluated, the reference itself is returned rather than its target object. To see this process in action, let’s start with the same JSON Graph document we used in the previous section:    

(an example of the path)   

Let’s evaluate the following path to retrieve the reference to the first task in the TODO list:

(A path which retrieves the first reference in the list)

First we evaluate the ”todos” key, which yields an array.  There are more keys to be evaluated, so we continue. Then we evaluate the number “0” key, and it is converted into a string using JSON stringify algorithm. We attempt to look up the value in the array, and we find a reference:  

(reference value)  

References are primitive value types, and are therefore inserted into the subset of the JSON Graph object that will be produced by the abstract get operation. Now there are no more keys in the path left to be evaluated, so the JSON Graph subset is returned as the result of the abstract get operation.   

### Short-circuiting   

If a primitive value is encountered while evaluating a path, the get operation short-circuits, and the value type is included in the JSON Graph subset that is returned as the result of the abstract get operation. Let’s take a look at this process in action. We will start with the same JSON Graph object we used in the previous section: 

(example)

This time we will attempt to retrieve the 9th item from the TODO list, even though the list is only three items long.   

(the path we will be evaluating)  

First we evaluate the ”todos” key, which yields an array.  There are more keys to be evaluated, so we continue. Then we evaluate the “9” key, and it is converted into a string using JSON stringify algorithm. We attempt to look up the value in the array, which yield an undefined value. The undefined value is added to the JSON Graph subset, which is returned as the result of the abstract get operation:

(Example of the resulting JSON Graph object)

## The Abstract set Operation  

In addition to retrieving values from a JSON graph object, it is possible to set values into a JSON Graph object. The abstract set operation accepts multiple Path/value pairs. It returns a subset of the JSON Graph that contains all of the primitive values encountered during path evaluation, as well as the values inserted into the JSON Graph. It is only legal to set primitive values into a JSON Graph object. A single set operation should modify only one value in the JSON Graph for each input path. If it is necessary to set values at paths which cannot be known ahead of time, you must use an abstract call operation instead. Set operations must be idempotent. 

Let’s walk through this process using the same JSON graph object we used in the previous section.  

(Example of the JSON graph object we have been using)   

We will attempt to mark the first task in the TODOs list as done using the following Path/value combination:  

(set to dues, zero, done to true)  

First we evaluate the ”todos” key, which yields an array.  There are more keys to be evaluated, so we continue. Then we evaluate the number “0” key, and it is converted into a string using JSON stringify algorithm. We attempt to look up the value in the array, and we find a reference:  

(reference value)  

References are primitive value types, and are therefore immediately inserted into the subset of the JSON Graph object that will be produced by the abstract get operation. However References are handled specially during path evaluation. If a Reference is encountered when there are still keys left in the path to be evaluated, a new path is created by concatenating the keys that have yet to be evaluated to the end of the reference path. This process is known as “path optimization”, because the optimized path we create is a quicker route to the requested value. Path optimization produces the following path: 

(optimized path)   

Once we create an optimized path, we begin evaluating it from the root of the JSON Graph object. 

(pointer to the root of the document, along with the optimized path)

Now we evaluate the “tasksById” key, which yields an object. Next, we convert the number 44 into a string using the JSON stringify algorithm. Then we look up the resulting string “44” which yields another object. Finally we arrive at the last key: “name”. We replace the value at this location with the new value: true. We also insert the value into the JSON Graph subset, and return the JSON Graph subset as the new result of the abstract set operation. 

(the string result) 

### Setting Beyond Primitive Values  

As we saw in the previous section, if we encounter a reference while evaluating a set path, the reference path is followed to the target object. As we now know, references are handled specially during path evaluation. However if we encounter a primitive value while setting a value into the JSON Graph object, then the primitive value is replaced with an object and the abstract set operation continues. Let’s see an example of this in practice. We will start with the same JSON graph object we used in the previous section:  

(Example)  

This time we will attempt to replace the ”done” key value with an object that contains one value: a boolean indicating that the task was completed. We cannot insert an object into a JSON Graph. Instead we will have to insert the value at a key within the value found at the “done” key. When an attempt is made to set a value at a key within a primitive value, the primitive value will be replaced with an object first.

(example)

First we evaluate the ”todos” key, which yields an array.  There are more keys to be evaluated, so we continue. Then we evaluate the number “0” key, and it is converted into a string using JSON stringify algorithm. We attempt to look up the value in the array, and we find a reference:  

(reference value)  

References are primitive value types, and are therefore immediately inserted into the subset of the JSON Graph object that will be produced by the abstract get operation. Then an optimized path is created using the reference path and the keys that have yet to be evaluated. 

(optimized path)   

Once we create an optimized path, we begin evaluating it from the root of the JSON Graph object. 

(pointer to the root of the document, along with the optimized path)  

Now we evaluate the “tasksById” key, which yields an object. Next, we convert the number 44 into a string using the JSON stringify algorithm. Then we look up the resulting string “44” which yields another object. Now we look up the ”name” key and find a primitive value: ”withdraw money from ATM”. As there are more keys to be evaluated, the object evaluating the abstract set operation attempts to replace the primitive value with an object. 

(example of JSON Graph subset and as well as original JSON Graph with object replaced overvalue) 

Now that we have reached the final key “completed”, we insert the boolean value “true” that key within the object we previously created. The value is also added at the same location within the JSON Graph subset, and returned as the result of the abstract set operation.

(example of what I said above)

### Value Coercion  

The object evaluating the abstract set operation may choose to coerce the value being set into a different value. If so, the JSON Graph object, as well as the JSON Graph subset response will contain the coerced value after the abstract set operation completes. Take the following JSON Graph object, which models titles that can be viewed in an online video streaming application.   

(For example)  

Let’s attempt to set the rating of the title to 10, even though the only ratings allowed are between 1 and 5.   

(Example)  

Firstly evaluate the “titlesById” key. We find a object, so we continue. We evaluate the number “721” key, and convert it into a string using the JSON stringify method. We find another object, so we continue. Finally we attempt to set the ”rating” key to “9”, and the object evaluating the abstract set operation instead sets the rating to the upper bound of valid values: “5”. The number five is inserted in both the JSON Graph object, as well as the JSON Graph subset. The JSON Graph subset response is returned as the result of the abstract set operation. 

## Call   

A JSON Graph object is not a strict subset of JSON. Unlike JSON objects, JSON Graph objects may contain Functions. Functions are callable blocks of code that return a subset of the JSON Graph object. Functions can be used to change multiple resources in a single round trip. Functions are most often used for adding and removing items from a list. Functions must be used whenever multiple values need to be changed together, such as adding items to a list.  Unlike get and set operations, function calls are not guaranteed to be idempotent.

Like JavaScript objects, functions can appear anywhere in the JSON Graph object. Like other non-primitive values, functions cannot be retrieved or set using the abstract get or set operations. It is only possible to call a function, and pass it arguments.  

In order to call a function, you must specify the path to the function, as well as the arguments to pass to the function. The arguments can be any JSON Graph value other than a function, including arrays, objects, and the primitive values.  A function must either return the new value at every path it has changed, or add the path to  the list of invalidated paths. The invalidated paths are a list of paths that may have been changed by the function. The invalidated paths are included in the function’s response along with the JSON Graph subset. Callers remove the invalidated paths from their local cache to ensure that their cache does not contain stale data.   Let’s walk through the process of adding an item to a list using call. We will use the JSON Graph object we used in the previous section.   

(same old example)   

In this example, we will call the ”push” function on the TODOs list. 

