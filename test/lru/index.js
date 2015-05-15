describe("LRU", function() {
    describe('Promote', function() {
        require("./lru.promote.get.spec");
        require("./lru.promote.set.spec");
    });
    describe('Splice', function() {
        require("./lru.splice.expired.spec");
        require("./lru.splice.overwrite.spec");
    });
});

