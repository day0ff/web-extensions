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
                window: null,
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
                    updateStorage({stage: 'SECURE', status: 'BEGIN'});
                }
                else throw new Error();
            }).catch(() => {
                updateStorage({status: 'ERROR'});
            })
        }

    }
});

browser.runtime.onMessage.addListener(
    (request) => {
        if (request.popup && request.popup.message && request.popup.message === 'basic') {
            const {basic} = request.popup;

            basicRequest(basic).then(response => {
                if (response.status === 200) {
                    updateStorage({basic, stage: 'SECURE'}, () => console.log('Basic credential saved.'));
                }
                else throw new Error();
            }).catch(() => {
                updateStorage({stage: 'ERROR'}, () => console.log('Failed Basic credential.'));
            })
        }

        if (request.popup && request.popup.message && request.popup.message === 'secure') {
            const {basic, secure} = request.popup;

            secureRequest({basic, secure}).then(response => {
                if (response.status === 200) {
                    updateStorage({secure, stage: 'ISSUES'}, () => console.log('Secure credential saved.'));
                    return response.text();
                } else throw new Error();
            }).then(() => {
                browser.tabs.create({url: 'https://helpdesk.senlainc.com/login.jsp', active: false}, (tab) => {
                    updateStorage({tab, stage: 'ISSUES'}, () => console.log('Tab opened.'));
                });
            }).catch(() => {
                updateStorage({stage: 'ERROR'}, () => console.log('Failed Secure credential.'));
            })
        }

        // if (request.popup && request.popup.message && request.popup.message === 'issues') {
        //     const tabId = backgroundState.tab && backgroundState.tab.id;
        //
        //     browser.tabs.update(tabId, {
        //         url: 'https://helpdesk.senlainc.com/secure/Dashboard.jspa',
        //         active: false
        //     }, () => {
        //         if (browser.runtime.lastError) {
        //             browser.tabs.create({
        //                 url: 'https://helpdesk.senlainc.com/secure/Dashboard.jspa',
        //                 active: false
        //             }, (tab) => {
        //                 updateStorage({tab, stage: 'PENDING'}, () => console.log('Get issues.'));
        //             });
        //         } else {
        //             updateStorage({stage: 'PENDING'}, () => console.log('Get issues.'));
        //         }
        //     });
        // }

        if (request.popup && request.popup.message && request.popup.message === 'test') {
            const basic = {
                login: 'senla',
                password: 'ggnore'
            };

            logRequest({basic}).then(response => {
              if(response.status===200){

              }else{
                  console.log('Repit Login');
              }
            }).catch(error=>{
                console.log('Error');
            });
        }
    }
);


