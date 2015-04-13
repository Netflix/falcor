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

model.getValue(['genreLists', 0, 'titles', 0, 'name']).subscribe(function(x) {
    console.log(JSON.stringify(x, null, 4));
});
