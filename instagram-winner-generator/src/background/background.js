import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

browser.runtime.onInstalled.addListener(() => {

    browser.storage.local.get('iwg', data => {
        if (!data.iwg) {
            browser.storage.local.set({iwg: {stage: 'initial'}});
        }
    });

});
