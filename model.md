The Falcor Model
 
Falcor provides a Model object, which is intended to be the "M" in your MVC. An application that uses Falcor doesn't work with JSON data directly, but indirectly through the Model object. The model object provides a set of familiar JavaScript APIs for working with JSON data, including get, set, and call. The main difference between working with JSON data directly and working with it indirectly through a Model object, is that the Falcor Model has a push API.

```
var log = console.log.bind(console)

var model = {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
};

console.log(model.todos[0].name);

// This outputs the following to the console:
// get milk from corner store 


// Working with JSON indirectly through a Falcor Model.

var log = console.log.bind(console)

var model = new falcor.Model({cache: {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
}});

model.getValue('todos[0].name').then(log);

// This outputs the following to the console:
// get milk from corner store 
```


Note that in the example above that uses a model to retrieve information, the value is pushed to a call back.
 
The main advantage of using a push API is that you can code against JSON data the same way regardless of whether the data is local or remote. This makes it very easy to begin coding your application against mocked data at first, and then work against the server data later on without changing any other client code.
 
```
TODO: this example will not work without a server.
var log = console.log.bind(console)

var model = new falcor.Model({cache: {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
}});

model.getValue('todos[0].name').then(log);

var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(log);
```

Another advantage of using a Falcor model is that it caches the JSON data it retrieves from the server in-memory. As a result, you don't need to maintain a cache of the data that you retrieve from a Falcor model. Whenever you need data, just ask the Model for it. If the model finds the data in its cache, it will push the data to you immediately. Otherwise the model will retrieve your data from the server, insert it into the cache, and push it to you asynchronously.
 
```
TODO: this example will not work without a server.
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});

model.getValue('todos[0].name').then(function() {
	// This request is served out of the local cache:
	model.getValue('todos[0].name').then(log);
});
```

In addition to JSON data the Falcor model also supports JSON Graph. JSON Graph is a convention for modeling graph information in JSON. JSON graph can help you ensure that the same object never appears more than once in either server responses or the Model cache. This means you never need to worry about propagating changes to multiple copies of the same object.
 
```
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')]
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.setValue('todos[1].done', true).then(function(x) {
    model.getValue('todos[0].prerequisites[0].done').then(log);
})

// This outputs the following to the console:
// true
```
 
In addition to using JSON graph to make sure that objects don't appear more than once in the models cache, the model uses the references in JSON graph to optimize server requests. For more information on JSON graph, see "JSON graph."
 
Using a model makes it easy to begin your development immediately before the server is finished, and frees you from having to worry about cacheing your data.

 
Working with JSON using a model
 
Every Falkor model operates on a JSON Graph object. The model accesses the data in the JSON Graph using a data source. You can implement the data source interface to customize how the model retrieves JSON data. Falcor ships with HttpDataSource, an implementation of the data source interface that communicates with a remote datasource over HTTP.
 
```
var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json')});
```

You can implement the data source interface to allow a Model to communicate with a remote JSON object over a different transfer protocol, like web sockets for example.
 
If you do not specify a data source, all model operations will be performed on the models local JSON cache. When you initialize the model, you can provide it with JSON Data to prime its local cache.
 
```
var log = console.log.bind(console)

var model = new falcor.Model({
	cache: {
	    todos: [
	        {
	            name: 'get milk from corner store',
	            done: false
	        },
	        {
	            name: 'withdraw money from ATM',
	            done: true
	        }
	    ]
	}});

model.getValue('todos[0].name').then(log);

// This outputs the following to the console:
// get milk from corner store
```
 
It is common practice to begin working against mock data in a model cache, and then replace it with a data source once the server is finished.
 
```
var log = console.log.bind(console)

var model = new falcor.Model({
	source: new falcor.HttpDataSource('/model.json'),
});

model.getValue('todos[0].name').then(log);
```

For more information on how the model JSON cache works, see the model JSON cache.

 
Retrieving Data from a model

Every model is associated with one JSON object. The Falcor model provides a get API to allow developers to retrieve information from their JSON object. To retrieve information from a model, you pass a JavaScript path from the root of the models JSON object to the get method.
 
```
var log = console.log.bind(console)

var model = new falcor.Model({
	cache: {
	    todos: [
	        {
	            name: 'get milk from corner store',
	            done: false
	        },
	        {
	            name: 'withdraw money from ATM',
	            done: true
	        }
	    ]
	}});

model.getValue('todos[0].name').then(log);

// This outputs the following to the console:
// get milk from corner store
```
 
