<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1016365/8711049/66438ebc-2b03-11e5-8a8a-75934f7ca7ec.png">
</p>

# Falcor [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Netflix/Falcor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![Build Status](https://magnum.travis-ci.com/Netflix/falcor.svg?token=2ZVUVaYjVQbQ8yiHk8zs&branch=master)](https://magnum.travis-ci.com/Netflix/falcor) [![Coverage Status](https://coveralls.io/repos/Netflix/falcor/badge.svg?branch=master&t=ntL3St)](https://coveralls.io/r/Netflix/falcor?branch=master) [![bitHound Score](https://www.bithound.io/projects/badges/4770b520-d88b-11e4-a6f0-f5ebff4ed569/score.svg)](https://www.bithound.io/github/Netflix/falcor)

## Developer Preview

**This release is a developer preview.** We are looking for community help to track down and fix bugs. We are also looking for help integrating with existing MVC frameworks, as well as ports to other platforms.

## Important Note for Webpack Users

If you're including falcor in your app, via npm and `require('falcor')`, and you're building a browser bundle for your app with Webpack, you'll need to add an alias entry for the 'rx' module in your webpack config, to avoid this RxJS bug: 'https://github.com/Reactive-Extensions/RxJS/issues/832'. You may already have such an entry, if you're using RxJS already. An example is below:

In webpack.config.js:

```
module.exports = {
  resolve: {
    alias: {
      // Workaround https://github.com/Reactive-Extensions/RxJS/issues/832, until it's fixed
      'rx$': <path to rx/dist/rx.js file >
    }
  }
};
```

## Getting Started

Set up a simple webpage, include the Falcor library, and run some code.

```html
<html>
  <head>
    <!-- This URL is _not_ a reliable source for this library in production. Please use only during development. -->
    <script src="https://cdn.rawgit.com/Netflix/falcor/master/dist/falcor.browser.js"></script>
    <script>
      var model = new falcor.Model({
        cache: {
          hello: "world"
        }
      });
      model.getValue("hello").then(function(value) {
        // prints "world"
        console.log(value);
      });
    </script>
  </head>
  <body>
  </body>
</html>
```

## What is Falcor?

Falcor is a JavaScript library for data fetching. Falcor lets you represent all of your cloud data sources as *One Virtual JSON Model* on the server. On the client, you code as if the entire JSON model is available locally. Falcor retrieves any data you request from the cloud on-demand, handling network communication transparently.

Falcor lets you model your data as a graph in JSON with the JSON Graph format. Falcor automatically optimizes and traverses references in your graph for you.

Falcor is not a replacement for your MVC framework, your database, or your application server. Instead you add Falcor to your existing stack to optimize client/server communication.

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
  source: new falcor.HttpDataSource("/person.json")
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
  source: new falcor.HttpDataSource("/person.json")
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

## Additional Resources

For detailed high-level documentation explaining the Model, the Router, and JSON Graph check out the [Falcor website](http://netflix.github.io/falcor).

For API documentation, go [here](http://netflix.github.io/falcor/doc/Model.html)

For a working example of a Router, check out the [falcor-router-demo](http://github.com/netflix/router-demo).
