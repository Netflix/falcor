// TODO: Change this to walk through the code step by step as a flow instead of all inline in the code snippet. Annotated source like underscore possibly for long-term.

var source = new falcor.HttpDataSource("http://netflix.com/model.json");
var $ref = falcor.Model.ref;

// In this example we add invoke the add function on a "persons" array in the JSON Graph
// exposed by this {@link DataSource}. Then we retrieve the several properties from the 
// newly-created person as well as the new length of the list.
source.call(
 // the path to the function which adds a person object to the persons list.
 ["persons", "add"], 
 // The arguments to the function.
 ["Jim", "Parsons"], 
 // This function creates a person in the "personsById" map and adds a reference to that
 // person to the next available index in the "persons" list. This function call internally
 // generates a {@link JSONGraphEnvelope} response which contains the reference at the new 
 // index in the list. The response also indicates that length property of the "persons"
 // list has been invalidated. This will cause any {@link Model} connected to this 
 // {@link DataSource} to purge ["persons", "length"] from its cache as soon as it receives
 // the response.
 // {
 //   paths: [["persons", 7]],
 //   jsong: {
 //    persons: {
 //     7: { $type: "ref", value: ["personsById", 22] }
 //    }
 //   },
 //   invalidated: [["persons", "length"]]
 // }
 // Once the JSON Graph function has completed successfully, the call method 
 // continues by evaluating a get operation on the path created by appending 
 // each path suffix onto each path in the {@link JSONGraphEnvelope}'s paths
 // array.
 // In this instance, there is only one path suffix containing three keys...
 [["name", "surname", "createdAt"]], 
 // ... therefore the call method evaluates a get operation 
 // on ["persons", 7, ["name", "surname", "createdAt"]] and adds the 
 // results to the {@link JSONGraphEnvelope}. This yields the following
 // result:
 // {
 //   paths: [["persons", 7, ["name","age", "createdAt"]]],
 //   jsong: {
 //    persons: {
 //     7: { $type: "ref", value: ["personsById", 22] }
 //    },
 //    personsById: {
 //     22: { name: "Jim", surname: "Parsons", createdAt: 2348723423 }
 //    }
 //   },
 //   invalidated: [["persons", "length"]]
 // } 
 // At this point the function appends the calleePaths to the path 
 // to the function callee object. The path to the function callee object is 
 // callPath.splice(0, callPath.length - 1).
 // In this instance there is only one path specified...
 [["length"]]).
 // ...which means that the call function evaluates a get operation for
 // the path ["persons", "length"]. The results of this get operation are 
 // added to the {@link JSONGraphEnvelope}, producing the following
 // result:
 // {
 //   paths: [["persons", 7, ["name","age", "createdAt"]], ["persons", 7, "length"]],
 //   jsong: {
 //    persons: {
 //     7: { $type: "ref", value: ["personsById", 22] },
 //     "length": 8
 //    },
 //    personsById: {
 //     22: { name: "Jim", surname: "Parsons", createdAt: 2348723423 }
 //    }
 //   },
 //   invalidated: [["persons", "length"]]
 // }  
  subscribe(function(jsonGraph) {
   console.log(JSON.stringify(jsonGraph, null, 4));
  });
