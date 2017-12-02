var util = require("util");

/**
 * Creates a new type of error.
 *
 * @param {string} name - The error type name
 * @param {string} message - The error message
 * @param {string[]|function} additionalKeys - Key names to set from arguments (or function to manually do so)
 *
 * @returns {function} Returns an Error class
 *
 * @private
 */
function createErrorType(name, message, additionalKeys) {

    // Create the error type
    var NewErrorType = function() {

        // Call the "super" constructor
        Error.call(this);

        // Capture a proper stack trace
        Error.captureStackTrace(this, this.constructor);

        // Set the message of our error type
        this.message = message;

        // If the additionalKeys argument provided was a function, call it with the instance and arguments
        // (this allows additional logic like applying defaults)
        if (typeof additionalKeys === "function") {
            additionalKeys(this, arguments);
        }

        // Otherwise, if arguments were passed and this error type allows additional keys to be set, set them
        if (arguments.length > 0 && Array.isArray(additionalKeys)) {

            // For each additional key allowed...
            additionalKeys.forEach(function(key, i) {

                // Check if that argument was passed, and if so, set that property of this instance
                if (typeof arguments[i] !== "undefined") {
                    this[key] = arguments[i];
                }
            });
        }
    };

    // Inherit from the standard error type
    util.inherits(NewErrorType, Error);

    // Override the name of the function
    var descriptor = Object.getOwnPropertyDescriptor(NewErrorType, "name");
    descriptor.value = name;
    Object.defineProperty(NewErrorType, "name", descriptor);

    // Override the name on the prototype
    NewErrorType.prototype.name = name;

    // provide a .is() method for checking the error type
    NewErrorType.is = function(e) {
        return e && e.name === name;
    };

    return NewErrorType;
}

module.exports = createErrorType;
