var $ref = falcor.Model.ref;
var model = new falcor.Model({cache: {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                $ref('titlesById[956]')
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                $ref('titlesById[956]')
                //, ... more titles
            ]
        }
        //, ... more genres
    ],
    titlesById: {
        956: {
            name: 'House of Cards',
            rating: 4,
            boxshot: '../assets/hoc.webp'
        }
    }
}});

model.setValue('genreLists[0].titles[0].rating', 5).
    then(model.get('genreLists[0..1].titles[0].rating')).
    then(console.log);
