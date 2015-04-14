var model = new falcor.Model({
    source: new XMLHttpSource('http://127.0.0.1:1337/member.json')
});

model.
    getValue('genreLists[0..1].titles[0]["name", "rating"]').
    subscribe(console.log.bind(console));
