var Rx = require("rx");
var falcor = require("./../../lib/");
var Model = falcor.Model;

var chai = require("chai");
var expect = chai.expect;

describe("Set", function() {

    function test(text, jsonOut) {
        var routes = {
            set: function() {
                return Observable.of(jsonOut)
            }
        }

        var model = new falcor.Model({ source: routes })

        it("should return what is set " + text, function() {

            model.set({
                paths: [["titlesById", 242, "rating"]],
                jsonGraph: {
                    titlesById: {
                        242: {
                            rating: 5
                        }
                    }
                }
            }).subscribe(function(result) {
                expect(result).to.deep.equal(jsonOut);
            })
        });
    }

    test("(same /w path)", {
        paths: [["titlesById", 242, "rating"]],
        jsonGraph: {
            titlesById: {
                242: {
                    rating: 5
                }
            }
        }
    })

    test("(atom /w path)", {
        paths: [["titlesById", 242, "rating"]],
        jsonGraph: {
            titlesById: {
                242: {
                    rating: {
                        $type: "atom",
                        value: 5
                    }
                }
            }
        }
    });

    test("(empty atom /w path)", {
        paths: [["titlesById", 242, "rating"]],
        jsonGraph: {
            titlesById: {
                242: {
                    rating: {
                        $type: "atom"
                    }
                }
            }
        }
    });

    test("(same)", {
        jsonGraph: {
            titlesById: {
                242: {
                    rating: 5
                }
            }
        }
    })

    test("(atom)", {
        jsonGraph: {
            titlesById: {
                242: {
                    rating: {
                        $type: "atom",
                        value: 5
                    }
                }
            }
        }
    });

    test("(empty atom)", {
        jsonGraph: {
            titlesById: {
                242: {
                    rating: {
                        $type: "atom"
                    }
                }
            }
        }
    });

});
