var now = require("./../support/now");
var $now = require("../values/expires-now");
var $never = require("../values/expires-never");

module.exports = function isExpired(node) {
    var exp = node.$expires;
    return (exp != null) && (
        exp !== $never ) && (
        exp === $now || exp < now());
};
