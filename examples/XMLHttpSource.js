var Observable = falcor.Observable;

function XMLHttpSource(jsongUrl, timeout) {
    this._jsongUrl = jsongUrl;
    this._timeout = timeout || 15000;
}

XMLHttpSource.prototype = {
    /**
     * @inheritDoc DataSource#get
     */
    get: function (pathSet) {
        var method = 'GET';
        var config = buildQueryObject(this._jsongUrl, method, {
            path: pathSet,
            method: 'get'
        });
        return request(method, config);
    },
    /**
     * @inheritDoc DataSource#set
     */
    set: function () {
        // TODO: What to send what to send
    },

    /**
     * @inheritDoc DataSource#call
     */
    call: function (callPath, args, pathSuffix, paths) {
        var method = 'GET';
        var queryData = [];
        args = args || [];
        pathSuffix = pathSuffix || [];
        paths = paths || [];
        paths.forEach(function (path) {
            queryData.push('path=' + encodeURIComponent(JSON.stringify(path)));
        });

        queryData.push('method=call');
        queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));

        if (Array.isArray(args)) {
            args.forEach(function (value) {
                queryData.push('param=' + encodeURIComponent(JSON.stringify(value)));
            });
        }

        if (Array.isArray(pathSuffix)) {
            pathSuffix.forEach(function (value) {
                queryData.push('pathSuffix=' + encodeURIComponent(JSON.stringify(value)));
            });
        }

        var config = buildQueryObject(this._jsongUrl, method, queryData.join('&'));
        return request(method, config);
    }
};

function request(method, config) {
    return Observable.create(function (observer) {
        // i have to actual work now :(
        var xhr = new XMLHttpRequest();

        // Link the response methods
        xhr.onload = onXhrLoad.bind(null, observer, xhr);
        xhr.onerror = onXhrError.bind(null, observer, xhr);
        xhr.ontimeout = onXhrTimeout.bind(null, observer, xhr);

        // Sets information
        xhr.timeout = config.timeout;

        // Anything but explicit false results in true.
        xhr.withCredentials = !(config.withCredentials === false);
        xhr.responseType = 'json';

        // Takes the url and opens the connection
        xhr.open(method, config.url);

        // Fills the request headers
        var requestHeaders = config.requestHeaders || {};
        var keys = Object.keys(requestHeaders);
        keys.forEach(function (k) {
            xhr.setRequestHeader(k, requestHeaders[k]);
        });

        // Sends the request.
        xhr.send(config.data);

        return function () {
            // TODO: Dispose of request.
        };
    });
}

/*
 * General handling of a successfully completed request (that had a 200 response code)
 */
function _handleXhrComplete(observer, data) {
    observer.onNext(data);
    observer.onCompleted();
}

/*
 * General handling of ultimate failure (after appropriate retries)
 */
function _handleXhrError(observer, textStatus, errorThrown) {
    if (!errorThrown) {
        errorThrown = new Error(textStatus);
    }

    observer.onError(errorThrown);
}

function onXhrLoad(observer, xhr) {
    var status,
        responseData,
        repsonseType,
        responseObject;

    // If there's no observer, the request has been (or is being) cancelled.
    if (xhr && observer) {
        status = xhr.status;
        responseType = xhr.responseType;

        if (status >= 200 && status <= 399) {
            try {
                if (responseType === 'text') {
                    responseData = JSON.parse(xhr.responseText || '');
                } else {
                    responseData = xhr.response;
                }
            } catch (e) {
                _handleXhrError(observer, 'invalid json', e);
            }
            _handleXhrComplete(observer, responseData);
        } else if (status === 401 || status === 403 || status === 407) {
            _handleXhrError(observer, responseData);
        } else if (status === 410) {
            // TODO: Retry ?
            _handleXhrError(observer, responseData);
        } else if (status === 408 || status === 504) {
            // TODO: Retry ?
            _handleXhrError(observer, responseData);
        } else {
            _handleXhrError(observer, responseData || ('Response code ' + status));
        }
    }
}

function onXhrError(observer, xhr) {
    _handleXhrError(observer, xhr.statusText || 'request error');
}

function onXhrTimeout(observer) {
    _handleXhrError(observer, 'request timeout');
}

function buildQueryObject(url, method, queryData) {
    var qData = [];
    var keys;
    var data = {url: url};

    if (typeof queryData === 'string') {
        qData.push(queryData);
    } else {
        keys = Object.keys(queryData);
        keys.forEach(function (k) {
            var value = typeof queryData[k] === 'object' ? JSON.stringify(queryData[k]) : queryData[k];
            qData.push(k + '=' + value);
        });
    }

    if (method === 'GET') {
        data.url += '?' + qData.join('&');
    } else {
        data.data = qData.join('&');
    }

    return data;
}

