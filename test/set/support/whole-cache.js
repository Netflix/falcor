var $path = require("../../../lib/types/$path");
var $sentinel = require("../../../lib/types/$sentinel");

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
                "2": { $type: $path, value: ["movies", "reservior-dogs"] },
                "3": { $type: $path, value: ["movies", "django-unchained"] }
            }
        },
        "movies": {
            "pulp-fiction": {
                "movie-id": { $type: $sentinel, value: "pulp-fiction" },
                "title": { $type: $sentinel, value: "Pulp Fiction" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Pulp Fiction",
                        url: "/movies/id/pulp-fiction"
                    }
                }
            },
            "kill-bill-1": {
                "movie-id": { $type: $sentinel, value: "kill-bill-1" },
                "title": { $type: $sentinel, value: "Kill Bill: Vol. 1" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Kill Bill: Vol. 1",
                        url: "/movies/id/kill-bill-1"
                    }
                }
            },
            "reservior-dogs": {
                "movie-id": { $type: $sentinel, value: "reservior-dogs" },
                "title": { $type: $sentinel, value: "Reservior Dogs" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Reservior Dogs",
                        url: "/movies/id/reservior-dogs"
                    }
                }
            },
            "django-unchained": {
                "movie-id": { $type: $sentinel, value: "django-unchained" },
                "title": { $type: $sentinel, value: "Django Unchained" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Western"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Django Unchained",
                        url: "/movies/id/django-unchained"
                    }
                }
            }
        }
    };
};