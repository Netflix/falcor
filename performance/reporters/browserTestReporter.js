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
<<<<<<< HEAD
    console.log(totalResults.join('\n'));
>>>>>>> 5e1882f... More refactoring/cleanup
=======
    console.log(totalResults);
>>>>>>> 243f2bc... Added Karma hooks
};