var fs = require('fs');

module.exports = function(totalResults) {
    fs.writeFileSync('out.csv', totalResults);
};