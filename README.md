# Falcor [![Build Status](https://magnum.travis-ci.com/Netflix/falcor.svg?token=2ZVUVaYjVQbQ8yiHk8zs&branch=master)](https://magnum.travis-ci.com/Netflix/falcor) [![Coverage Status](https://coveralls.io/repos/Netflix/falcor/badge.svg?branch=master&t=ntL3St)](https://coveralls.io/r/Netflix/falcor?branch=master) [![bitHound Score](https://www.bithound.io/projects/badges/4770b520-d88b-11e4-a6f0-f5ebff4ed569/score.svg)](https://www.bithound.io/github/Netflix/falcor)

## Getting Started

First make sure you are using NPM v 2.7.5+. Some versions of NPM contain bugs which prevent repositories referenced with a git URL from being downloaded. You also need to **set up an SSH key on GitHub**, because some repositories that the project depends on are currently private.

First build:
```
npm install falcor
npm install gulp -g
gulp dist
```
Now set up a simple webpage and import the newly-generated falcor library:
```html
<html>
  <head>
    <!-- The generated library can be found in the "dist" folder under the Falcor root. -->
    <script src="./dist/Falcor.js"></script>
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

Every user wants to believe all the data in the cloud is stored on their device. Falcor lets web developers code that way.  

Falcor lets you represent all of your cloud data sources as *One Virtual JSON Model* on the server. On the client you code as if the entire JSON model is available locally, retrieving and setting values at keys. Falcor retrieves any data you request from the cloud on-demand, handling network communication transparently. Netflix uses Falcor to efficiently download and cache catalog data.

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

Note that rather than retrieve data from multiple endpoints, all of the data in the virtual model is exposed as single JSON resource. This means that the client can retrieve as much or as little of the graphAs is required in a single HDP request. Furthermore each resource

 and the requested paths within the JSON object are passed in the query string. Disallows the

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
    "occupation": "Developer",
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
  <span{{name}} lives at {{location.address}}, {{location.city}}</span>
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

### Building the Virtual Model on the Server

The reason that the server model is called "virtual" is that the server JSON Object typically does not exist in memory or on disk. *A Falcor virtual model is like a little application server hosted at a single URL.* Instead of matching URL paths, the virtual model router matches one or more paths through a a single JSON model. The virtual model generates the requested subset of the JSON model on-demand by loading the data from one or more backend data stores.

The following virtual model simulates a person model on the server:

```JavaScript
// Server
var falcor = require("falcor");
var falcorExpress = require("falcor");

var express = require("express");
var app = express();

