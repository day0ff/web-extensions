import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

const STAGE = {
    initial: initialStage,
    drawing: drawingStage,
    'get-winner': initialStage,
    complete: initialStage,
};

const start = document.getElementById('start');
const cancel = document.getElementById('cancel');
const getWinner = document.getElementById('get-winner');

start.addEventListener('click', () => {
    browser.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs[0].url.includes('instagram')) {
            browser.storage.local.set({iwg: {stage: 'drawing'}});
            window.close();
        }
    });
});

getWinner.addEventListener('click', () => {
    browser.storage.local.set({iwg: {stage: 'get-winner'}});
    window.close();
});

cancel.addEventListener('click', () => {
    browser.storage.local.set({iwg: {stage: 'initial'}});
    window.close();
});

browser.storage.local.get('iwg', data => {
    if (data.iwg && data.iwg.stage) {
        STAGE[data.iwg.stage]();
    }
});

browser.storage.onChanged.addListener((changes) => {
    if (changes.iwg && changes.iwg.newValue)
        STAGE[changes.iwg.newValue.stage]();
});

function initialStage() {
    start.style.display = 'inline-block';
    getWinner.style.display = 'none';
    cancel.style.display = 'none';
}

function drawingStage() {
    start.style.display = 'none';
    getWinner.style.display = 'inline-block';
    cancel.style.display = 'inline-block';
}
