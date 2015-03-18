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

### Retrieving Data from the Model

Falcor allows you to build a *Virtual JSON Model* on the server. The virtual model exposes all of the data that the client needs at a single URL on the server (ex. /model.json). On the client web developers retrieve data from the virtual model by setting and retrieving key, just as they would if the data were stored in memory.

(Example of a client retrieving a path)

When a client requests paths from the virtual model, the model attempts to retrieve the data from its local, in-memory cache. If the data at the requested paths can not be found in the local cache, a GET request is sent to the URL of the virtual model and the requested paths are passed in the query string. 

(Example URL)

The virtual JSON model on the server responds with a JSON fragment containing only the requested values. 

(Example Response including HTTP headers)

The JSON fragment from the server is added to the Falcor Model's local cache, which is just a fragment of the virtual JSON model on the server. 

(Example of Falcor cache)

Future requests for the same path will be served from the cache rather than the server.

### Building the Virtual Model on the Server

The reason that the server model is called "virtual" is that the JSON Object typically does not exist in memory or on disk. *A Falcor virtual model is like a little application server hosted at a single URL.* Instead of matching URL paths, the virtual model router matches one or more paths through a one JSON model. The virtual model generates the requested subset of the JSON model on-demand by loading the data from one or more backend data stores. 

(Example of using express and example of building a virtual model)

The virtual model exposes the entire JSON model at a single URL and accepts one or more paths in the query string. This allows the client to request as much of the graph as it needs within in a single HTTP request. 

### asynchronous model view controller



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

# JSON Graph

Nearly every application's domain model is graph.  However most application servers use JSON to send domain model objects over the wire. Converting graph data into JSON is a hazard, because JSON is heirarchical format. When you expand a graph into a tree, you either get duplicates, or introduce duplicates.

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

# Asynchronous MVC Pattern

The Falcor Model has an asynchronous API.

# Frequently Asked Questions

1. How do I retrieve all the data in a collection in a single request.

In general requesting the entire contents of a collection in a single request can be hazardous. While lists may start small, they can grow over time. If an application requests the entire contents of a list that can grow over time, it can eventually result in unnecessarily long load times and even out-of-memory exceptions.

*Falcor is designed for Applications that display information to human beings in real-time.* Rather than requesting the entire contents of a list, applications are encouraged to use paging to retrieve the first page as quickly as possible. Typically applications retrieve the first visible page of a list as well as the list length in one request to the Model (and consequently the server). At that point applications can choose whether to load the rest of the list as soon as the first page and length are displayed on screen, or simply lazily load pages as the user scrolls through the list.





An Array must be chosen if you would like to be able to retrieve the entire contents of the list in a single request, and none of the values within need to be paths. 



2. How do I retrieve an Object and all its descendants from a JSON Graph Model.

Clients must explicitly specify the path to every value they want to retrieve from a JSON Grap object.  JSON Graph values include strings, numbers, boolean values, Arrays, or Atomic Maps. It is not possible to retrieve a value from Falcor unless you know its path.



This should not be restrictive, because UIs know exactly what 

3. How do I filter or sort lists on the client?

Falcor clients do _not_ perform transformations on lists in the virtual model like filtering and sorting. Instead clients rely on the virtual model on the server to expose filtered or sorted versions of the lists for them. 

model.get("titleList.byRating[0...10].name");

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

