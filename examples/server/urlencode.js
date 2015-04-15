module.exports = function(req, res, next) {
    var buffer = '';
    req.on('data', function(data) {
        buffer += data.toString();
    }).on('end', function() {
        req.bodyraw = buffer;
        next();
    });
};
