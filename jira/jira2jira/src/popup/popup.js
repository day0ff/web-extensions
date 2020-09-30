import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';
import { updateStorage } from '../storage/storage.js';

const messages = {
    error: {
        empty: 'Please, fill the form.',
        request: 'Invalid credentials.',
        issues: "Can't get issues.",
        logged: 'Please, press login and repeat.'
    },
    info: {
        request: 'pending request...',
        login: 'pending login...',
        captcha: 'please, fill captcha...',
        getIssues: 'getting a list of issues...',
        logged: 'time logged',
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

const step1Section = document.querySelector('#step1');
const step1Next = step1Section.querySelector('a[name="next"]');

const secureSection = document.querySelector('#secure');
const secureForm = document.forms.secure;
const secureSubmit = secureSection.querySelector('a[name="submit"]');

const step2Section = document.querySelector('#step2');
const step2Next = step2Section.querySelector('a[name="next"]');

const logtimeSection = document.querySelector('#logtime');
const logtimeForm = document.forms.logtime;
const issueSelect = logtimeForm.issues;
const refreshSubmit = logtimeSection.querySelector('a[name="refresh"]');
const logSubmit = logtimeSection.querySelector('a[name="log"]');
const loginSubmit = logtimeSection.querySelector('a[name="login"]');
const tempoSubmit = logtimeSection.querySelector('a[name="tempo"]');
const dashboardSubmit = logtimeSection.querySelector('a[name="dashboard"]');
const searchSubmit = logtimeSection.querySelector('a[name="search"]');
const logoutSubmit = logtimeSection.querySelector('a[name="logout"]');

const popupLogout = document.querySelector('.popup-logout');
const yesSubmit = popupLogout.querySelector('a[name="yes"]');
const cancelSubmit = popupLogout.querySelector('a[name="cancel"]');

const popupLogged = document.querySelector('.popup-logged');
const okSubmit = popupLogged.querySelector('a[name="ok"]');

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
    } else {
        showError('basic', messages.error.empty);
    }
});

basicForm.addEventListener('change', ()=>{
    const temp = {
        basic: {
            login: basicForm.login.value.replace(/\s/, '') || '',
            password: basicForm.password.value.replace(/\s/, '') || '',
        }
    };

    updateStorage({temp});
});

step1Next.addEventListener('click', () => {
    updateStorage({stage:'SECURE', status: 'BEGIN'});
});

secureForm.addEventListener('change', ()=>{
    const temp = {
        secure: {
            login: secureForm.login.value.replace(/\s/, '') || '',
            password: secureForm.password.value.replace(/\s/, '') || '',
        }
    };

    updateStorage({temp});
});

secureSubmit.addEventListener('click', () => {
    if (checkForm(secureForm)) {
        const secure = {
            login: secureForm.login.value.replace(/\s/, ''),
            password: secureForm.password.value.replace(/\s/, ''),
        };

        updateStorage({status: 'REQUEST', secure});
    } else{
        showError('secure', messages.error.empty);
    }
});

step2Next.addEventListener('click', () => {
    updateStorage({stage:'LOGTIME', status: 'BEGIN'});
});

logtimeForm.addEventListener('change', ()=>{
    const temp = {
        logtime: {
            issue: logtimeForm.issue.value.replace(/\s/, ''),
            comment: logtimeForm.comment.value.replace(/\s/, ''),
            date: logtimeForm.date.value.replace(/\s/, ''),
            worked: logtimeForm.worked.value.replace(/\s/, ''),
            billable: logtimeForm.billable.value.replace(/\s/, ''),
        }
    };

    updateStorage({temp});
});

refreshSubmit.addEventListener('click', () => {
    updateStorage({status: 'REFRESH'});
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

        updateStorage({logtime, status: 'REQUEST'});
    } else{
        showError('logtime', messages.error.empty);
    }
});

loginSubmit.addEventListener('click', () => {
    updateStorage({status: 'SIGN_IN'});
});

tempoSubmit.addEventListener('click', () => {
    updateStorage({status: 'TEMPO'});
});

dashboardSubmit.addEventListener('click', () => {
    updateStorage({status: 'DASHBOARD'});
});

searchSubmit.addEventListener('click', () => {
    updateStorage({status: 'SEARCH'});
});

logoutSubmit.addEventListener('click', () => {
    popupLogout.style.display = 'flex';
});

yesSubmit.addEventListener('click', ()=>{
    const state = {
        basic: null,
        secure: null,
        tab: null,
        issues: null,
        log: null,
        logtime: null,
        temp: null,
        stage: 'INIT',
        status: 'DONE'
    };

    popupLogout.style.display = 'none';
    updateStorage(state);
});

