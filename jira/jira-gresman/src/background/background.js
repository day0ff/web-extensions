import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

browser.tabs.onActivated.addListener(({tabId, windowId}) => {
    browser.tabs.query({active: true, windowId}, ([tab]) => {
            const path = /helpdesk.senlainc.com/g.test(tab.url) ? '../icons/icon-48-active.png' : '../icons/icon-48.png';

            browser.browserAction.setIcon({path});
        });
});
