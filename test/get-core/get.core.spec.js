var coreRunner = require('./../coreRunner');
var cacheGenerator = require('./../CacheGenerator');
describe.only('Get Core', function() {
    var tests = [{
        it: 'should get a simple value out of the cache',
        input: [['videos', 0, 'title']],
        output: {
            json: {
                videos: {
                    0: {
                        title: 'Video 0'
                    }
                }
            }
        },
        cache: cacheGenerator(0, 1)
    }];

    coreRunner(tests);
});