var person = new falcor.Model({
  router: new falcor.Router([
    {
      route: ["name","occupation"],
      get: (pathSet) => 
        personDB.
          exec(`SELECT ${pathSet[1].join(",")}
                  FROM user 
           WHERE id = ${request.cookies.userid}`)
    },
    {
      route: ["location",["country", "city", "address"]],
      get: (pathSet) => 
        locationServer.
          getLocation(request.cookies.userid).
          then(location => ({
            person: { location: getProps(location, pathSet[2]) } 
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

# Frequently Asked Questions

1. Why not use REST?

## Why use Falcor?

Falcor uses an architecture which is ideal for web applications that retrieve all or most of their data from a single domain and have a data model that changes infrequently (more reads than writes). For these types of applications, Falcor can be a better choice than REST.

Four years ago, Netflix attempted to build a RESTful API. The goal was to get two desirable properties of RESTful architectures: Cache Coherence and Loose Coupling. Gradually the impracticality of rest became clear. Latency was much too high And message sizes were much too large, particularly for mobile

### Cache Coherence

The **Netflix UI is primarily a browsing problem.** Although we frequently add new titles for our members to enjoy, the catalog is unlikely to change substantially within the period of a single user's session (1-3 hours). That means that the average user session is spent browsing through a large, static catalog. It is precisely these types of problems that benefit greatly from caching.

When you maintain a cache, it is important for the cache to remain coherent. Cache coherence means that the data in the local cache is up-to-date with the changes on the server. Failure to ensure cache coherence can cause stale data to be displayed to the user. Imagine rating "House of Cards" in the "Recently Watched" list only to find that your rating is not reflected in the same title when it appears in "New Releases."

![alt text](http://netflix.github.io/falcor/staledata.png "Stale Data")

RESTful systems achieve Cache Coherence by ensuring that data appears in only one resource. For Netflix this meant creating a separate resource for each individual title.

http://netflix.com/title/23432

{
  id: 23432,
  name: "House of Cards",
  rating: 5,
  description: "This Emmy-winning original thriller series stars Golden Globe winner Kevin Spacey as ruthless, cunning Congressman Francis Underwood, who will stop at nothing to conquer the halls of power in Washington D.C. His secret weapon: his gorgeous, ambitious, and equally conniving wife Claire (Golden Globe winner Robin Wright).",
  boxshotURL: "http://cdn6.nflximg.net/webp/8266/13038266.webp",
  // more fields
}

This made it possible to update the rating of the title with a single PUT.

### Loose Coupling

RESTful APIs Are loosely coupled and can be used by many different applications. This was important to Netflix as we already had several different applications, including a Tablet, Phone, and TV app. Rather than have the EDGE team build and maintain APIs for each of these applications, the decision was made to build-loosely coupled API that could be used by all UIs.

### The Trouble with REST

The impracticality of using REST became clear overtime.

Another reason for building a loosely coupled API for applications is that Netflix already had several different applications that had different needs. 

Reflecting the different media sizes different applications would display more or less fields on certain screens. 
The World Wide Web is easy for browsers to cache because each individual resource is found a separate URL. When you visit a site the contents of that site are placed in the browser cache and the URL is used as the key. If the same resource needs to be made available at two different URLs, one URL can redirect to the other. As a result no website need ever appear twice in the browser cache. Eliminating duplicate resources from the browser cache reduces the risk of stale data being displayed to the user. 

In addition to a resource being available at two different locations callAnother source of stale dataIs went to the data into resources overlap. For example Let's say the following URL

http://netflix.com/genreLists?rowOffset=5&rowPageSize=5&colOffset=5&colPageSize=10



Rather than duplicate a resource in multiple a URL Can redirect to another location. Resources are found in a single location, and it is possible to create a reference to a resource in another location using a HTTP redirect. 

Netflix created resources for each of its domain model entities. 
```
http://netflix.com/titles/23432

```
These resources Did not overlap at first, making it easy to cash them individually


1. How do I retrieve all the data in a collection in a single request.

In general requesting the entire contents of a collection in a single request can be hazardous. While lists may start small, they can grow over time. If an application requests the entire contents of a list that can grow over time, it can eventually result in unnecessarily long load times and even out-of-memory exceptions.

*Falcor is designed for Applications that display information to human beings in real-time.* Rather than requesting the entire contents of a list, applications are encouraged to use paging to retrieve the first page as quickly as possible. Typically applications retrieve the first visible page of a list as well as the list length in one request to the Model (and consequently the server). At that point applications can choose whether to load the rest of the list as soon as the first page and length are displayed on screen, or simply lazily load pages as the user scrolls through the list.


An Array must be chosen if you would like to be able to retrieve the entire contents of the list in a single request, and none of the values within need to be paths. 

2. How do I retrieve an Object and all its descendants from a JSON Graph Model.

Clients must explicitly specify the path to every value they want to retrieve from a JSON Grap object.  JSON Graph values include strings, numbers, boolean values, Arrays, or Atomic Maps. It is not possible to retrieve a value from Falcor unless you know its path.

This should not be restrictive, because UIs know exactly what 

3. How do I filter or sort lists on the client?

Falcor clients do _not_ perform transformations on lists in the virtual model like filtering and sorting. Instead clients rely on the virtual model on the server to expose filtered or sorted versions of the lists for them. 

```JavaScript
model.get("titleList.byRating[0...10].name");
```

In the example above, virtual model provides a "byRating" key on the titleList which is it sorted version of the same list. 

(Example router code showing how to build a list sorted by by rating)

It is rarely efficient to download all of the data on the server onto the client and perform transformations locally. Instead of trying to enable client-side transformations, Falcor clients rely on the virtual model to do all the data transformation. Falkor clients focus only on data retrieval.

# Asynchronous MVC

The Falkor model is asynchronous. This makes it possible for applications to use the Async MVC pattern (AMVC). The AMTC pattern can be used in any MVC framework. 

## Local MVC

The local NBC pattern involves downloading all of the data in the cloud to the client.
The role of the controller is to interpret commands, select a model from the graph and a View to serve as it's visual representation. Views access any information in the model they require to render.


It is possible to use the NBC fruit pattern in any popular embassy framework, whether it be written, Amber. The AMTC pattern is easy donor stand. Imagine how you would put your application if all of the data in the cloud or sitting in a Jason object and memory.

, Because you have only one model. The controllers responsibility actions, 

Imagine all of the data he required for you I'm application was available in memory.

In the example above, the sequence of keys "location" and "address" describe a *Path* to the person's street address value in the JSON object. To retrieve the same address value from a Falcor JSON Model, we pass the same sequence of keys to the Model's get method.

```JavaScript
var person = new falcor.Model({
  cache: {
    name: "Steve McGuire",
    occupation: "Developer",
    location: {
    country: "US",
    city: "Pacifica",
    address: "344 Seaside"
  }
});

person.getValue(["location", "address"])
    then(address => print(address));

// prints 344 Seaside
```

This example isn't very compelling. We've demonstrated that you can use the same path of keys to retrieve values from either a Falcor JSON Model or an in-memory JSON object, but so what?

One important difference between an in-memory JSON object and a Falcor Model, is that the Falcor Model's API is *asynchronous.* Note that in the example above, the Falcor Model returns a Promise. This gives Falcor Models the flexibility to retrieve the data from a remote server.

```JavaScript
// Browser
var person = new falcor.Model({
  source: new falcor.XMLHttpSource("/person.json")
});

person.get(["location", "address"],
     (address) => print(address)).
    toPromise();

// prints 344 Seaside

// Server
var falcor = require("falcor");
var falcorExpress = require("falcor");

var express = require("express");
var app = express();

var person = new falcor.Model({
  cache: {
    name: "Steve McGuire",
    occupation: "Developer",
    location: {
      country: "US",
      city: "Pacifica",
      address: "344 Seaside"
    }
  }
});

var modelServer = new falcor.HttpModelServer(person);

app.get("/person.json", function (req, res) {
  falcorExpress.serve(req, function(error, output) {
    res.end(output)
  });
});

var server = app.listen(80);
```

Now we've moved all of the data to the server without having to change the way in which we modify and retrieve data on the client. Now we can go one step further, and convert our server model to a virtual model so that we can store data in our backend data stores rather than in-memory on the Node server.

```JavaScript
// Browser
var person = new falcor.Model({
  source: new falcor.XMLHttpSource("/person.json")
});

person.getValue(["location", "address"])
    then(address => print(address));

// prints 344 Seaside

// Server
var falcor = require("falcor");
var falcorExpress = require("falcor");

var express = require("express");
var app = express();

var person = new falcor.Model({
  new falcor.Router([
    {
      route: ["person", ["name","occupation"]],
      get: (pathSet) => 
        personDB.
          exec(`SELECT ${pathSet[1].join(",")}
                  FROM user 
                WHERE id = ${request.cookies.userid}`)
    },
    {
      route: ["person","location",["country", "city", "address"]],
      get: (pathSet) => 
        locationServer.
          getLocation(request.cookies.userid).
          then(location => ({
            person: { location: getProps(location, pathSet[2]) } 
          })
    }
  ])
});

(new falcor.HttpServer(person)).listen(80);

var modelServer = new falcor.HttpModelServer(person);

app.get("/person.json", function (req, res) {
  falcorExpress.serve(req, function(error, output) {
    res.end(output)
  });
});

var server = app.listen(80);
```

You can also retrieve multiple paths from a Falcor model, and the model will batch them into a single network request.

```JavaScript
var person = new falcor.Model({
  source: new falcor.HttpSource("/person.json")
});

person.get("genreLists[0..1][0..1].boxshot").
  then(json => JSON.stringify(json));

// outputs...
//  {
//    "genreLists": {
//      "0": {
//        "0": { "boxshot": "/237843.png" },
//        "1": { "boxshot": "/328432.png" }
//      },
//      "1": {
//        "0": { "boxshot": "/7832443.png" },
//        "1": { "boxshot": "/432432.png" }
//      }
//    } 
// }
```
