var getBoundValue = require('./getBoundValue');
module.exports = function getBoundContext(model) {
    return getBoundValue(model || this).value;
};

