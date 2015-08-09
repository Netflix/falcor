/**
 * An envelope that wraps a {@link JSONGraph} fragment.
 * @typedef {Object} JSONGraphEnvelope
 * @property {JSONGraph} jsonGraph - a {@link JSONGraph} fragment
 * @property {?Array.<PathSet>} paths - the paths to the values in the {@link JSONGraph} fragment
 * @property {?Array.<PathSet>} invalidated - the paths to invalidate in the {@link Model}
 * @example
var $ref = falcor.ref;
var model = new falcor.Model();
model.set({
  paths: [
    ["todos", [12,15], ["name","done"]]
  ],
  jsonGraph: {
    todos: [
      $ref("todosById[12]"),
      $ref("todosById[15]")
    ],
    todosById: {
      12: {
        name: "go to the ATM",
        done: false
      },
      15: {
        name: "buy milk",
        done: false
      }
    }
  },
}).then(function(jsonEnvelope) {
  console.log(JSON.stringify(jsonEnvelope, null, 4));
});

// prints...
// {
//   json: {
//     todos: {
//       0: {
//         name: "go to the ATM",
//         done: false
//       },
//       1: {
//         name: "buy milk",
//         done: false
//       }
//     }
//   }
// }
 */
