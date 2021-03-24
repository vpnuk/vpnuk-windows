const { Menu, Tray, nativeImage } = require('electron');
const path = require('path');

const _icons = {
    'enabled': 'icon.png',
    'disabled': 'icon_gray.png',
    'connecting': 'icon_sepia.png',
};

const iconPaths = Object.assign({}, ...Object.keys(_icons).map(key => ({
    [key]: path.join(__dirname, '../assets', _icons[key])
})));

const icons = Object.assign({}, ...Object.keys(iconPaths).map(key => ({
    [key]: nativeImage
        .createFromPath(iconPaths[key])
        .resize({ width: 16, height: 16 })
})));

const tooltipBase = 'VPN UK';

const contextMenuTemplate = [
    { id: 'show', label: tooltipBase, type: 'normal', click: () => { } },
    { id: 'status', label: 'Status: disabled', type: 'normal', enabled: false },
    { label: 'Quit', role: 'quit' }
];

class AppTray {
    constructor(windowFocus = null) {
        this.#tray = new Tray(icons.disabled);
        if (windowFocus) {
            contextMenuTemplate
                .find(item => item.id === 'show')
                .click = windowFocus;
        }
        this.#tray.setContextMenu(
            Menu.buildFromTemplate(contextMenuTemplate));
        this.#tray.setToolTip(tooltipBase);
        this.destroy = this.#tray.destroy;
    }

    setEnabledState = message =>
        this.#setTrayState('enabled', message);

    setDisabledState = message =>
        this.#setTrayState('disabled', message);
    
    #tray = null;

    #setTrayState = (state, message) => {
        const text = `${tooltipBase}: ${message}`;
        this.#tray.setImage(icons[state]);
        this.#tray.setToolTip(text);

        contextMenuTemplate
            .find(item => item.id === 'status')
            .label = `Status: ${message}`;
        this.#tray.setContextMenu(
            Menu.buildFromTemplate(contextMenuTemplate));

        this.#tray.displayBalloon({
            iconType: 'custom',
            icon: iconPaths[state],
            title: text,
            content: message
        });
    }
}

module.exports = AppTray;