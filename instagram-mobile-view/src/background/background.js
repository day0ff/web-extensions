import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

browser.browserAction.onClicked.addListener(() => {
    browser.tabs.query({url: '*://*.instagram.com/*', currentWindow: true}, (tabs) => {
        tabs.forEach(tab => browser.tabs.reload(tab.id));
    });
    browser.storage.local.get('isMobile', (data) => {
        browser.storage.local.set({isMobile: !data.isMobile});
    });
});

browser.storage.local.get('isMobile', (data) => {
    const path = data.isMobile ? {'48': '../icons/icon-48-active.png'} : {'48': '../icons/icon-48.png'};
    browser.browserAction.setIcon({path: path});
});

browser.storage.onChanged.addListener((changes) => {
    const path = changes.isMobile.newValue ? {'48': '../icons/icon-48-active.png'} : {'48': '../icons/icon-48.png'};
    browser.browserAction.setIcon({path: path});
});

