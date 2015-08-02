/**
 * An atom allows you to treat a JSON value as atomic regardless of its type, ensuring that a JSON object or array is always returned in its entirety. The JSON value must be treated as immutable. Atoms can also be used to associate metadata with a JSON value. This metadata can be used to influence the way values are handled.
 * @typedef {Object} Atom
 * @property {!String} $type - the $type must be "atom"
 * @property {!*} value - the immutable JSON value
 * @property {number} [$expires] - the time to expire in milliseconds
 *  - positive number: expires in milliseconds since epoch
 *  - negative number: expires relative to when the Atom is merged into the JSONGraph
 *  - number 1: never expires
 * @example
 // Atom with number value, expiring in 2 seconds
 {
    $type: "atom",
    value: 5
    $expires: -2000
 }
 // Atom with Object value that never expires
 {
    $type: "atom",
    value: {
        foo: 5,
        bar: "baz"
    },
    $expires: 1
 }
 */
