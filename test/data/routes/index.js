module.exports = function () {
    return {
        Videos: require('./Videos')(),
        GenreList: require('./GenreList')(),
        Lists: require('./Lists')()
    };
};