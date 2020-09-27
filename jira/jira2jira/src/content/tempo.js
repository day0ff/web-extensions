import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

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

function initForm(container) {
    const tempoReportContainer = container.querySelector('.tempo-report-container');
    const footerCells = [...tempoReportContainer.querySelectorAll('div[name^="footerCell"]')];
    const dayCells = [...tempoReportContainer.querySelectorAll('div.day-cell-has-content.depth-1[name^="cell_"]')];

    dayCells.forEach(cell => {
        cell.querySelector('.public_fixedDataTableCell_cellContent').textContent = 'Report ' + cell.textContent.trim();
        cell.classList.add('j2j-day-report');
    });

    footerCells.forEach(cell => {
        if (cell.textContent.trim() !== '0') {
            const date = cell.getAttribute('name').replace('footerCell_', '');

            cell.textContent = 'Report ' + cell.textContent.trim();
            cell.classList.add('j2j-all-day-report');
            cell.addEventListener('click', () => {
                reportAllDay(date, tempoReportContainer);
            });
        }
    });
}

function reportAllDay(date, container) {
    const issues = [...container.querySelectorAll(`div[name$="${date}"]`)]
        .filter(element => element.classList.contains('day-cell-has-content') && element.classList.contains('depth-1'));
    const reports = issues.map(issue => {
        const name = issue.getAttribute('name').replace('cell_', '').replace(`_${date}`, '');
        const link = container.querySelector(`a[title="${name}"]`).href;
        const time = issue.textContent.replace('Report ', '');

        return ({name, link, date, time});
    });

    reports.forEach(({name, link, date, time}) => console.log(name, time, date, link));
    browser.runtime.sendMessage({tempo: {message: 'reports', reports}}, (response) => {
        if (response && response.background)
            console.log(response.background.response);
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

    button.textContent = 'Report';
    button.classList.add('j2j-button');
    toolbar.appendChild(button);
    button.addEventListener('click', () => {
        console.log(name, time, date, link);
        browser.runtime.sendMessage({tempo: {message: 'report', report:{name, time, date, link}}}, (response) => {
            if (response && response.background)
                console.log(response.background.response);
        });
    })
}

function getWorkTime(workTime){
    let trimWorkTime = workTime.replace(/\s/g, '');
    let hour = 0;
    let min = 0;

    if(/h/g.test(trimWorkTime)){
        hour = +trimWorkTime.split(/h/)[0];
        trimWorkTime = trimWorkTime.split(/h/)[1];
    }
    if(/m/g.test(trimWorkTime)){
        min = +trimWorkTime.split(/m/)[0];
    }
    return {hour, min};
}

function getBillableWorkTime(workTime){
    const {hour, min} = getWorkTime(workTime);

    return hour + +(min / 60).toFixed(2);
}
