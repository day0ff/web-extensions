import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';
import { updateStorage } from '../storage/storage';

const browser = new BrowserApiWrapper().browser;

const issueTable = document.querySelector('table[class="issue-table"]');

browser.storage.local.get('gresman', ({gresman}) => {
    if (gresman && gresman.status && gresman.status === 'ISSUES') {
        if (issueTable) {
            const issueList = [...issueTable.querySelectorAll('tr[class="issuerow"]')];
            const issues = issueList.map(tr => ({id: tr.getAttribute('rel'), name: tr.dataset.issuekey}));

            updateStorage({issues, status: 'ISSUES'});
        } else {
            updateStorage({status: 'ERROR'});
        }
    }
});
