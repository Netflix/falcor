module.exports = function inMemoryCache() {
    return {
        jsonGraph: {
            lolomo: {$type: 'ref', value: ['lolomos', 123]},
            lolomos: {
                123: {
                    0: {$type: 'ref', value: ['lists', 'A']}
                }
            },
            lists: {
                A: {
                    0: { item: {$type: 'ref', value: ['videos', 0]} },
                    1: { item: {$type: 'ref', value: ['videos', 1]} },
                    2: { item: {$type: 'ref', value: ['videos', 2]} },
                    3: { item: {$type: 'ref', value: ['videos', 3]} },
                    4: { item: {$type: 'ref', value: ['videos', 4]} },
                    5: { item: {$type: 'ref', value: ['videos', 5]} },
                    6: { item: {$type: 'ref', value: ['videos', 6]} },
                    7: { item: {$type: 'ref', value: ['videos', 7]} },
                    8: { item: {$type: 'ref', value: ['videos', 8]} },
                    9: { item: {$type: 'ref', value: ['videos', 9]} }
                }
            },
            videos: {
                0: { title: 'Video 0' },
                1: { title: 'Video 1' },
                2: { title: 'Video 2' },
                3: { title: 'Video 3' },
                4: { title: 'Video 4' },
                5: { title: 'Video 5' },
                6: { title: 'Video 6' },
                7: { title: 'Video 7' },
                8: { title: 'Video 8' },
                9: { title: 'Video 9' },
            }
        }
    };
};

