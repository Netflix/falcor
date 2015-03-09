# Falcor

## What is Falcor?

Every user wants to believe all the data in the cloud is stored on their device. Falcor lets web developers code that way.

Falcor lets you represent all of your cloud data sources as *One Virtual JSON Model* on the server. On the client you code as if the entire JSON model is available locally, retrieving and setting values at keys. Falcor retrieves any data you request from the cloud on-demand, handling network communication transparently.

## One Model Everywhere

When you work with a JSON object on the client, you retrieve and set values at keys within the object.

```JavaScript
var person = {
 	name: “Steve McGuire”,
 	occupation: “Developer”,
 	location: {
  		country: “US”,
	  	city: “Pacifica”,
		  address: “344 Seaside”
	 }
}

print(person[“location”][“address”]);		
// prints 344 Seaside

```
In the example above, the sequence of keys "location" and "address" describe a *Path* to the person's street address value in the JSON object. To retrieve the same address value from a Falcor JSON Model, we pass the same sequence of keys to the Model's get method.

```JavaScript
var person = new falcor.Model({
  cache: {
    name: “Steve McGuire”,
    occupation: “Developer”,
    location: {
    country: “US”,
    city: “Pacifica”,
    address: “344 Seaside”
  }
});

person.
  getValue([“location”, “address”]).
  toPromise().
  then(address => console.log(address));

// prints 344 Seaside
```

This example isn't very compelling. We've demonstrated that you can use the same path of keys to retrieve values from either a Falcor JSON Model or an in-memory JSON object, but so what?

One important difference between an in-memory JSON object and a Falcor Model, is that the Falcor Model's API is *asynchronous.* Note that in the example above, the Falcor Model returns a Promise. This gives Falcor Models the flexibility to retrieve the data from a remote server.

```JavaScript
// Browser
var person = new falcor.Model({
  source: new falcor.XMLHttpSource("/person.json")
});

person.get([“location”, “address”],
	 (address) => print(address)).
    toPromise();

// prints 344 Seaside

// Server
var falcor = require('falcor');
var falcorExpress = require('falcor');

var express = require('express');
var app = express();

var person = new falcor.Model({
  cache: {
    name: “Steve McGuire”,
    occupation: “Developer”,
    location: {
      country: “US”,
      city: “Pacifica”,
      address: “344 Seaside”
    }
  }
});

var modelServer = new falcor.HttpModelServer(person);

app.get('/person.json', function (req, res) {
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

person.get([“location”, “address”],
	 (address) => print(address)).
    toPromise();

// prints 344 Seaside

// Server
var falcor = require('falcor');
var falcorExpress = require('falcor');

var express = require('express');
var app = express();

var person = new falcor.Model({
  new falcor.Router([
    {
      route: [“person”, [“name”,”occupation”]],
      get: (pathSet) => 
        personDB.
          exec(`SELECT ${pathSet[1].join(‘,’)}
                  FROM user 
    		    WHERE id = ${request.cookies.userid}`)
    },
    {
      route: [“person”,“location”,[“country”, ”city”, “address”]],
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

app.get('/person.json', function (req, res) {
  falcorExpress.serve(req, function(error, output) {
    res.end(output)
  });
});

var server = app.listen(80);
```
## How to use Falcor in your Application

Falcor allows you to build a *Virtual JSON Model* on the server. A virtual model is a view of the data in your backend services that is ideal for the needs of your web application. The virtual model exposes all of the data that the client needs at a single URL on the server (ex. /model.json). On the client web developers retrieve data from the virtual model as if it was stored in memory, by looking up paths of keys.

(Example of a client retrieving a path)

When a client requests paths from the virtual model, the model attempts to retrieve the data from its local, in-memory cache. If the data at the requested paths can not be found in the local cache, a GET request is sent to the URL of the virtual model and the requested paths are passed in query string. 

(Example URL)

The virtual JSON model on the server responds with a JSON fragment containing only the requested values. 

(Example Response including HTTP headers)

The reason that the server model is called "virtual" is that the JSON Object typically does not exist in memory or on disk. The virtual model actually behaves like an *application server* hosted at a single URL. The virtual model matches routes against the paths requested from the virtual JSON model, and generates the requested JSON fragments on-demand by retrieving the data from one or more backend data stores. Instead of matching URL paths, the virtual model's router matches the multiple JSON paths passed in the query string to the JSON resource on the server.



(Example of using express and example of building a virtual model)

By exposing all of the data at a single URL instead of using a Web server to create a separate URL for each resource. The answer is that by exposing our entire model at a single endpoint, we can request as much of the graph as we want in a single HTTP request. 

In an application server, routers are used to match URLs. A virtual model exposes all of its data at a single URL, 

Virtual models are not general purpose server APIs. Instead they are optimized for use by one particular web application. 

Three-dimensional flexibility

