/**
 * A Falcor Model allows you to access the data in a JSON object the same way everywhere, regardless of where the data is stored is on the network. If a Model has a {@link DataSource} it is acting as a proxy for a remote Model. A Proxy Model uses the {@link DataSource} to access the data in another Model, usually located across a network. The {@link DataSource} is an interface which you can implement to allow Proxy Models to communicate across different network protocols than HTTP, such as a Web Socket or simple TCP. A {@link DataSource} is used by a Proxy Model on the client, and that DataSource communicates with a Model Server which translates its requests into commands and executes them on the Model located on the server. The server counterpart then serializes the remote Model's output in a response that the DataSource expects. The DataSource deserializes the data in the response, passes it back to the Proxy Model, and the Proxy Model caches the data locally.
 * The browser distribution of Falcor ships with {@link HttpDataSource}. 
 * @constructor DataSource
 * @abstract
*/


/**
 * The get method retrieves values from the DataSource's associated JSONGraph object.
 * @name get
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
