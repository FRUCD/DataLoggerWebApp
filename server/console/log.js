var stream = require('stream');
if(process.env.NODE_ENV !== 'test') {
    var blessed = require('blessed');
    var util = require('util');
    var screen = blessed.screen({
        smartCSR: true
    });
    var sprintf = require("sprintf-js").sprintf;
    screen.title = 'DataLogger';
    const StringDecoder = require('string_decoder').StringDecoder;
    const decoder = new StringDecoder('utf8');
    var canMessages = new Map();
    // Create a box perfectly centered horizontally and vertically.
    var left = blessed.text({
        top: 'center',
        left: '0',
        width: '50%',
        height: '100%',
        tags: true,
        scrollable: true,
        alwaysScroll: true,
        border: {
            type: 'line'
        },
        scrollbar: true,
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            },
            hover: {
                bg: 'green'
            }
        }
    });
    var right = blessed.listtable({
        top: 'center',
        right: '0',
        width: '50%',
        height: '100%',
        tags: true,
        scrollable: false,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            },
            hover: {
                bg: 'green'
            }
        }
    });
    // Append our box to the screen.
    screen.append(left);
    screen.append(right);
    // Add a png icon to the box

    // If our box is clicked, change the content.

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });

    // Focus our element.
    left.focus();

    // Render the screen.
    screen.render();
}
function log(input) {
    if(process.env.NODE_ENV !== 'test') {
        if(!(typeof input === 'string')) {
            input = util.inspect(input);
        }
        input = blessed.escape(input);
        left.pushLine(input);
        left.setScrollPerc(100);
        screen.render();
    }
}

module.exports.log = log;

class LogStream extends stream.Writable {
    constructor(options) {
        super (options);
    }
    _write(chunk, encoding, next) {
        log(decoder.write(chunk));
        next();
    }
}
module.exports.logStream = new LogStream({decodeStrings: true});
module.exports.set = function(msg) {
    if(process.env.NODE_ENV !== 'test') {
        var string = '';
        canMessages.set(msg[0], msg.slice(1, msg.length - 1));
        for(let [key, value] of canMessages) {
            string += sprintf('%5X: %08d', key, value[0]);
            for(let i = 1; i < value.length; i++) {
                string += sprintf(' %02X', value[i]);
            }
            string += '\n';
        }
        right.setContent(string);
        screen.render();
    }
};
module.exports.error = function(input) {    
    if(process.env.NODE_ENV !== 'test') {
        if(!(typeof input === 'string')) input = util.inspect(input);
        input = blessed.generateTags({
            fg: 'red'
        },
        blessed.escape(input));

        left.pushLine(input);
        left.setScrollPerc(100);
        screen.render();
    }
};
