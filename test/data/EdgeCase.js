function edgeCase() {
    return {
        user: {
            name: "Jim",
            location: {$type: "error", value: "Something broke!"}
        }
    };
}
module.exports = edgeCase;
