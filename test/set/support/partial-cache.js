var $path = require("./../../../lib/types/ref");
var $atom = require("./../../../lib/types/atom");

module.exports = function() {
    return {
        "grid": { $type: $path, value: ["grids", "grid-1234"] },
        "grids": {
            "grid-1234": {
                "0": { $type: $path, value: ["rows", "row-0"] },
                "1": { $type: $path, value: ["grids", "grid-1234", "0"] }
            }
        },
        "rows": {
            "row-0": {
                "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                "2": { $type: $path, value: ["movies", "reservior-dogs"] }
            }
        },
        "movies": {
            "pulp-fiction": {
                "movie-id": { $type: $atom, value: "pulp-fiction" }
            },
            "kill-bill-1": { $type: $atom }
        }
    };
};
