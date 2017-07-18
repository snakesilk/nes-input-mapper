const STORAGE_KEY = 'snakesilk-nes-input-map';

const HUMAN_KEYS = {
    'A': 'A',
    'B': 'B',
    'START': 'START',
    'SELECT': 'SELECT',
    'UP': 'UP',
    'DOWN': 'DOWN',
    'LEFT': 'LEFT',
    'RIGHT': 'RIGHT',
};

const HUMAN_CODES = {
    37: '&larr;',
    38: '&uarr;',
    39: '&rarr;',
    40: '&darr;',
};

const REMAP_QUERY = `Press any key to remap "{{key}}".`;
const REMAP_SUCCESS = `Remapped "{{key}}" to {{code}}.`;

function createInput(game, svgElement, storageKey = STORAGE_KEY) {

    function saveMap() {
        const map = game.input.exportMap();
        localStorage.setItem(storageKey, JSON.stringify(map));
    }

    function loadMap() {
        const map = localStorage.getItem(storageKey);
        if (map) {
            game.input.importMap(JSON.parse(map));
        }
    }

    const domElement = document.createElement('div');
    domElement.classList.add('snakesilk-nes-input');

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    domElement.appendChild(messageElement);

    let keyName = null;
    function handleInput(event) {
        const keyCode = event.keyCode;
        if (keyCode === 27) {
            stop();
            emitMessage(null);
            return;
        }

        game.input.assign(keyCode, keyName.toLowerCase());
        const text = REMAP_SUCCESS
            .replace('{{key}}', HUMAN_KEYS[keyName])
            .replace('{{code}}', HUMAN_CODES[keyCode] || String.fromCharCode(keyCode) || keyCode);
        emitMessage(text, false);
        saveMap();
        stop();
    }

    function creatMessaging() {
        let timer;

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
        const text = REMAP_QUERY
            .replace('{{key}}', HUMAN_KEYS[keyName]);

        emitMessage(text, true);
        window.focus();
        window.addEventListener('keydown', handleInput);
    }

    function stop() {
        window.removeEventListener('keydown', handleInput);
    }

    function initialize(svg) {
        const nodes = svg.querySelectorAll('[id]')
        for (let i = 0, node; node = nodes[i]; ++i) {
            const id = node.getAttribute('id');
            if (id.startsWith('snex-button-')) {
                const button = id.replace('snex-button-', '');
                node.addEventListener('click', () => {
                    handleClick(button);
                });
            }
        }
    }

    function handleClick(button) {
        console.log(button);
        keyName = button;
        stop();
        start();
    }

    if (svgElement.contentDocument) {
        initialize(svgElement.contentDocument);
    } else {
        svgElement.addEventListener('load', function() {
            initialize(this.contentDocument);
        });
    }

    const emitMessage = creatMessaging();

    loadMap();

    return domElement;
}

module.exports = {
    createInput,
};
