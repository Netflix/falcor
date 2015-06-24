<<<<<<< HEAD
module.exports = {
    resultsReporter: function(results) {
        console.log(results);
    },

    benchmarkReporter: function(benchmark) {
        console.log(benchmark);
    }
=======
module.exports = function(totalResults) {
    console.log(totalResults.join('\n'));
>>>>>>> 5e1882f... More refactoring/cleanup
};