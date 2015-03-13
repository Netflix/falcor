describe("LRU", function() {
    describe('Promote', function() {
        require("./lru.promote.get.spec");
        require("./lru.promote.set.spec");
    });
    require("./lru.splice.spec");
});

