module.exports = function() {
    return {
        shortCircuit: {
            specialCase: true,
            cache: {
                to: ["short-circuit", "value"],
                "short-circuit": "value"
            },
            setPaths: {
                query: [{
                    "path": ["to", "summary"],
                    "value": "most bestest"
                }]
            }
        }
    };
};

