var jsonGraph = require("./jsonGraph");
module.exports = function jsonGraphEnvelope(pathValues) {
    return {
        jsonGraph: jsonGraph(pathValues),
        paths: pathValues.map(function(x) { return x.path; })
    };
};
