var model = new falcor.Model();
model.setCache({
    user: {
        name: {
            // Metadata that indicates this object is a Atom
            $type: "atom",
            // The value property contains the value box by the Atom
            value: "Jim Parsons",
            // Metadata that dictates that this value should be purged from the {@link Model}'s cache after two minutes. Negative numbers imply that expiration occurs relative to the current time.
            $expires: -(1000 * 60 * 2)
        }
    }
});

model.boxValues().getValue("user.name").subscribe(function(value) {
    console.log(value.$type, value.value, value.$expires);
})

// The code above outputs the following text to the console:
// atom Jim Parsons -120000
// Note that the Atom object was returned rather than just the value "Jim Parsons."