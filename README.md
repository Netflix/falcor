# Falcor

## What is Falcor?

Every user wants to believe the entire cloud is stored on their device. Falcor lets web developers code that way.

Elephant lets you build *One Isomorphic JSON model* for your application. On the client, developers code against the Isomorphic model as if it was stored in memory. In reality the data in the model could be stored anywhere: the client, the app server, or in multiple back end data stores.

*Falcor is not a replacement for your database, your application server, or your MVC framework.* Instead Falcor is a protocol for client server communication which can allow these parts of your architecture to communicate more efficiently and conveniently.

On the server, Elephant lets you create a Virtual Model. A Virtual model is as a view of the data in your backend data stores. Instead of being stored in memory or on disk, You create a virtual JSON model by matching path requests to routes that create sections of the document.

Three-dimensional flexibility

Developers code against the isomorphic model using the same API they used to code against a normal JSON object. 



On the client you code against the model as if it was stored in memory, but the data might be cached locally, stored in memory on the server, or retrieved lazily from multiple data sources. Falcor transparently and efficiently manages all of the network communication needed to keep model data on the client and the server in sync.


### Getting Started

##  One Model, Available Everywhere

*Falcor is not a replacement for your database, application server, or your MVC framework.* Falcor let's you take any number of cloud data sources and represent them as a *Virtual JSON object* on the server.  On the client you use this virtual JSON object as the *M in your MVC.*

## The Data is the API

When you work with JSON data on the client, you use simple operations like get and set to retrieves and mutate data within the object. 

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
If we load the same JSON in into a Falcor Model cache we can retrieve the data using the same series of keys. The only difference is that the API is Reactive (Push).

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

Using push APIs allows us to gives us the flexibility to move the data to the server without changing the way the client API.

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

## Building End points for our Issue Tracking System

The domain model of our issue tracking system is a graph. Any user could be related to any other user via the comments they leave on each others issues. That means downloading all of the data for a single user could result in downloading all of the users in the domain model!

To avoid this problem, web applications generally have two choices:

1. Build a restful API
2. Build customized endpoints for each view, each of which contains just enough information about each entity the views purposes.

### RESTful Solution

A restful solution makes caching simple, because each entities data is kept separate from every other entities data. 


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



###  Building your first JSON Graph




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
