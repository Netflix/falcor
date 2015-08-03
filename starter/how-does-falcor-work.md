---
layout: plain-page
title: How Does Falcor Work?
id: how_does_falcor_work
lang: en
---

## How does Falcor work?

### Retrieving Data from the Model

Application Servers use falcor's Router to represent all their backend data as a single *Virtual JSON resource* (ex. /model.json). Application Client's use a falcor Model to work with the App Server's Virtual JSON resource as if the entire JSON object was available locally.

In this example the client requests several values from the virtual model on the server and then displays them on-screen.

~~~js
var model = new falcor.Model({
  source: new falcor.HttpDataSource("/model.json")
});

model.get("user.name", "user.location.city", "user.location.address").
  then(json => display(json));
~~~

When a client requests paths from the Model, the Model attempts to retrieve the data from its in-memory cache. If the data is not found in the local cache, the following GET request is sent to the virtual model:

~~~js
/model.json?method=get&paths=[["user","name"],["user","location","city"],["user","location","address"]]
~~~

Note that rather than retrieve data from multiple endpoints, all of the data as a single JSON resource. This allows the client can retrieve all of the data it needs in a single HTTP request. 

The Application Server responds with the requested subset of the virtual JSON resource containing only the requested values. 

~~~output
HTTP/1.1 200 OK
Content-Length: length
Content-Type: application/json; charset=utf-8
Content-Control: no-cache

{
  "jsong": {
    "user": {
      "name": "Steve McGuire",
      "location": {
        "city": "Pacifica",
        "address": "344 Seaside"
      }
    }
  }
}
~~~

Upon receiving the requested data, the client merges the resulting JSON object with a template and displays it. 


~~~html
<script id="person-template" type="text/x-handlebars-template">
  <span>{{user.name}} lives at {{user.location.address}}, {{user.location.city}}</span>
</script>
~~~

~~~js
var source   = $("#entry-template").html();
var template = Handlebars.compile(source);

function display(json) {
  // json is...
  // {
  //   "json": {
  //     "user": {
  //       "name": "Steve McGuire",
  //       "location": {
  //         "city": "Pacifica",
  //         "address": "344 Seaside"
  //       }
  //     }
  //   }
  // }

  document.body.innerHTML = template(json);
}
~~~

Each JSON fragment returned from the server is added to the Model's local cache. Subsequent queries for the same paths do not result in a network request.

~~~js
print(JSON.stringify(model.getCache(), null, 2));
// prints
  // {
  //  "user": {
  //    "name": "Steve McGuire",
  //    "location": {
  //      "city": "Pacifica",
  //      "address": "344 Seaside"
  //    }
  //   }
  // }

// prints the name without making a network request.
person.
  getValue("user.name").
  then(print));
~~~

For more information see the [Falcor Model]({{ site.baseurl }}/model/model.html)

### Building the Virtual Model on the Server

The reason that the server model is called "virtual" is that the server JSON Object typically does not exist in memory or on disk. *A Falcor virtual model is like a little application server hosted at a single URL.* Instead of matching URL paths, the virtual model router matches one or more paths through a single JSON model. The virtual model generates the requested subset of the JSON model on-demand by loading the data from one or more backend data stores.

The following virtual model simulates a person model on the server:

~~~js
// Server
var falcor = require("falcor");
var Router = require("falcor-router");
var falcorExpress = require("falcor-express");

var express = require("express");
var app = express();

var person = new falcor.Model({
  source: new Router([
    {
      route: "user.['name', 'occupation']",
      get: (pathSet) => 
        personDB.
          exec(`SELECT ${pathSet[1].join(",")}
                  FROM user 
           WHERE id = ${request.cookies.userid}`).
           then(row => {
             jsong: {
                user: {
                  name: getProps(row, pathSet[0]),
                  occupation: getProps(row, pathSet[1])
                }
             }
    },
    {
      route: 'user.location["country", "city", "address"]',
      get: (pathSet) => 
        locationServer.
          getLocation(request.cookies.userid).
          then(location => ({
              jsong: { user: { location: getProps(location, pathSet[2]) } }
          })
    }
  ])
});

var modelServer = new falcor.HttpModelServer(person);

app.get("/person.json", falcorExpress.dataSourceRoute(function (req, res) {
    res.end(output)
});

var server = app.listen(80);
~~~

The virtual model exposes the entire JSON model at a single URL and accepts one or more paths in the query string. This allows the client to request as much of the graph as it needs within in a single HTTP request. 

For more information on the router, see {% include link.to id="router" text="Falcor Router" %}


