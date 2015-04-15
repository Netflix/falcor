var Model = falcor.Model;
var $ref = Model.ref;
var model = new Model({
    source: new HttpSource('/member.json')
});

model.
    get(
        'genreLists[0..1].name',
        'genreLists[0..1].titles[0].name').
    then(log);

