var cache = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
};

var model = new falcor.Model({cache: cache});

model.setValue(
    ['genreLists', 0, 'titles', 0, 'rating'], 5).
    subscribe(function(x) {
        console.log(JSON.stringify(x, null, 4));
    });
var log = console.log.bind(console);
var model = new falcor.Model({
    source: new XMLHttpSource('http://127.0.0.1:1337/member.json')
});
