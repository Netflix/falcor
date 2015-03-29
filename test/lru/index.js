describe("LRU", function() {
    describe('Promote', function() {
        require("./lru.promote.get.spec");
    });
    describe('Splice', function() {
        require("./lru.splice.expired.spec");
    });
});

