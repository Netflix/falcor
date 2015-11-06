# 0.x to 1.x
No More Rx
-------

Rx has been removed from the prototype of `ModelResponse`.  In `0.x` branches
of falcor the `ModelResponse` class was implemented in the following way.

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
The old deref worked is such a way that the path to be dereference and leaves
were required to successfully deref to that location.  If the leaves did not
exist within the cache then a network request was made to fill in the cache.

The new deref works completely different.  Instead of specifying a path via an
array, the output from get is used.  Lets go over some examples:

First lets build a model with some initial cache.
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

If we were to use `deref` in the old we would have to perform the following.
```javascript
model.
    deref(['genreLists', 0, 0], ['title', 'imageUrl']).
    subscribe(function(boundModel) {
        // equivalent to model.get(['genreLists', 0, 0, 'title'])
        // -> { json: { title: 'Total Recall (June 1st, 1990)' } }
        boundModel.get(['title'])...

        // Other rendering stuff / application logic
        ...
    });
```

The new `deref` works from the output of `get`, so the same thing could be
accomplished with the following.
```javascript
model.
    get(['genreLists', 0, 0, 'title']).
    subscribe(function(x) {
        var json = x.json;
        var boundModel = model.deref(json.genreLists[0][0]);

        // equivalent to model.get(['genreLists', 0, 0, 'title'])
        // -> { json: { title: 'Total Recall (June 1st, 1990)' } }
        boundModel.get(['title'])...

        // Other rendering stuff / application logic
        ...
    });
```
