import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

const updateStorage = (data, callback) =>{
    browser.storage.local.get('gresman', ({gresman}) =>{
        browser.storage.local.set({gresman: {...gresman, ...data}}, callback);
    });
};

export { updateStorage };
