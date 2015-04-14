var TokenTypes = require('./TokenTypes');
var DOT_SEPARATOR = '.';
var COMMA_SEPARATOR = ',';
var OPENING_BRACKET = '[';
var CLOSING_BRACKET = ']';
var DOUBLE_OUOTES = '"';
var SINGE_OUOTES = "'";
var SPACE = " ";
var SPECIAL_CHARACTERS = '\'"[]., ';
var TokenTypes = require('./TokenTypes');

module.exports = function tokenizer(string) {
    var idx = -1;
    return function() {
        var token = '';
        var done;
        do {

            done = idx === string.length;
            if (done) {
                return {done: true};
            }
            // we have to peek at the next token
            var character = string[idx + 1];

            // if its not a special character we need to accumulate it.
            var isQuote = character === SINGE_OUOTES ||
                character === DOUBLE_OUOTES;

            if (character !== undefined &&
                    SPECIAL_CHARACTERS.indexOf(character) === -1) {
                token += character;
                ++idx;
                continue;
            }
            if (token.length) {
                return toOutput(token, TokenTypes.token, done);
            }

            ++idx;
            var type;
            switch (character) {
                case DOT_SEPARATOR:
                    type = TokenTypes.dotSeparator;
                    break;
                case COMMA_SEPARATOR:
                    type = TokenTypes.commaSeparator;
                    break;
                case OPENING_BRACKET:
                    type = TokenTypes.openingBracket;
                    break;
                case CLOSING_BRACKET:
                    type = TokenTypes.closingBracket;
                    break;
                case SPACE:
                    type = TokenTypes.space;
                    break;
                case DOUBLE_OUOTES:
                case SINGE_OUOTES:
                    type = TokenTypes.quote;
                    break;
            }
            if (type) {
                return toOutput(token, type, done);
            }
        } while (!done);
        if (token.length) {
            return toOutput(token, TokenTypes.token, false);
        }
        return {done: true};
    };
};

function toOutput(token, type, done) {
    return {
        token: token,
        done: done,
        type: type
    };
}

