/**
 * A DataSource is an interface which can be implemented to expose JSON Graph information to a Model. Every DataSource is associated with a single JSON Graph object. Models execute JSON Graph operations (get, set, and call) to retrieve values from the DataSource’s JSON Graph object. DataSources may retrieve JSON Graph information from anywhere, including device memory, a remote machine, or even a lazily-run computation.
 * @constructor DataSource
 * @abstract
*/


/**
 * The get method retrieves values from the DataSource's associated JSONGraph object.
 * @name get
 * @function
 * @arg {Array.<PathSet>} pathSets the path(s) to retrieve
 * @returns {Observable.<JSONGraphEnvelope>} jsonGraphEnvelope the response returned from the server.
 * @memberof DataSource.prototype
*/

/**
 * The set method accepts values to set in the DataSource's associated JSONGraph object.
 * @name set
 * @function
 * @arg {JSONGraphEnvelope} jsonGraphEnvelope a JSONGraphEnvelope containing values to set in the DataSource's associated JSONGraph object.
 * @returns {Observable.<JSONGraphEnvelope>} a JSONGraphEnvelope containing all of the requested values after the set operation.
 * @memberof DataSource.prototype
*/

/**
 * Invokes a function in the DataSource's JSONGraph object.
 * @name call
 * @function
 * @arg {Path} functionPath the path to the function to invoke
 * @arg {Array.<Object>} args the arguments to pass to the function
 * @arg {Array.<PathSet>} refSuffixes paths to retrieve from the targets of JSONGraph References in the function's response.
 * @arg {Array.<PathSet>} thisPaths paths to retrieve from function's this object after successful function execution
 * @returns {Observable.<JSONGraphEnvelope>} jsonGraphEnvelope the response returned from the server.
 * @memberof DataSource.prototype
*/
