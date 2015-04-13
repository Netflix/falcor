var cache = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 1007,
                    name: 'Bloodline',
                    rating: 4,
                    boxshot: '../assets/bl.webp'
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

model.get(
    ['genreLists', {to: 1}, 'titles', 0, ['name', 'rating']]).
    subscribe(function(x) {
        console.log(JSON.stringify(x, null, 4));
    });
