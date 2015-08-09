/**
 * An envelope that wraps a JSON object.
 * @typedef {Object} JSONEnvelope
 * @property {JSON} json - a JSON object
 * @example
 var model = new falcor.Model();
 model.set({
    json: {
      name: "Steve",
      surname: "McGuire"
    }
 }).then(function(jsonEnvelope) {
    console.log(jsonEnvelope);
 });
 */
