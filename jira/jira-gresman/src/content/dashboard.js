import { updateStorage } from '../storage/storage.js';

const issueTable = document.querySelector('table[class="issue-table"]');

if (issueTable) {
    const issueList = [...issueTable.querySelectorAll('tr[class="issuerow"]')];
    const issues = issueList.map(tr => ({id:tr.getAttribute('rel'), name:tr.dataset.issuekey}));

    updateStorage({issues, stage: 'ISSUES'}, () => console.log('Get a list of issues.'));
}