When you retrieve a path from a working model, the result is a model response. A model response object provides a variety of options that allow you to customize both how you would like the data to be delivered, and in what format you would like the data to arrive. By default the output format is JSON.
 
There is one important difference between working with a JSON object directly and working with that same JSON object through a model: you can only retrieve value types from a model.  JSON objects can contain the following value types:  string, Boolean, number, null. In the JSON object below, the value types surrounded by underscores.

```
var log = console.log.bind(console)
var $ref = falcor.Model.ref;

var model = {
    todos: [
        {
            name: _'get milk from corner store'_,
            done: _false_,
            priority: _4_,
 			customer: _null_
        },
        {
            name: _'deliver pizza'_,
            done: _false_,
            priority: _4_,
 			customer: {
 				name: _'Jim Hobart'_
 				address: _'123 pacifica ave., CA, US'_
 			}
        }        
    ]
};
```

Models can also operate on JSON Graph documents:

```
var $ref = falcor.Model.ref;
var model = {
	todos: [
	    $ref('todosById[44]'),
        $ref('todosById[54]'),
		$ref('todosById[99]')
	],
    todosById: {
        "44": {
            name: _'get milk from corner store'_,
            done: _false_,
            priority: _4_,
 			customer: _null_,
 			prerequisites: [_$ref('todosById[54]')_]
        },
        "99": {
            name: _'deliver pizza'_,
            done: _false_,
            priority: _4_,
 			customer: _{
 				$type: 'atom',
 				value: {
	 				name: 'Jim Hobart',
	 				address: '123 pacifica ave., CA, US'
	 			},
	 			// this customer object expires in 30 minutes.
	 			$expires: -30 * 60 * 1000
 			}_
        },
        "54": {
            name: _'withdraw money from ATM'_,
            done: _false_,
            priority: _4_,
 			customer: _null_
        },
        "79": _{
        	$type: 'error',
        	value: 'error retrieving todo from database.'
        }_
    }
};
```

When working with a JSON object you can retrieve an array or an object by looking up a key.

```
var log = console.log.bind(console)

var model = {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
};

var todos = model.todos;
log(JSON.stringify(todos, null, 4))

// This outputs the following to the console:
// [
//     {
//         "name": "get milk from corner store",
//         "done": false
//     },
//     {
//         "name": "withdraw money from ATM",
//         "done": true
//     }
// ] 
```

However model objects do not allow you to retrieve objects or arrays from the JSON data source. 

```
var log = console.log.bind(console)

var model = new falcor.Model({cache: {
    todos: [
        {
            name: 'get milk from corner store',
            done: false
        },
        {
            name: 'withdraw money from ATM',
            done: true
        }
    ]
}});

// This code is illegal.
model.getValue('todos').then(log)
```

The code above will not work, because an Array is not a value type.

"Why can't I retrieve arrays and objects from Model?"

Instead you must be explicit, and request all of the value types that you need.
  
In addition to the JavaScript path syntax, models can also process paths with ranges in indexers:

```
var $ref = falcor.Model.ref;

var model = new falcor.Model({cache: {
    todos: [
        $ref('todosById[44]'),
        $ref('todosById[54]')
    ],
    todosById: {
        "44": {
            name: 'get milk from corner store',
            done: false,
            prerequisites: [$ref('todosById[54]')]
        },
        "54": {
            name: 'withdraw money from ATM',
            done: false
        }
    }
}});

model.get('todos[0..1].name').then(function(x) {
    console.log(JSON.stringify(x, null, 4));
});

// This outputs the following to the console:
// {
//     "json": {
//         "todos": {
//             "0": {
//                 "name": "get milk from corner store"
//             },
//             "1": {
//                 "name": "withdraw money from ATM"
//             }
//         }
//     }
// }
```
 
Models allow you to select as many paths as you want in a single network request.
 
```
model.get('todos[0..1].name', 'todos[0..1].done').then(log);
```

The paths in the previous example can be simplified to one path, because in addition to allowing ranges in indexers, Falcor models also allow multiple keys to be passed in a single indexer:

```
model.get('todos[0..1]["name", "done"]').then(log);
```

Do you get method also except optional selector function, which can be used to transform the data retrieved from the server before...
 
One of the limitations of working with JSON data through a Falcor model is that you can only retrieve values.
 
 

