The Falcor Model
 
Falcor provides a Model object, which is intended to be the "M" in your MVC. An application that uses Falcor doesn't work with JSON data directly, but indirectly through the Model object. The model object provides a set of familiar JavaScript APIs for working with JSON data, including get, set, and call. The main difference between working with JSON data directly and working with it indirectly through a Model object, is that the Falcor Model has a push API.

(Two examples contrasting the same operation against an in memory JSON object and a model)
```
var log = console.log.bind(console)
var model = {
    people: [
        {
            name: 'Barack Obama',
            title: 'President',
            country: 'USA'
        },
        {
            name: 'Philémon Yang',
            title: 'Prime Minister',
            country: 'Cameroon'

        }
    ]
};

console.log(model.people[0].name);



var model = new falcor.Model({cache: {
    people: [
        {
            name: 'Barack Obama',
            title: 'President',
            country: 'United States'
        },
        {
            name: 'Philémon Yang',
            title: 'Prime Minister',
            country: 'Cameroon'
        }
    ]
}});

model.getValue('people[0].name').then(log);
```


Note that in the example above that uses a model to retrieve information, the value is pushed to a call back.
 
The main advantage of using a push API is that you can code against JSON data using the same way regardless of whether the data is local or remote. This makes it very easy to begin coding your application against mocked data at first, and then work against the server data later on without changing any other client code.
 
(Example showing coding against in memory data source, followed by remote data source)
```
var log = console.log.bind(console)
var model = new falcor.Model({cache: {
    people: [
        {
            name: 'Barack Obama',
            title: 'President',
            country: 'United States'
        },
        {
            name: 'Philémon Yang',
            title: 'Prime Minister',
            country: 'Cameroon'
        }
    ]
}});

model.getValue('people[0].name').then(log);



var model = new falcor.Model({source: new falcor.HttpDataSource('model.json')});

model.getValue('people[0].name').then(log);
```

Another advantage of using a Falcor model is that it caches the JSON data it retrieves from the server in-memory. As a result, you don't need to maintain a cache of the data that you retrieve from a Falcor model. Whenever you need data, just ask the Model for it. If the model finds the data in its cache, it will push the data to you immediately. Otherwise the model will retrieve your data from the server, insert it into the cache, and push it to you asynchronously.
 
(Example that retrieves a path, and then retrieving the same path again without triggering a network request)
 ```
var model = new falcor.Model({source: new falcor.HttpDataSource('model.json')});

model.getValue('people[0]["name", "title"]').then(log);

model.getValue('people[0].name').then(log);
```

In addition to JSON data the Falcor model also supports JSON Graph. JSON Graph is a convention for modeling graph information in JSON. JSON graph can help you ensure that the same object never appears more than once in either server responses or the Model cache. This means you never need to worry about propagating changes to multiple copies of the same object.
 
(Example demonstrating that mutating an object that appears twice in the graph mutates it everywhere)
```
var log = console.log.bind(console)
var $ref = falcor.Model.ref;
var model = new falcor.Model({cache: {
    governmentHeads: [
        $ref('people[44]'),
        $ref('people[54]')
    ],
    nobelPeacePrizeWinners: [
        $ref('people[44]')
    ],
    people: {
        "44": {
            name: 'Barack Obama',
            title: 'President',
            country: 'United States'
        },
        "54": {
            name: 'Philémon Yang',
            title: 'Prime Minister',
            country: 'Cameroon'
        }
    }

}});

model.getValue('governmentHeads[0].country').then(log);

model.setValue('governmentHeads[0].country', 'Iceland').then(function(x) {
    model.getValue('nobelPeacePrizeWinners[0].country').then(log);
})
```
 
In addition to using JSON graph to make sure that objects don't appear more than once in the models cache, the model uses the references in JSON graph to optimize server requests. For more information on JSON graph, see "JSON graph."
 
Using a model makes it easy to begin your development immediately before the server is finished, and frees you from having to worry about cacheing your data.

 
Working with JSON using a model
 
Every Falkor model operates on a JSON Graph object. The model accesses the data in the JSON Graph using a data source. You can implement the data source interface to customize how the model retrieves JSONGraph data. Falcor ships with HttpDataSource, an implementation of the data source interface that communicates with a remote datasource over HTTP.
 
(Example of creating a model with the data source)
```
var model = new falcor.Model({source: new falcor.HttpDataSource('model.json')});
```

You can implement the data source interface to allow a Model to communicate with a remote JSONGraph object over a different transfer protocol, like web sockets for example.
 
If you do not specify a data source, all model operations will be performed on the models local JSONGraph cash. When you initialize the model, you can provide it with JSONGraph Data to prime its local cash.
 
(Example of creating a model with a cash, Setting some information, and then serializing the result of calling getcash)
```
//TODO: Maximum call stack size exceeded?
var model = new falcor.Model({
	source: new falcor.HttpDataSource('model.json'),
	cache: {
	    people: [
	        {
	            name: 'Barack Obama',
	            title: 'President',
	            country: 'United States'
	        },
	        {
	            name: 'Philémon Yang',
	            title: 'Prime Minister',
	            country: 'Cameroon'
	        }
	    ]
	}});

model.setValue('people[0].country', 'Iceland').then(function(x) {
 	console.log(JSON.stringify(model.getCache(), null, 4));
});
```
 
It is common practice to begin working against mock data in a model cash, and then replace it with a data source once the server is finished.
 
(Same example as above of working with cash, and then data source)
 
For more information on how the model JSONGraph cash works, see the model JSONGraph cash.

 
Retrieving Data from a model

Every model is associated with one JSONGraph object. The Falcor model provides a get API to allow developers to retrieve information from their JSON object. To retrieve information from a model, you pass a JavaScript path from the root of the models JSONGraph object to the get method.
 
(Example of using a simple have to retrieve data from a model)
```
model.get('people[0].name').then(log);
```
 
When you retrieve a path from a working model, the result is a model response. A model response object provides a variety of options that allow you to customize both how you would like the data to be delivered, and in what format you would like the data to arrive. By default the output format is JSONGraph.
 
There is one important difference between working with a JSONGraph object directly and working with that same JSONGraph object through a model: you can only retrieve value types from a model.  JSONGraph objects can contain the following value types:  string, Boolean, number, null. In the JSONGraph object below, the value types are highlighted in green.

```
var model = {
    people: [
        {
            name: 'Barack Obama',
            title: 'President',
            country: 'USA',
            years: 4,
            current: True
        }
    ]
};
```
 
When working with a JSONGraph object you can retrieve an array or an object by looking up a key.

(Example of assigning an array in a JSONGraph object to a variable)

However model objects do not allow you to retrieve objects or arrays from JSONGraph The JSONGraph data source. 

(Same example document inside of a model, and an attempt to get the same array)

The code above will not work, because Ray is not a value type.

"Why can't I retrieve arrays and objects from Model?"




Instead you must be explicit, and request all of the value types that you need.
 
 
In addition to the JavaScript path syntax, models can also process paths with ranges in indexers:
 
(Example of using range to pull that out of the model)
 
Models allow you to select as many paths as you want in a single network request.
 
(Example of using range to pull that out of the model)
 
The paths in the previous example can be simplified to one path, because in addition to allowing ranges in indexers, Falcor models also allow multiple keys to be passed in a single indexer:
 
(Example of using range to pull that out of the model)


Do you get method also except optional selector function, which can be used to transform the data retrieved from the server before
 
One of the limitations of working with JSON data through a Falcor model is that you can only retrieve values
