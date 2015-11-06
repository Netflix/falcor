# 0.x to 1.x
No More Rx
-------

In 0.x `ModelResponse`'s prototype inherited from Rx.Observable in the following
way.

```javascript
var Rx = require('rx/dist/rx');
var ModelResponse = function ModelResponse(...) {...};

ModelResponse.prototype = Object.create(Rx.Observable.prototype);
...
```

This means that after a `get`, `set`, or `call` any rx operator could be used.
E.G.

```javascript
model.
    get(['hello', 'falcor']).
    doAction(function(x) {
        ...
    }).
    flatMap(function(x) {
        return model.get(...);
    }).
    subscribe(...);
```

If your application relies on that behavior there are two possible upgrade
paths.  If your application does not rely on Rx, but only the `subscribe` from
Observable then nothing has changed except for file size.

##### Option 1
Alter the prototype for `get`, `set`, and `call` to return `Rx.Observables`.
This only needs to be done once, but is considered _dirty_ since it alters the
prototype.

```javascript
var Rx = require('rx');
var falcor = require('./lib');
var Model = falcor.Model;
var slice = Array.prototype.slice;

var noRx = {
    get: Model.prototype.get,
    set: Model.prototype.set,
    call: Model.prototype.call
};

Model.prototype.get = function getWithRx() {
    var args = slice.call(arguments, 0);
    return convertToRx(this, 'get', args);
};

Model.prototype.set = function setWithRx() {
    var args = slice.call(arguments, 0);
    return convertToRx(this, 'set', args);
};

Model.prototype.call = function callWithRx() {
    var args = slice.call(arguments, 0);
    return convertToRx(this, 'call', args);
};

function convertToRx(model, method, args) {
    return Rx.Observable.create(function(observer) {
        return noRx[method].apply(model, args).subscribe(observer);
    });
}
```

##### Option 2
Wrap all calls to falcor with a Falcor.Subscribable -> Rx.Observable call.
This is _better_ than prototype overriding, but its more tedious to implement.

```javascript
var Rx = require('rx');
var Observable = Rx.Observable;
module.exports = function toObservable(response) {
    return Observable.create(function(observer) {
        return response.subscribe(observer);
    });
};

...
// Don't forget to wrap the progressively() call as well.
toObservable(
    model.
        get(['my', 'path']).
        progressively()).
doAction(function() {
    // Something awesome goes here
}).
subscribe();
```

Deref
-------------
`deref` has changed to use the output from a `ModelResponse` instead of
specifying the destination via path and leaves.

Lets create a model with some initial cache.
```javascript
var model = new Model({
    cache: {
        genreLists: {
            0: Model.ref(['lists', 'A'])
        },
        lists: {
            A: {
                1337: Model.ref(['videos', 1337])
            }
        },
        videos: {
            1337: {
                title: Model.atom('Total Recall (June 1st, 1990)')
            }
        }
    }
});
```

If we were to use `deref` in the **old** way we would have to perform the
following to derefernce to [genreLists, 0, 0].
```javascript
model.
    // Creates a dataSource (more than likely means a network call) call since
    // imageUrl does not exist in the cache.
    deref(['genreLists', 0, 0], ['title', 'imageUrl']).
    subscribe(function(boundModel) {
        // equivalent to model.get(['genreLists', 0, 0, 'title'])
        // -> { json: { title: 'Total Recall (June 1st, 1990)' } }
        boundModel.get(['title'])...

        // Other rendering stuff / application logic
        ...
    });
```

The new `deref` works from the output of `ModelResponse`, so the same thing could be
accomplished with the following.
```javascript
model.
    get(['genreLists', 0, 0, 'title']).
    subscribe(function(x) {
        var json = x.json;
        var boundModel = model.deref(json.genreLists[0][0]);

        // equivalent to model.get(['genreLists', 0, 0, 'title'])
        // -> { json: { title: 'Total Recall (June 1st, 1990)' } }
        // If 'imageUrl' is used then a dataSource call would be made.
        boundModel.get(['title'])...

        // Other rendering stuff / application logic
        ...
    });
```
