var $ref = falcor.Model.ref;
var source = new falcor.HttpDataSource("/model.json");

// attempt to set 'titlesById[99].name' to "House of Cards" and 
// 'titlesById[99].rating' to 10
var result = source.set({
    paths: [["titlesById", 99, ["name", "rating"]],
    jsong: {
        "titlesById": {           
            "99": {
                "name": "House of Cards",
                "rating": 10
            }
        }
    }
});

result.subscribe(function(jsong) {
    console.log(JSON.stringify(jsong, null, 4));
});

//The following is printed to the console:
//{
//    paths: [["titlesById", 99, ["name", "rating"]],
//    jsong: {
//        "titlesById": {           
//            "99": {
//               "name": "House of Cards",
//               "rating": 5
//            }
//        }
//    }
//}