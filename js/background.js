var $ = require('jquery');

var makeBackgroundRed = function() {
    $('body').css('background-color', 'rgba(0, 0, 0, 0.7)');
};

module.exports = makeBackgroundRed;