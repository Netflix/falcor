# Falcor

## What is Falcor?

Every user wants to believe the entire cloud is stored on their device. Falcor creates this illusion for the developer.

Application servers use Falcor to represent all of their cloud data sources as one *Virtual JSON object.* Clients work with the *Virtual JSON object* in the cloud using the same simple APIs they use to work with in-memory JSON objects. Falcor transparently and efficiently manages all of the network communication needed to keep model data on the client and the server in sync.

### Getting Started

```
npm install falcor
```

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
  res.end(modelServer.serve(req));
});

var server = app.listen(80);
```
Now we've moved all of the data to the server without having to change the way in which we modify and retrieve data on the client. Now we can go one step further, and convert our server model to a virtual model so that we can store data in our backend data stores rather than in-memory on the Node server.

## Introducing JSON Graph

Nearly every application's domain model is graph.   however most application servers use JSON to send domain model objects over the wire. Converting graph data into JSON is a hazard, because JSON is heirarchical format. When you expand a graph into a tree, you get duplicates.



