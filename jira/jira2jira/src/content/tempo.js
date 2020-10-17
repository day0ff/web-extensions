import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

const tempoState = {
    popup: initPopup(),
};
const messages = {
    complete: 'Request successfully. ',
    error: 'Request failed. '
};
const init = isInit();

const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        mutation.type === 'childList' && mutation.target.classList.contains('tempo-p2-report-container')
        && init() && initForm(mutation.target);
        mutation.type === 'childList' && !!mutation.target.querySelector('.tempo-inline-dialog')
        && initDialog(mutation.target);
    }
});

observer.observe(document.body, {
    attributes: false,
    childList: true,
    subtree: true
});

browser.runtime.onMessage.addListener(
    (request) => {
        if (request.background && request.background.message === 'report') {
            tempoState.popup.message.textContent = messages[request.background.status];
        }
        if (request.background && request.background.message === 'reports') {
            tempoState.popup.message.textContent = messages[request.background.status];
        }
    }
);

function initForm(container) {
    const tempoReportContainer = container.querySelector('.tempo-report-container');
    const footerCells = [...tempoReportContainer.querySelectorAll('div[name^="footerCell"]')];
    const dayCells = [...tempoReportContainer.querySelectorAll('div.day-cell-has-content.depth-1[name^="cell_"]')];

    dayCells.forEach(cell => {
        const elem = cell.querySelector('.public_fixedDataTableCell_cellContent');

        elem.textContent = 'j2j Report ' + cell.textContent.trim();
        elem.classList.add('j2j-day-report');
    });

    footerCells.forEach(cell => {
        if (cell.textContent.trim() !== '0') {
            const date = cell.getAttribute('name').replace('footerCell_', '');

            cell.textContent = 'j2j Report ' + cell.textContent.trim();
            cell.classList.add('j2j-all-day-report');

            const cellListener = () => {
                cell.classList.add('j2j-button-progress');
                cell.removeEventListener('click', cellListener);
                reportAllDay(date, tempoReportContainer, cell);
            };

            cell.addEventListener('click', cellListener);
        }
    });
}

function reportAllDay(date, container, cell) {
    const issues = [...container.querySelectorAll(`div[name$="${date}"]`)]
        .filter(element => element.classList.contains('day-cell-has-content') && element.classList.contains('depth-1'));
    const reports = issues.map(issue => {
        const name = issue.getAttribute('name').replace('cell_', '').replace(`_${date}`, '');
        const link = container.querySelector(`a[title="${name}"]`).href;
        const time = issue.textContent.replace('j2j Report ', '');

        return ({name, link, date, time});
    });

    // reports.forEach(({name, link, date, time}) => console.log(name, time, date, link));
    browser.runtime.sendMessage({tempo: {message: 'reports', reports}}, (response) => {
        if (response && response.background){
            tempoState.popup.container.style.display = 'flex';
        }
    });

}

function initDialog(dialog) {
    const toolbar = dialog.querySelector('.btn-toolbar .pull-right');
    const button = document.createElement('button');
    const dateString = dialog.querySelector('.tempo-issue-table-td-date').textContent.trim();
    const timeString = dialog.querySelector('.tempo-issue-table-td-worked').textContent.trim();
    const name = dialog.querySelector('.tempo-issue-table-td-issue').textContent.trim();
    const date = new Date(`${dateString} 00:00:00 GMT+0000`).toISOString().split('T')[0];
    const link = 'https://jira.bpcbt.com/browse/' + name;
    const time = getBillableWorkTime(timeString);
    const closeButton = [...toolbar.querySelectorAll('button')].filter(button => button.textContent.trim() === 'Close').pop();

    button.textContent = 'j2j Report';
    button.classList.add('j2j-button');
    toolbar.prepend(button);
    button.addEventListener('click', () => {
        browser.runtime.sendMessage({tempo: {message: 'report', report: {name, time, date, link}}}, (response) => {
            if (response && response.background) {
                closeButton.click();
                tempoState.popup.container.style.display = 'flex';
            }
        });
    })
}

function initPopup() {
    const popupContainer = document.createElement('div');
    const popupBox = document.createElement('div');
    const popupMessage = document.createElement('span');
    const popupCloseButton = document.createElement('button');

    popupContainer.id = 'j2j-popup-container';
    popupContainer.classList.add('j2j-popup-container');
    popupBox.classList.add('j2j-popup-box');
    popupMessage.textContent = 'Pending...';
    popupMessage.id = 'j2j-popup-message';
    popupMessage.classList.add('j2j-popup-message');
    popupCloseButton.textContent = 'Close';
    popupCloseButton.id = 'j2j-popup-button';
    popupCloseButton.classList.add('j2j-popup-button');
    popupCloseButton.addEventListener('click', () => {
        popupContainer.style.display = 'none';
    });

    popupBox.appendChild(popupMessage);
    popupBox.appendChild(popupCloseButton);
    popupContainer.appendChild(popupBox);
    document.body.appendChild(popupContainer);

    return ({
        container: document.getElementById('j2j-popup-container'),
        message: document.getElementById('j2j-popup-message'),
        button: document.getElementById('j2j-popup-button'),
    });
}

function getWorkTime(workTime) {
    let trimWorkTime = workTime.replace(/\s/g, '');
    let hour = 0;
    let min = 0;

    if (/h/g.test(trimWorkTime)) {
        hour = +trimWorkTime.split(/h/)[0];
        trimWorkTime = trimWorkTime.split(/h/)[1];
    }
    if (/m/g.test(trimWorkTime)) {
        min = +trimWorkTime.split(/m/)[0];
    }
    return {hour, min};
}

function getBillableWorkTime(workTime) {
    const {hour, min} = getWorkTime(workTime);

    return hour + +(min / 60).toFixed(2);
}

function isInit() {
    let init = true;

    return () => {
        if (init) {
            init = false;
            return true;
        }
        return false;
    }
}
