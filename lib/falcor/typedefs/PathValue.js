/**
 * A wrapper around a path and its value
 * @typedef {Object} PathValue
 * @property {PathSet} path - The path to a location in the {@link JSONGraph}
 * @property {?*} value - The value of that path
 * @example
 {
	path: ["productsById", "1234", "name"],
	value: "ABC"
 }
 */