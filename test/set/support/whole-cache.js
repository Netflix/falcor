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
                "2": { $type: $path, value: ["movies", "reservior-dogs"] },
                "3": { $type: $path, value: ["movies", "django-unchained"] }
            }
        },
        "movies": {
            "pulp-fiction": {
                "movie-id": { $type: $atom, value: "pulp-fiction" },
                "title": { $type: $atom, value: "Pulp Fiction" },
                "director": { $type: $atom, value: "Quentin Tarantino" },
                "genres": {
                    $type: $atom,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $atom,
                    value: {
                        title: "Pulp Fiction",
                        url: "/movies/id/pulp-fiction"
                    }
                }
            },
            "kill-bill-1": {
                "movie-id": { $type: $atom, value: "kill-bill-1" },
                "title": { $type: $atom, value: "Kill Bill: Vol. 1" },
                "director": { $type: $atom, value: "Quentin Tarantino" },
                "genres": {
                    $type: $atom,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $atom,
                    value: {
                        title: "Kill Bill: Vol. 1",
                        url: "/movies/id/kill-bill-1"
                    }
                }
            },
            "reservior-dogs": {
                "movie-id": { $type: $atom, value: "reservior-dogs" },
                "title": { $type: $atom, value: "Reservior Dogs" },
                "director": { $type: $atom, value: "Quentin Tarantino" },
                "genres": {
                    $type: $atom,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $atom,
                    value: {
                        title: "Reservior Dogs",
                        url: "/movies/id/reservior-dogs"
                    }
                }
            },
            "django-unchained": {
                "movie-id": { $type: $atom, value: "django-unchained" },
                "title": { $type: $atom, value: "Django Unchained" },
                "director": { $type: $atom, value: "Quentin Tarantino" },
                "genres": {
                    $type: $atom,
                    value: ["Western"]
                },
                "summary": {
                    $type: $atom,
                    value: {
                        title: "Django Unchained",
                        url: "/movies/id/django-unchained"
                    }
                }
            }
        }
    };
};
