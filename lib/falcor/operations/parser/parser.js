var tokenizer = require('./tokenizer');
var TokenTypes = require('./TokenTypes');
var Expections = require('./expections');

/**
 * not only is this the parser, it is also the
 * semantic analyzer for brevity sake / we never need
 * this to change overall types of output.
 */
module.exports = function parser(string) {
    var out = [];
    var tokenized = tokenizer(string);
    var state = {};

    var token = tokenized();
    while (!token.done) {

        debugger
        switch (token.type) {
            case TokenTypes.token:
                insertToken(token.token, state, out);
                break;
            case TokenTypes.dotSeparator:
                dotSeparator(token.token, state, out);
                break;
            case TokenTypes.space:
                space(token.token, state, out);
                break;
            case TokenTypes.commaSeparator:
                commaSeparator(token.token, state, out);
                break;
            case TokenTypes.openingBracket:
                openIndexer(token.token, state, out);
                break;
            case TokenTypes.closingBracket:
                closeIndexer(token.token, state, out);
                break;
            case TokenTypes.quote:
                quote(token.token, state, out);
                break;
        }

        token = tokenized();
    }

    return out;
};

function space(token, state, out) {
    // The space character only matters when inIndexer
    // and in quote mode.
    if (state.inIndexer && state.quote) {
        state.indexerToken += token;
    }
}

function insertToken(token, state, out) {
    state.hasDot = false;

    // if within indexer then there are several edge cases.
    if (state.inIndexer) {
        tokenInIndexer(token, state, out);
        return;
    }

    // if not in indexer just insert into end position.
    out[out.length] = token;
}

function dotSeparator(token, state, out) {

    // If in indexer then dotOperators have different meanings.
    if (state.inIndexer) {
        indexerDotOperator(token, state, out);
    }

    // throws an expection if a range operator is outside of a range.
    else if (state.hasDot) {
        throw Expections.twoDot;
    }
    state.hasDot = true;
}

function commaSeparator(token, state, out) {
    debugger
    if (state.hasDot) {
        throw Expections.dotComma;
    }

    // If in indexer then dotOperators have different meanings.
    if (state.inIndexer) {
        indexerCommaOperator(token, state, out);
    }
}

// Accumulates dotSeparators inside indexers
function indexerDotOperator(token, state, out) {

    // must be preceded by token.
    if (state.indexerToken === undefined) {
        throw Expections.leadingDotInIndexer;
    }

    // if in quote mode, add the dot indexer to quote.
    if (state.quote) {
        state.indexerToken += token;
        return;
    }


    if (!state.rangeCount) {
        state.range = true;
        state.rangeCount = 0;
    }

    ++state.rangeCount;

    if (state.rangeCount === 2) {
        state.inclusiveRange = true;
    }

    else if (state.rangeCount === 3) {
        state.exclusiveRange = true;
        state.inclusiveRange = false;
    }
}

function indexerCommaOperator(token, state, out) {

    // are we a range indexer?
    if (state.range) {
        closeRangedIndexer(token, state, out);
    }

    // push previous token and clear state.
    else if (state.inIndexer) {
        pushTokenIntoIndexer(token, state, out);
    }

    // If a comma is used outside of an indexer throw
    else {
        throw Expections.commasOutsideOfIndexers;
    }
}

function pushTokenIntoIndexer(token, state, out) {
    // no token to push, throw error.
    if (state.indexerToken === undefined) {
        throw Expections.leadingComma;
    }

    // push the current token onto the stack then clear state.
    state.indexer[state.indexer.length] = state.indexerToken;
    cleanIndexerTokenState(state);
}

function openIndexer(token, state, out) {
    if (state.inIndexer) {
        throw Expections.nestedIndexers;
    }
    state.inIndexer = true;
    state.indexer = [];
}

function closeIndexer(token, state, out) {

    // must be within an indexer to close.
    if (!state.inIndexer) {
        throw Expections.closingWithoutOpeningIndexer;
    }

    // The quotes could be non terminating
    if (state.quote) {
        throw Expections.nonTerminatingQuotes;
    }


    // are we a range indexer?
    if (state.range) {
        closeRangedIndexer(token, state, out);
    }

    // are we have a token?
    else if (state.indexerToken !== undefined) {
        pushTokenIntoIndexer(token, state, out);
    }

    // empty indexer.  Must be after the potential addition
    // statements.
    if (state.indexer && state.indexer.length === 0) {
        throw Expections.emptyIndexer;
    }

    // flatten to avoid odd JSON output.
    if (state.indexer && state.indexer.length === 1) {
        state.indexer = state.indexer[0];
    }

    out[out.length] = state.indexer;

    // removes all indexer state
    cleanIndexerRangeState(state);
    cleanIndexerTokenState(state);
    state.indexer =
        state.inIndexer = undefined;
}

function closeRangedIndexer(token, state, out) {
    state.indexer[state.indexer.length] = {
        from: state.indexerToken,
        to: state.rangeCloseToken - (state.exclusiveRange && 1 || 0)
    };
    cleanIndexerRangeState(state);
}

function cleanIndexerRangeState(state) {
    state.inclusiveRange =
        state.exclusiveRange =
        state.range =
        state.rangeCloseToken =
        state.rangeCount = undefined;
}

// removes state associated with indexerTokenState.
function cleanIndexerTokenState(state) {
    state.indexerToken =
        state.indexerTokenQuoted = undefined;
}

function tokenInRange(token, state, out) {
    token = +token;
    if (isNaN(token)) {
        throw Expections.numericRange;
    }

    state.rangeCloseToken = token;
}

function tokenInIndexer(token, state, out) {

    // finish the range token.
    if (state.range) {
        tokenInRange(token, state, out);
    }


    // quote mode, accumulate tokens.
    else if (state.quote) {
        if (state.indexerToken === undefined) {
            state.indexerToken = '';
        }
        state.indexerToken += token;
    }

    // We are in range mode.
    else {
        token = +token;
        if (isNaN(token)) {
            throw Expections.tokensMustBeNumeric;
        }

        state.indexerToken = token;
    }
}

// this function just ensures that quotes only happen in indexers,
// outside of ranges, and with 1 or more length tokens.
function quote(token, state, out) {

    if (state.indexerTokenQuoted) {
        throw Expections.indexerTokensMustBeCommaDelimited;
    }

    if (!state.inIndexer) {
        throw Expections.quotesOutsideIndexer;
    }

    var was = state.quote;
    var toBe = !was;
    state.quote = toBe;

    // so deep
    if (was && !toBe) {
        if (state.indexerToken === undefined) {
            throw Expections.emptyQuotes;
        }
        state.indexerTokenQuoted = true;
    }
}
