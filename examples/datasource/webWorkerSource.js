 // In this example we demonstrate the communication between a model source and a server over a web worker

 // Here is the worker code (worker.js):

importScripts('./Falcor.js');  

function WorkerServer(dataSource) {
    this.dataSource = dataSource;
}

// Deserializes a message from the client and executes the appropriate action on the model
WorkerServer.prototype.onmessage = function(action) {
  var method = action[0],
    jsonGraphEnvelope,
    callPath,
    pathSuffixes,
    paths;

    switch(method) {
        case "get": {
            paths = action[1];

            return this.dataSource.get(paths);
        }
        case "set": {
            jsonGraphEnvelope = action[1];

            return this.dataSource.set(jsonGraphEnvelope);
        }
        case "call": {
            callPath = action[1];
            args = action[2];
            pathSuffixes = action[3];
            paths = action[4];

            return this.dataSource.call(callPath, args, pathSuffixes, paths);
        }
    }
}

// create a server model
var dataSource = 
    new falcor.
        Model({
            cache: {
                user: {
                    name: "Jim",
                    location: {$type: "error", value: "Something broke!"}
                }
            }
        }).
        asDataSource();

// Create a worker server that translates requests into commands on the model
var workerServer = new WorkerServer(dataSource);

onmessage = function(e) {
    var data = e.data,
        // peel off the request id
        id = data[0];

    workerServer.
        onmessage(data.slice(1)).
        // Convert the output format of the ModelResponse to JSON Graph, because that is what the 
        // DataSource expects.
        toJSONG().
        subscribe(
            function(result) {
                // send back the response with the request id
                postMessage([id, null, result]);
            },
            function(error) {
                // send back the response with the request id
                postMessage([id, error]);
            });
}

// END OF WORKER CODE
// START WEB PAGE CODE

// Define a web worker model source. A proxy model will use this source to retrieve information from a Model running on another web worker.
function WebWorkerSource(worker){
    this._worker = worker;
}

WebWorkerSource.prototype = {
    // Identifier used to correlate each Request to each response
    id: 0,
    // Gets paths from the model running on a worker
    get: function(paths) {
        return this._getResponse(['get', paths]);
    },
    // Sets information on a model running on a worker
    set: function(jsonGraphEnvelope) {   
        return this._getResponse(['set', jsonGraphEnvelope]);
    },
    // Call a function in a model running on a worker
    call: function(callPath, arguments, pathSuffixes, paths) {
        return this._getResponse(['call', callPath, arguments, pathSuffixes, paths]);
    },
    // Creates an observable stream that will send a request 
    // to a Model server, and retrieve the response.
    // The request and response are correlated using a unique 
    // identifier which the cleint sends with the request and 
    // the server echoes back along with the response.
    _getResponse: function(action) {
        var self = this;

        // The subscribe function runs when the Observable is observed.
        return falcor.Observable.create(function subscribe(observer) {
            var id = self.id++,

            handler = function(e) {
                var response = e.data,
                    error,
                    value;

                // The response is an array like this [id, error, data]
                if (response[0] === id) {
                    error = response[1];
                    if (error) {
                        observer.onError(error);
                    }
                    else {
                        value = response[2];
                        observer.onNext(value);
                        observer.onCompleted();
                    }
                }
            };

            // Add the identifier to the front of the message
            action.unshift(id);
            
            self._worker.postMessage(action);
            self._worker.addEventListener('message', handler);

            // This is the action to perform if the consumer unsubscribes from the observable
            return function(){
                self._worker.removeEventListener('message', handler);
            };
        });
    }
};

// Create the worker running a remote model
var worker = new Worker('worker.js');

// Create the web worker model source and pass it the worker we have created
var model = new falcor.Model({ source: new WebWorkerSource(worker) });

model.
    get('user["name", "age", "location"]').
    subscribe(
        function(json) {
            console.log(JSON.stringify(json, null, 4));
        },
        function(errors) {
            console.error('ERRORS:', JSON.stringify(errors));
        });

//The following is printed to the console:
//{
//    json: {
//        "user": {           
//            "name": "Jim"
//            // age not included because it is undefined
//            // location not included in message because it resulted in error
//        }
//    }
//}

//ERRORS: [{"path":["user","location"],"value":"Something broke!"}]

