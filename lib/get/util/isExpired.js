var now = require('./../../support/now');
/**
 *
 * @private
 */
module.exports = function isExpired(node) {
    var $expires = node.$expires === undefined && -1 || node.$expires;
    return $expires !== -1 && $expires !== 1 && ($expires === 0 || $expires < now());
};
