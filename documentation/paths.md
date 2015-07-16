---
layout: page
title: model
menu: home
lang: en
---

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}

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
* 'todos[0..1]["name","done"]' is equivalent to "todos[0].name", "todos[0].done", "todos[1].name", and "todos[1].done"
* "todos[0..1, "length"] is equivalent to "todos[0]", "todos[1]", and "todos.length"

### PathSet Array

PathSet Syntax Strings expand on the Path Syntax Grammer, adding ranges, and the ability to specify multiple keys or ranges in indexers. PathSet Syntax Strings are immediately parsed into PathSet Arrays, which has a run-time cost. Any Models which can accept multiple Paths can also accept PathSets.

The following PathSet Strings are valid:

* ["todos", { from: 0, to: 2 }, "name"] is equivalent to ["todos", 0, "name"], ["todos", 1, "name"], and ["todos", 2, "name"]
* ["todos", { from: 0, length: 2 }, "name"] is equivalent to ["todos", 0, "name"], and ["todos", 1, "name"]
* ["todos", { length: 2 }, "name"] is equivalent to ["todos", 0, "name"], and ["todos", 1, "name"]
* ["todos", { from: 0, to: 1 }, ['name','done']] is equivalent to ["todos", 0, "name"], ["todos", 0, "done"], ["todos", 1, "name"], and ["todos", 1, "done"]
* ["todos", [{from: 0, to: 1}, "length"]] is equivalent to ["todos", 0], ["todos", 1], and ["todos", "length"]
