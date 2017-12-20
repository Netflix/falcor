function applyErrorPrototype(errorType) {
    errorType.prototype = Object.create(Error.prototype, {
        constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(errorType, Error);
    } else {
        // eslint-disable-next-line
        InvalidModelError.__proto__ = Error;
    }
}

module.exports = applyErrorPrototype;
