/**
 * Controls how the {@link Model} retrieves and manages data, generally from a remote {@link JSONGraph} model 
 * @interface DataSource
 */

/**
 * Get data for the provided path(s)
 * @function get
 * @param {Array.<PathSet>} pathSets Path(s) to retrieve
 * @returns {Observable.<JSONGraphEnvelope>} jsonGraphEnvelope Values for the requested path(s)
 * @memberof DataSource.prototype
 */

/**
 * Set values for the provided path(s). Since operations on the data source may fail or coerce values, return the values of each path after the set operation to maintain consistency between the data source and {@link Model}
 * @function set
 * @param {JSONGraphEnvelope} jsonGraphEnvelope Path and value pairs to set
 * @returns {Observable.<JSONGraphEnvelope>} Final values for the set path(s)
 * @memberof DataSource.prototype
 */

/**
 * Invoke a function
 * @function call
 * @param {Path} functionPath The path to the function to invoke
 * @param {Array.<Object>} args The arguments to pass to the function
 * @param {Array.<PathSet>} pathSuffixes Paths to retrieve from objects returned from the Function
 * @param {Array.<PathSet>} calleePaths Paths to retrieve from function callee after successful function execution
 * @returns {Observable.<JSONGraphEnvelope>} jsonGraphEnvelope Values returned from the invoked function
 * @memberof DataSource.prototype
 */
