var STORAGE_KEY = 'snakesilk-nes-input-map';

var HUMAN_KEYS = {
    'A': 'A',
    'B': 'B',
    'START': 'START',
    'SELECT': 'SELECT',
    'UP': 'UP',
    'DOWN': 'DOWN',
    'LEFT': 'LEFT',
    'RIGHT': 'RIGHT',
};

var HUMAN_CODES = {
    37: '&larr;',
    38: '&uarr;',
    39: '&rarr;',
    40: '&darr;',
};

var REMAP_QUERY = 'Press any key to remap "{{key}}".';
var REMAP_SUCCESS = 'Remapped "{{key}}" to {{code}}.';

function createInput(game, svgElement) {
    function saveMap() {
        var map = game.input.exportMap();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }

    function loadMap() {
        var map = localStorage.getItem(STORAGE_KEY);
        if (map) {
            game.input.importMap(JSON.parse(map));
        }
    }

    var domElement = document.createElement('div');
    domElement.classList.add('snakesilk-nes-input');

    var messageElement = document.createElement('div');
    messageElement.classList.add('message');
    domElement.appendChild(messageElement);

    var keyName = null;
    function handleInput(event) {
        var keyCode = event.keyCode;
        if (keyCode === 27) {
            stop();
            emitMessage(null);
            return;
        }

        game.input.assign(keyCode, keyName.toLowerCase());
        var text = REMAP_SUCCESS
            .replace('{{key}}', HUMAN_KEYS[keyName])
            .replace('{{code}}', HUMAN_CODES[keyCode] || String.fromCharCode(keyCode) || keyCode);
        emitMessage(text, false);
        saveMap();
        stop();
    }

    function createMessaging() {
        var timer;

        function emitMessage(text, hold = false) {
            if (!text) {
                messageElement.classList.remove('show');
                return;
            }

            messageElement.innerHTML = text;
            messageElement.classList.add('show');
            clearTimeout(timer);
            if (hold) {
                return;
            }
            timer = setTimeout(function() {
                messageElement.classList.remove('show');
            }, 3000);
        }

        return emitMessage;
    }

    function start() {
        var text = REMAP_QUERY
            .replace('{{key}}', HUMAN_KEYS[keyName]);

        emitMessage(text, true);
        window.focus();
        window.addEventListener('keydown', handleInput);
    }

    function stop() {
        window.removeEventListener('keydown', handleInput);
    }

    function initialize(svg) {
        var nodes = svg.querySelectorAll('[id]')
        var id;
        for (var i = 0, node; node = nodes[i]; ++i) {
            id = node.getAttribute('id');
            if (id.startsWith('snex-button-')) {
                node.addEventListener('click', (function(button) {
                    return function () {
                        handleClick(button);
                    };
                })(id.replace('snex-button-', '')));
            }
        }
    }

    function handleClick(button) {
        keyName = button;
        stop();
        start();
    }

    var emitMessage = createMessaging();

    if (svgElement.contentDocument) {
        initialize(svgElement.contentDocument);
    } else {
        svgElement.addEventListener('load', function() {
            initialize(this.contentDocument);
        });
    }

    loadMap();

    return domElement;
}

module.exports = {
    createInput,
};
