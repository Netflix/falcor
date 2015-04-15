var log = function(x) {
    console.log(JSON.stringify(x, null, 2));
};

if (typeof module !== 'undefined') {
    module.exports = log;
}
