// jshint node: true
'use strict';

prepublish();

function prepublish() {
    require('./distribute')(function(err) {
        if (err) {
            throw err;
        }
    });
}