Developers code against the isomorphic model using the same API they used to code against a normal JSON object. 



On the client you code against the model as if it was stored in memory, but the data might be cached locally, stored in memory on the server, or retrieved lazily from multiple data sources. Falcor transparently and efficiently manages all of the network communication needed to keep model data on the client and the server in sync.




# A Simple Issue Tracking App with Falcor

Let's imagine we are building a simple issue tracking system. The system has three types of entities:

1. Users
2. Issues
3. Comments

When the application loads, the current user is presented with a list of issues. They can filter the list for only those issues that are assigned to them, or view all issues.

(Image)

Once an issue is selected, the issue detail view is displayed. 

(Image)

When viewing details of an individual issue, the user may edit fields, add comments, and view comments left on the issue by other users.

## Contrasting Falcor with other Alternatives

The domain model of our issue tracking system is a graph. Any user could be related to any other user via the comments they leave on each others issues. That means downloading all of the data for a single user could result in downloading all of the users in the domain model!

To avoid this problem, web applications generally have two choices:

1. Build a RESTful API
2. Build customized endpoints for each view, each of which contains just enough information about each entity the views purposes.


# Why not REST?

A restful solution would involve creating separate end points for each entities data. makes caching simple, because each entities data is kept separate from every other entities data. 


However it may be necessary to make multiple sequential network request to retrieve enough information to display a single view. In practice this introduces too much latency for many web applications, particularly those intended to be used on mobile devices (ie most of them).

Rest was designed for the WWW. It was intended to serve coarse-grained resources like documents and images. Most web applications deal with fine-grained resources like JSON objects and simple values (ex. a movie rating). In many cases these resources maybe smaller than the H TTP envelope in the response. 

In practice, a purely RESTful model introduces too much latency and overhead for most web applications.

### Customized End Points

The Primary benefit of building a customized end point is that you can avoid the sequential requests forced by the RESTful model. Rather then download the data for one entity, and then follow up with any number of sequential calls to retrieve the data for linked entities, the server can retrieve the client all of the data necessary for a view with a single network request. 

Unfortunately this API is much harder to cache  Since each server endpoint may contain overlapping fragments of data from multiple entities, it is not possible to cash the data

The document return by the server for the true master page might look something like this:

(JSON)

I latency makes a restful model a nonstarter for most mobile applications.



In order to avoid inadvertently downloading the entire graph whenever we download an entity, most web applications either build customized endpoints for each view, or adopt a RESTful model.



###  JSON Graph

Nearly every application's domain model is graph.  However most application servers use JSON to send domain model objects over the wire. Converting graph data into JSON is a hazard, because JSON is heirarchical format. When you expand a graph into a tree, you either get duplicates, or introduce unique identifiers.

Let's imagine we are building a simple issue tracking system. The system has three types of entities:

1. Issues
2. Users
3. Comments

Each user is presented with a list of issues assigned to them, and every issue can contain one or more comments from any user in the system.

The client must display issues and allow comments from users.  Each user is displayed a set of issues assigned to them. 

 When 

```JavaScript
{
  id: 234,
  name: "Information sent over the wire contains duplicates.",
  assignedTo: {
    id: 234352,
    name: "Steve McGuire",
    image: "/headshots/234352.png"
  },
  status: "open",
  comments: [
    {
      text: "This is a serious issue, it could lead to stale caches",
      user: {
        id: 512,
      	name: "Satyen Desai",
        image: "/headshots/512.png"
      }
    },
    {
      text: "It also bloats the size of the message!",
      user: {
        id: 234352,
      	name: "Steve McGuire",
        image: "/headshots/234352.png"
      }
    }
  ]
}
```

Rather than create a model of a single issue, let's create the model for the entire domain graph of the issue tracking system.  It will contain all of the data in the cloud, all of the issues, comments, and users.  This model would obviously be too large for any individual client to download. Furthermore we will not actually create  the model, anymore than web applications like Amazon actually have static HTML stored for every individual user. when sections of the model are requested
Mu*
You can convert any JSON  object to a JSON Graph Object in three easy steps.
 
1.  Move all types of objects with non-overlapping to a shared location in the JSON object.

# Frequently Asked Questions

1. How do I retrieve all the data in a collection in a single request.

In general requesting the entire contents of a collection in a single request can be hazardous. While lists may start small, they can grow over time as the data in backend data store grows. If an application request the entire contents of a list that gradually grows over time, it can eventually result in unnecessarily long load times and even out-of-memory exceptions.

*Falcor is designed for Applications that display information to human beings in real-time.* Rather than requesting the entire contents of a list, applications are encouraged to use paging to retrieve the first  based on the clients screen-size.



An Array must be chosen if you would like to be able to retrieve the entire contents of the list in a single request, and none of the values within need to be paths. 



2. How do I retrieve a branch node and all fonts children from a JSON Graph Model.


