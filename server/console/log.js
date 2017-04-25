var blessed = require('blessed');
var util = require('util');
var screen = blessed.screen({
    smartCSR: true
});

screen.title = 'DataLogger';

// Create a box perfectly centered horizontally and vertically.
var left = blessed.text({
    top: 'center',
    left: '0',
    width: '50%',
    height: '100%',
    content: 'Regular output',
    tags: true,
    scrollable: true,
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

// Add a png icon to the box

// If our box is clicked, change the content.

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
left.focus();

// Render the screen.
//screen.render();
module.exports.log = function(input) {
    if(!(input instanceof String)) input = util.inspect(input);
    left.insertLine(1, input);
    //screen.render();
};
