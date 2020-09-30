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
                logtime: null,
                options: {issue: {id: '13240', name: 'GRESMAN-404'}},
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

browser.storage.onChanged.addListener((storage) => {
    if (storage.gresman && storage.gresman.newValue) {
        backgroundState = storage.gresman.newValue;

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

        if (backgroundState.stage === 'SECURE' && (backgroundState.status === 'ISSUES' || backgroundState.status === 'ERROR_ISSUES')) {
            updateStorage({stage: 'STEP2', status: 'BEGIN'});
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

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'SIGN_IN') {
            browser.tabs.create({
                url: 'https://helpdesk.senlainc.com/login.jsp',
                active: true
            }, (tab) => updateStorage({tab, status: 'LOGIN'}));
        }

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'REFRESH') {
            browser.tabs.create({
                url: 'https://helpdesk.senlainc.com/secure/Dashboard.jspa',
                active: true
            }, (tab) => updateStorage({tab, status: 'GET_ISSUES'}));
        }

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'ISSUES') {
            updateStorage({status: 'BEGIN'});
        }

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'TEMPO') {
            browser.tabs.create({
                url: 'https://helpdesk.senlainc.com/secure/Tempo.jspa#/my-work',
                active: true
            }, () => updateStorage({status: 'BEGIN'}));
        }

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'DASHBOARD') {
            browser.tabs.create({
                url: 'https://helpdesk.senlainc.com/secure/Dashboard.jspa',
                active: true
            }, () => updateStorage({status: 'BEGIN'}));
        }

        if (backgroundState.stage === 'LOGTIME' && backgroundState.status === 'SEARCH') {
            browser.tabs.create({
                url: 'https://helpdesk.senlainc.com/issues/',
                active: true
            }, () => updateStorage({status: 'BEGIN'}));
        }

        if (backgroundState.tab && backgroundState.tab.id && (backgroundState.status === 'BEGIN' || backgroundState.status === 'ERROR')) {
            browser.tabs.remove(backgroundState.tab.id, () => updateStorage({tab: null}));
        }
    }
});

browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.tempo && request.tempo.message) {
            if (request.tempo.message === 'report' && request.tempo.report) {
                const {basic, secure, options} = backgroundState;
                const {report} = request.tempo;
                const logtime = {
                    issue: options.issue.id,
                    comment: report.link,
                    date: report.date,
                    worked: report.time,
                    billable: report.time,
                };
                browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    const activeTab = tabs[0];

                    logRequest({basic, secure, logtime}).then(response => {
                        if (response.status === 200) {
                            browser.tabs.sendMessage(activeTab.id, {background: {message: 'report', status: 'complete'}});
                        } else throw new Error();
                    }).catch(() => {
                        browser.tabs.sendMessage(activeTab.id, {background: {message: 'report', status: 'error'}});
                    })
                });
            }
            if (request.tempo.message === 'reports'  && request.tempo.reports) {
                const {basic, secure, options} = backgroundState;
                const {reports} = request.tempo;

                browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    const activeTab = tabs[0];

                    Promise.all(reports.map(report => logRequest({basic, secure, logtime:{
                            issue: options.issue.id,
                            comment: report.link,
                            date: report.date,
                            worked: report.time,
                            billable: report.time,
                        }}))).then(responses => {
                            const ok = responses.every(response => response.status === 200);

                            if (ok) {
                                browser.tabs.sendMessage(activeTab.id, {background: {message: 'reports', status: 'complete'}});
                            } else throw new Error();
                        }).catch(() => {
                            browser.tabs.sendMessage(activeTab.id, {background: {message: 'reports', status: 'error'}});
                        })
                });
            }
        }
        sendResponse({background: {response: 'Response from Background!'}});
    }
);
