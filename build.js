var jade = require('jade'),
fs = require('fs');

var dir = __dirname,
exdir = dir + '/examples/',
examples = fs.readdirSync(exdir),
input = fs.readFileSync(dir + '/index.jade'),
output = dir + '/index.html';

examples = examples.map(function(ex) {
    return fs.readFileSync(exdir + ex).toString().split(/\n/);
});

var markup = jade.compile(input)({
    examples: examples
});

fs.writeFileSync(output, markup);

