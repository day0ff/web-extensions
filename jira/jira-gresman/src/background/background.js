import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';
import { updateStorage } from '../storage/storage.js';
import { basicRequest, secureRequest, logRequest } from '../services/requests.js';

const browser = new BrowserApiWrapper().browser;

let backgroundState = {};

browser.runtime.onInstalled.addListener(() => {
    console.log('Extension was successfully installed.');

    browser.storage.local.get('gresman', ({gresman}) => {
        backgroundState = gresman;
        if (!gresman) {
            const state = {
                basic: null,
                secure: null,
                tab: null,
                issues: null,
                log: null,
                temp: null,
                stage: 'INIT',
                status: 'DONE'
            };

            browser.storage.local.set({gresman: state}, () => {
                console.log('Local storage is initialized.');
            });
        }
    });
});

browser.webRequest.onAuthRequired.addListener((details, callback) => {
        const {basic} = backgroundState;

        if (basic && basic.login && basic.password) {
            callback({authCredentials: {username: basic.login, password: basic.password}});
        } else {
            callback({cancel: true});
        }
    },
    {urls: ['*://helpdesk.senlainc.com/*']},
    ['asyncBlocking']
);

/* TODO detect open/close window */
/*
browser.windows.onCreated.addListener((windowid)=>{
    console.log("window open", windowid);
    // updateStorage({stage: 'ERROR'}, () => console.log('Failed Basic credential.'));
});

browser.windows.onRemoved.addListener((windowId) => {
    console.log("window closed", windowId);
    // updateStorage({window: {id: windowId}}, () => console.log('Failed Basic credential.'));
});
*/

/* TODO detect switch tab and replace icon */
/*
browser.tabs.onActivated.addListener(({tabId, windowId}) => {
    browser.tabs.query({active: true, windowId}, ([tab]) => {
        const path = /helpdesk.senlainc.com/g.test(tab.url) ? '../icons/icon-48-active.png' : '../icons/icon-48.png';

        browser.browserAction.setIcon({path});
    });
});
*/

browser.storage.local.onChanged.addListener((storage) => {
    if (storage.gresman && storage.gresman.newValue) {
        backgroundState = storage.gresman.newValue;
        console.log(backgroundState);

        if (backgroundState.stage === 'BASIC' && backgroundState.status === 'REQUEST') {
            const {basic} = backgroundState;

            basicRequest(basic).then(response => {
                if (response.status === 200) {
                    updateStorage({stage: 'STEP1', status: 'END'});
                }
                else throw new Error();
            }).catch(() => {
                updateStorage({status: 'ERROR'});
            })
        }

        if (backgroundState.stage === 'SECURE' && backgroundState.status === 'REQUEST') {
            const {basic, secure} = backgroundState;

            secureRequest({basic, secure}).then(response => {
                if (response.status === 200) {
                    updateStorage({status: 'LOGIN'});
                    return response.text();
                } else throw new Error();
            }).then(() => {
                browser.tabs.create({
                    url: 'https://helpdesk.senlainc.com/login.jsp', active: true
                }, (tab) => updateStorage({tab}));
            }).catch(() => {
                updateStorage({status: 'ERROR'});
            })
        }

        if (backgroundState.stage === 'SECURE' && backgroundState.status === 'ISSUES') {
            updateStorage({stage: 'STEP2', status:'BEGIN'});
        }

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'REQUEST') {
            const {basic, secure, logtime} = backgroundState;

            logRequest({basic, secure, logtime}).then(response => {
                if (response.status === 200) {
                    updateStorage({status: 'LOGGED', temp: null});
                } else throw new Error();
            }).catch(() => {
                updateStorage({status: 'LOGGED_ERROR'});
            })
        }

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'ISSUES') {
            browser.tabs.create({
                url: 'https://helpdesk.senlainc.com/secure/Dashboard.jspa',
                active: true
            }, (tab) => updateStorage({tab, status: 'GET_ISSUES'}));
        }

        if (backgroundState.tab && backgroundState.tab.id && (backgroundState.status === 'BEGIN' || backgroundState.status === 'ERROR')) {
            browser.tabs.remove(backgroundState.tab.id, () => updateStorage({tab:null}));
        }
    }
});
