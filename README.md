# Falcor [![Build Status](https://magnum.travis-ci.com/Netflix/falcor.svg?token=2ZVUVaYjVQbQ8yiHk8zs&branch=master)](https://magnum.travis-ci.com/Netflix/falcor) [![Coverage Status](https://coveralls.io/repos/Netflix/falcor/badge.svg?branch=master&t=ntL3St)](https://coveralls.io/r/Netflix/falcor?branch=master) [![bitHound Score](https://www.bithound.io/projects/badges/4770b520-d88b-11e4-a6f0-f5ebff4ed569/score.svg)](https://www.bithound.io/github/Netflix/falcor)

## Getting Started

First make sure you are using NPM v 2.7.5+. Some versions of NPM contain bugs which prevent repositories referenced with a git URL from being downloaded. You also need to **set up an SSH key on GitHub**, because some repositories that the project depends on are currently private.

First build:
```
git clone "git+ssh://git@github.com/Netflix/falcor.git"
cd falcor
npm install
npm install gulp -g
gulp dist
```
Now set up a simple webpage and import the newly-generated falcor library:
```html
<html>
  <head>
    <!-- The generated library can be found in the "dist" folder under the Falcor root. -->
    <script src="./dist/falcor.browser.js"></script>
    <script>
      var model = new falcor.Model(/* Model options */);
      // your code goes here
    </script>
  </head>
  <body>
  </body>
</html>
```

## What is Falcor?

Every user wants to believe that all the data in the cloud is stored on their device. Falcor lets web developers code that way.

Falcor is a JavaScript library for data fetching. Falcor lets you represent all of your cloud data sources as *One Virtual JSON Model* on the server. On the client, you code as if the entire JSON model is available locally. Falcor retrieves any data you request from the cloud on-demand, handling network communication transparently.

Falcor lets you model your data as a graph in JSON with the JSON Graph specification. Falcor automatically optimizes and traverses references in your graph for you.

Falcor is not a replacement for your MVC framework, your database, or your application server. Instead you add Falcor to your existing stack to optimize client/server communication. Falcor is ideal for mobile apps, because it combines the caching benefits of REST with the low latency of RPC.

You retrieve data from a Falcor model using the familiar JavaScript path syntax.   

```JavaScript 
var person = {
    name: "Steve McGuire",
    occupation: "Developer",
    location: {
      country: "US",
      city: "Pacifica",
      address: "344 Seaside"
    }
}

print(person.location.address);
```

This is the way you would retrieve data from the same JSON in a remote Falcor Model.  Note that the only difference is that the API is asynchronous.

```JavaScript
var person = new falcor.Model({
  source: new falcor.HttpSource("/person.json")
});

person.getValue("location.address").
  then(address => print(address));

// outputs "344 Seaside"
```

## How does Falcor work?

### Retrieving Data from the Model

Falcor allows you to build a *Virtual JSON Model* on the server. The virtual model exposes all of the data that the client needs at a single URL on the server (ex. /model.json). On the client you can retrieve data from the virtual model by setting and retrieving keys, just as you would from any JSON object stored in memory.

In this example the client requests several values from the virtual model on the server and then displays them on-screen.

```JavaScript
var person = new falcor.Model({
  source: new falcor.HttpSource("/person.json")
});

person.get("name", "location.city", "location.address").
  then(json => display(json));
```

When a client requests paths from the model, the model attempts to retrieve the data from its in-memory cache. If the data is not found in the local cache, the following GET request is sent to the virtual model on the server.
```
http://{yourdomain}/person.json?paths=[["name"], ["location", "city"], ["location", "address"]]
```

Note that rather than retrieve data from multiple endpoints, all of the data in the virtual model is exposed as single JSON resource. This means that the client can retrieve as much or as little of the graph as is required in a single HTTP request. 

The virtual JSON model on the server responds with a fragment of the virtual JSON model containing only the requested values. 

```
HTTP/1.1 200 OK
Content-Length: length
Content-Type: application/json; charset=utf-8
Content-Control: no-cache

{
  "paths": [["name"], ["location", "city"], ["location", "address"]],
  "value": {
    "name": "Steve McGuire",
    "location": {
      "city": "Pacifica",
      "address": "344 Seaside"
    }
  }
}
```

Upon receiving the requested data, the client merges the JSON fragment with a template and displays it. 


```hbs
<script id="person-template" type="text/x-handlebars-template">
  <span>{{name}} lives at {{location.address}}, {{location.city}}</span>
</script>
```

```JavaScript
var source   = $("#entry-template").html();
var template = Handlebars.compile(source);

function display(json) {
  // json is...
  // {
  //   "name": "Steve McGuire",
  //   "location": {
  //     "city": "Pacifica",
  //     "address": "344 Seaside"
  //   }
  // }

  document.body.innerHTML = template(json);
}
```

