/**
 * Controls how the {@link Model} retrieves and manages data, generally from a remote {@link JSONGraph} model 
 * @interface DataSource
 */

/**
 * Get data for the specified path(s)
 * @function get
 * @param {Array.<PathSet>} pathSets - The path(s) to retrieve
 * @returns {Observable.<JSONGraphEnvelope>} - The {JSONGraph} fragment and associated metadata for the path(s)
 * @memberof DataSource.prototype
 */

/**
 * Set values for the specified path(s). Since operations on the data source may fail or coerce values, to maintain consistency between the data source and {@link Model}, return the values of each path after the set operation
 * @function set
 * @param {JSONGraphEnvelope} jsonGraphEnvelope - The path and value pairs to set
 * @returns {Observable.<JSONGraphEnvelope>} The {JSONGraph} fragment of the final values and associated metadata for the set path(s)
 * @memberof DataSource.prototype
 */

/**
 * Invoke a function
 * @function call
 * @param {Path} functionPath - The path to the function to invoke
 * @param {Array.<Object>} args - The arguments to pass to the function
 * @param {Array.<PathSet>} pathSuffixes - The paths to retrieve from objects returned from the function
 * @param {Array.<PathSet>} calleePaths - The paths to retrieve from function callee after successful function execution
 * @returns {Observable.<JSONGraphEnvelope>} The {JSONGraph} fragment and associated metadata returned from the invoked function
 * @memberof DataSource.prototype
 */
