import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';
import { updateStorage } from '../storage/storage.js';

const messages = {
    error:{
        empty: 'Please, fill the form.',
        request: 'Incorrect credential.'
    },
    info:{
        request: 'pending request...'
    }
};

const browser = new BrowserApiWrapper().browser;

let popupState = {};

const sections = [...document.querySelectorAll('section[class="tab"]')];
const menu = document.getElementById('menu');
const initSection = document.querySelector('#init');
const initStart = initSection.querySelector('a[name="start"]');

const basicSection = document.querySelector('#basic');
const basicForm = document.forms.basic;
const basicSubmit = basicSection.querySelector('a[name="submit"]');

const secureSection = document.querySelector('#secure');
const secureForm = document.forms.secure;
const secureSubmit = secureSection.querySelector('a[name="submit"]');

const issuesSection = document.querySelector('#issues');
const issuesForm = document.forms.issues;
const issuesList = document.querySelector('#issues-list');
const issuesGet = issuesForm.get;
const issuesSave = issuesForm.save;

const logtimeSection = document.querySelector('#logtime');
const logtimeForm = document.forms.logtime;
const issueSelect = logtimeForm.issues;
const logSubmit = logtimeForm.log;
const cancelSubmit = logtimeForm.cancel;

const storageSection = document.querySelector('#storage');
const getButton = document.getElementById('get');
const delButton = document.getElementById('del');
const testButton = document.getElementById('test');

menu.addEventListener('click', ({target: {name}}) => {
    showSection(name);
});

initStart.addEventListener('click', () => {
    updateStorage({stage: 'BASIC', status: 'BEGIN'});
});

basicSubmit.addEventListener('click', () => {
    if (checkForm(basicForm)) {
        const basic = {
            login: basicForm.login.value.replace(/\s/, ''),
            password: basicForm.password.value.replace(/\s/, ''),
        };

        updateStorage({status: 'REQUEST', basic});
    } else{
        showError('basic', messages.error.empty);
    }
});

secureSubmit.addEventListener('click', () => {
    if (checkForm(secureForm)) {
        const {basic} = popupState;
        const secure = {
            login: secureForm.login.value.replace(/\s/, ''),
            password: secureForm.password.value.replace(/\s/, ''),
        };

        browser.runtime.sendMessage({popup: {message: 'secure', basic, secure}});
    }
});

issuesGet.addEventListener('click', () => {
    browser.runtime.sendMessage({popup: {message: 'issues'}});
});

issuesSave.addEventListener('click', () => {
    const issueName = issuesForm.issue && issuesForm.issue.value;

    if (issueName) {
        const issues = popupState.issues.map(issue => issue.name === issueName ? {...issue, checked: true} : {...issue, checked: false});

        updateStorage({issues, stage: 'LOGTIME'}, () => console.log('Log issue saved.'));
    }
});

logSubmit.addEventListener('click', () => {
    if (checkForm(logtimeForm)) {
        const logtime = {
            issue: logtimeForm.issue.value.replace(/\s/, ''),
            comment: logtimeForm.comment.value.replace(/\s/, ''),
            date: logtimeForm.date.value.replace(/\s/, ''),
            worked: logtimeForm.worked.value.replace(/\s/, ''),
            billable: logtimeForm.billable.value.replace(/\s/, ''),
        };

        console.log(logtime);
        // browser.runtime.sendMessage({popup: {message: 'logtime', logtime}});
        // updateStorage({logtime, stage: 'PENDING'}, () => console.log('Log Time.'));
    }
});

getButton.addEventListener('click', () => {
    browser.storage.local.get('gresman', ({gresman}) => {
        console.log(gresman);
    });
});

delButton.addEventListener('click', () => {
    browser.storage.local.remove('gresman', () => {
        console.log('Remove gresman');
    });
});

testButton.addEventListener('click', () => {
    browser.runtime.sendMessage({popup: {message: 'test'}});
});


browser.storage.local.get('gresman', ({gresman}) => {
    popupState = gresman;
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
            showSection('init');
        });
        return;
    }

    if(gresman.stage && gresman.stage === 'INIT'){
        showSection('init');
        return;
    }

    if (gresman.stage && gresman.stage === 'BASIC') {
    // if (!(gresman.basic && gresman.basic.login && gresman.basic.password)) {
        showSection('basic');
        basicForm.login.value = popupState.basic && popupState.basic.login || '';
        basicForm.password.value = popupState.basic && popupState.basic.password || '';
        return;
    } else {

    }

    if (gresman.stage && gresman.stage === 'SECURE') {
    // if (!(gresman.secure && gresman.secure.login && gresman.secure.password)) {
        showSection('secure');
        secureForm.login.value = popupState.secure && popupState.secure.login || '';
        secureForm.password.value = popupState.secure && popupState.secure.password || '';
        return;
    }

    // if (!(gresman.issues && gresman.issues.length)) {
    //     showSection('issues');
    //     return;
    // } else {
    //     setIssuesList(popupState.issues);
    // }
    //
    // if (!gresman.log) {
    //     showSection('issues');
    //     return;
    // } else {
    //     setIssuesList(popupState.issues);
    // }
    // showSection('logtime');
    // setLogTime(popupState);
});

browser.storage.local.onChanged.addListener((storage) => {
    if (storage.gresman && storage.gresman.newValue) {
        popupState = storage.gresman.newValue;
        console.log(popupState.stage);
        switch (popupState.stage) {
            case 'BASIC':
                showSection('basic');
                break;
            case 'SECURE':
                showSection('secure');
                break;
            case 'ISSUES':
                showSection('issues');
                setIssuesList(popupState.issues);
                break;
            default:
                showSection('logtime');
                setLogTime(popupState);
        }
        switch (popupState.status) {
            case 'ERROR':
                showInfo(popupState.stage.toLowerCase(), ' ');
                showError(popupState.stage.toLowerCase(), messages.error.request);
                break;
            case 'REQUEST':
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), messages.info.request);
                break;
            default:
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), ' ');
        }
    }
});

function setIssuesList(issues) {
    if (issues && issues.length) {
        issuesList.innerHTML = issues.map(issue =>
            `<li>
            <input type="radio" id="${issue.id}" name="issue" value="${issue.name}" ${issue.checked && 'checked=true'}><label for="${issue.id}">${issue.name}</label>
        </li>`).join('');
    }
}

function setLogTime(data) {
    const {issues} = data;

    if (issues.length) {
        issueSelect.innerHTML = issues.map(issue => `<option value="${issue.id}" ${issue.checked && 'selected'}>${issue.name}</option>`).join('');
    }

    logtimeForm.date.value = new Date().toJSON().split('T')[0];
}

function showSection(name) {
    sections.forEach(section => {
        section.style.display = section.id === name ? 'block' : 'none';
        // section.querySelector('.error').textContent = ' ';
        // section.querySelector('.info').textContent = ' ';
    });
}

function showError(name, error) {
    sections.find(section => section.id === name).querySelector('.error').textContent = error;
}

function showInfo(name, info) {
    sections.find(section => section.id === name).querySelector('.info').textContent = info;
}

function checkForm(form) {
    return [...form].every(element => !!element.value);
}

