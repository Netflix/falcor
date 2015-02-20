# Falcor

## What is Falcor?

Every user wants to believe the entire cloud is stored on their device. Falcor creates this illusion for the developer.

Application servers use Falcor to represent all of their cloud data sources as one *Virtual JSON object.* Clients work with the *Virtual JSON object* in the cloud in a manner similar to local JSON objects. Falcor transparently and efficiently manages all of the network communication needed to keep model data on the client and the server in sync.

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

Now we've moved all of the data to the server without having to change the way in which we modify and retrieve data on the client. Now we can go one step further, and convert our server model to a virtual model so that we can store data in our backend data stores rather than in-memory on the Node server.

## Building a simple issue tracking application with Falcor

Let's imagine we are building a simple issue tracking system. The system has three types of entities:

1. Issues
2. Users
3. Comments

When the application loads, the current user is presented with a list of issues. They can filter the list for only those issues that are assigned to them, or view all issues.

(Image)

Once they select an issue, the issue detail view is displayed. 

When viewing details of an individual issue, the user may edit fields, add to comments and view comments left on the issue by other users.






###  Building your first JSON Graph

Our issue tracking system is a graph. Any user can be related to any other user through the comments they leave on the  


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
You can convert any JSON  object to a JSON Graph Object in three easy steps.
 
1.  Move all types of objects with non-overlapping to a shared location in the JSON object.