cancelSubmit.addEventListener('click', () => {
    popupLogout.style.display = 'none';
});

okSubmit.addEventListener('click', () => {
    popupLogged.style.display = 'none';
    updateStorage({status: 'BEGIN'});
});

browser.storage.local.get('gresman', ({gresman}) => {
    popupState = gresman;
    console.log(popupState);
    if (!gresman) {
        const state = {
            basic: null,
            secure: null,
            tab: null,
            issues: null,
            log: null,
            logtime: null,
            options: {issue:{id: "13240", name: "GRESMAN-404"}},
            temp: null,
            stage: 'INIT',
            status: 'DONE'
        };

        browser.storage.local.set({gresman: state}, () => {
            console.log('Local storage is initialized.');
            showSection('init');
        });
        return;
    }

    if (gresman.stage && gresman.stage === 'INIT') {
        showSection('init');
        return;
    }

    if (gresman.stage && gresman.stage === 'BASIC') {
        showSection('basic');
        basicForm.login.value = popupState.basic && popupState.basic.login
            || popupState.temp && popupState.temp.basic && popupState.temp.basic.login || '';
        basicForm.password.value = popupState.basic && popupState.basic.password
            || popupState.temp && popupState.temp.basic && popupState.temp.basic.password || '';
        return;
    }

    if (gresman.stage && gresman.stage === 'STEP1') {
        showSection('step1');
        return
    }

    if (gresman.stage && gresman.stage === 'SECURE') {
        showSection('secure');
        secureForm.login.value = popupState.secure && popupState.secure.login
            || popupState.temp && popupState.temp.secure && popupState.temp.secure.login || '';
        secureForm.password.value = popupState.secure && popupState.secure.password
            || popupState.temp && popupState.temp.secure && popupState.temp.secure.password || '';
        return;
    }

    if (gresman.stage && gresman.stage === 'STEP2') {
        showSection('step2');
        return
    }

    showSection('logtime');
    setLogTime(popupState);
});

browser.storage.onChanged.addListener((storage) => {
    if (storage.gresman && storage.gresman.newValue) {
        popupState = storage.gresman.newValue;
        switch (popupState.stage) {
            case 'INIT':
                showSection('init');
                break;
            case 'BASIC':
                showSection('basic');
                break;
            case 'STEP1':
                showSection('step1');
                break;
            case 'SECURE':
                showSection('secure');
                break;
            case 'STEP2':
                showSection('step2');
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
            case 'ERROR_ISSUES':
                showInfo(popupState.stage.toLowerCase(), ' ');
                showError(popupState.stage.toLowerCase(), messages.error.request);
                break;
            case 'REQUEST':
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), messages.info.request);
                break;
            case 'LOGIN':
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), messages.info.login);
                break;
            case 'CAPTCHA':
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), messages.info.captcha);
                break;
            case 'LOGGED_ERROR':
                showError(popupState.stage.toLowerCase(), messages.error.logged);
                showInfo(popupState.stage.toLowerCase(), ' ');
                break;
            case 'LOGGED':
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), messages.info.logged);
                popupLogged.style.display = 'flex';
                break;
            case 'ISSUES':
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), messages.info.getIssues);
                break;
            default:
                showError(popupState.stage.toLowerCase(), ' ');
                showInfo(popupState.stage.toLowerCase(), ' ');
        }
    }
});

function setLogTime(data) {
    const {issues, logtime} = data;

    if (issues && issues.length) {
        issueSelect.innerHTML = issues.map(issue =>
            `<option value="${issue.id}" ${(logtime && logtime.issue === issue.id || popupState.options && popupState.options.issue && popupState.options.issue.id === issue.id ) && 'selected'}>${issue.name}</option>`
        ).join('');
    }

    logtimeForm.date.value = popupState.temp && popupState.temp.logtime && popupState.temp.logtime.date || new Date().toJSON().split('T')[0];

    logtimeForm.comment.value = popupState.temp && popupState.temp.logtime && popupState.temp.logtime.comment || '';
    logtimeForm.worked.value = popupState.temp && popupState.temp.logtime && popupState.temp.logtime.worked || '';
    logtimeForm.billable.value = popupState.temp && popupState.temp.logtime && popupState.temp.logtime.billable || '';
}

function showSection(name) {
    sections.forEach(section => {
        section.style.display = section.id === name ? 'block' : 'none';
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
