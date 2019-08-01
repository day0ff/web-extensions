import { browser } from '../common/browser-api-wrapper.js';

browser.browserAction.onClicked.addListener(() => {
    browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];
        browser.tabs.reload(activeTab.id)

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
    console.log(changes);
    const path = changes.isMobile.newValue ? {'48': '../icons/icon-48-active.png'} : {'48': '../icons/icon-48.png'};
    browser.browserAction.setIcon({path: path});
});

