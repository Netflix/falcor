module.exports = function() {
    return {
        Summary: [{
            route: ['videos', 'summary'],
            get: function(pathSet) {
                return Observable.return({
                    jsong: {
                        videos: {
                            summary: {
                                $type: 'leaf',
                                length: 15
                            }
                        }
                    },
                    paths: [['videos', 'summary']]
                });
            }
        }]
    }
};