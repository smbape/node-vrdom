(function() {
    "use strict";

    var resources_toggler = document.getElementById("resources_toggler");
    var external_resource = document.getElementById("external_resource");
    var add_external_resource = document.getElementById("add_external_resource");

    var sources = [
        // jasmine
        "https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.5.2/jasmine.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.5.2/jasmine.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.5.2/jasmine-html.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.5.2/boot.min.js",

        // preact
        "https://npmcdn.com/preact@latest",
        "https://npmcdn.com/proptypes@latest",
        "https://npmcdn.com/preact-compat@latest",

        // react
        "https://cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react.js",
        "https://cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react-dom.js",

        // material-design-lite
        // "https://code.getmdl.io/1.3.0/material.indigo-pink.min.css",
        "https://code.getmdl.io/1.3.0/material.min.js",

        // vrdom
        "https://npmcdn.com/vrdom@latest/dist/vrdom.min.js",
    ];

    resources_toggler.click();
    eachSeries(sources, function(source, next) {
        external_resource.value = source;
        add_external_resource.click();
        nextOnEmpty();

        function nextOnEmpty() {
            if (external_resource.value === "") {
                next();
                next = null;
                nextOnEmpty = null;
                return;
            }

            setTimeout(nextOnEmpty, 10);
        }
    }, function() {
        external_resource = null;
        add_external_resource = null;
    });

    var panel_js_choice = document.getElementById("panel_js_choice");
    var choice = panel_js_choice.querySelector("[data-mime-type=text\\/babel]");

    if (panel_js_choice.value !== choice.value) {
        panel_js_choice.value = choice.value;
        trigger(panel_js_choice, "change");
    }

    function trigger(elem, name) {
        // Create the event.
        var event = document.createEvent("Event");

        // Define that the event name is name.
        event.initEvent(name, true, true);

        // target can be any Element or other EventTarget.
        elem.dispatchEvent(event);
    }

    function eachSeries(arr, callback, done) {
        var index = 0;
        var len = arr.length;

        iterate();

        function iterate() {
            if (index === len) {
                done();
                return;
            }

            callback(arr[index++], iterate);
        }
    }
}());