Each JSON fragment returned from the server is added to the local cache. Subsequent queries for the same paths do not result in a network request.

```JavaScript

print(JSON.stringify(person.getCache(), null, 2));
// prints
// {
//   "name": "Steve McGuire",
//   "location": {
//     "city": "Pacifica",
//     "address": "344 Seaside"
//   }
// }

// prints the name without making a network request.
person.
  getValue("name").
  then(print));

```

For more information see the [Falcor Model](https://github.com/Netflix/falcor/blob/gh-pages/model.md)

### Building the Virtual Model on the Server

The reason that the server model is called "virtual" is that the server JSON Object typically does not exist in memory or on disk. *A Falcor virtual model is like a little application server hosted at a single URL.* Instead of matching URL paths, the virtual model router matches one or more paths through a single JSON model. The virtual model generates the requested subset of the JSON model on-demand by loading the data from one or more backend data stores.

The following virtual model simulates a person model on the server:

```JavaScript
// Server
var falcor = require("falcor");
var Router = require("falcor-router");
var falcorExpress = require("falcor-express");

var express = require("express");
var app = express();

var person = new falcor.Model({
  source: new Router([
    {
      route: "['name', 'occupation']",
      get: (pathSet) => 
        personDB.
          exec(`SELECT ${pathSet[1].join(",")}
                  FROM user 
           WHERE id = ${request.cookies.userid}`).
           then(row => {
             jsong: {
                name: getProps(row, pathSet[0]),
                occupation: getProps(row, pathSet[1])
             }
    },
    {
      route: 'location["country", "city", "address"]',
      get: (pathSet) => 
        locationServer.
          getLocation(request.cookies.userid).
          then(location => ({
              jsong: { location: getProps(location, pathSet[2]) } 
          })
    }
  ])
});

var modelServer = new falcor.HttpModelServer(person);

app.get("/person.json", function (req, res) {
  falcorExpress.serve(req, function(error, output) {
    res.end(output)
  });
});

var server = app.listen(80);
```

The virtual model exposes the entire JSON model at a single URL and accepts one or more paths in the query string. This allows the client to request as much of the graph as it needs within in a single HTTP request. 

For more information on the router, see

## Learn Falcor: Video Tutorials

### 1. [Introduction to the Model](https://www.youtube.com/watch?v=xby_MUlBOw0)

In this video will learn how to work with JSON data indirectly through a Falcor Model. The Falcor Model allows you to work with data using the same familiar JavaScript path syntax. However the Model uses a push API, sending the data to a callback rather than returning it immediately. Using a push API means that you can move your data anywhere in the network later on, without changing the data retrieval code in your client.

### 2. [Retrieving Multiple Values](http://youtu.be/6c0BEPywkYc)

In addition to being able to retrieve a path from a Falcor Model, you can also retrieve multiple Path Sets. Path Sets are paths that contain ranges or multiple string keys inside of indexers. In addition to being able to retrieve a Path Set, you can also retrieve as many paths as you like in a single method call.

### 3. [Intro to JSON Graph](https://www.youtube.com/watch?v=2xX5JTHWw4Q)

JSON is a very commonly used data interchange format. Unfortunately while most application domain models are graphs, JSON is designed to model hierarchical information. To get around this problem, Falcor introduces JSON Graph. JSON Graph introduces references to JSON, allowing you to ensure that no object appears more than once in your JSON.

### 4. [Building Paths Programmatically](https://www.youtube.com/watch?v=XyMHk4wKg3Q)

In this video you will learn how to build Paths and Path Sets programmatically using Arrays.

### 5. [JSON Graph in-depth](https://www.youtube.com/watch?v=9tAvnn-Wd14)

In this video you will learn why it is only possible to retrieve value types from a Falcor Model. The prohibition against retrieving Objects or Arrays from your JSON object leads to more predicable server performance, because server requests stay approximately the same speed despite the growth of your backend data set.

### 6. [Retrieving Data from the Server](http://youtu.be/dlcqUcjR1Ig)

In this video you will learn how to retrieve data from an Node application server running express. You'll also learn about the DataSource interface, and how Models use DataSources to retrieve JSON data.

### 7. [Path Optimization](https://www.youtube.com/watch?v=PlG55w_G9mw)

One of the most powerful optimizations Falcor makes when requesting data from the server is Path Optimization. When patterns are requested from the model, the model checks it's local cache first, and if the value is not present, requests the data from its data source (usually the server). However if references are encountered while evaluating the path against the cache, the Model uses them to optimize the path before forwarding the path request to the data source. By providing optimized paths to the server Falcor can reduce the cost of retrieving data from your persistent data stores.

### 8. [Batching Requests](https://www.youtube.com/watch?v=ulK8m8_HGJg)

In addition to caching and path optimization, the Falcor Model provides one more optimization when requesting data from the server: batching. By creating a batched Falcor Model you can collapse multiple concurrent path requests into a single HTTP request.
