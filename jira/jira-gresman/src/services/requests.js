import { Base64 } from 'js-base64';

const basicRequest = ({login, password}) => {
    const headers = new Headers();

    headers.append('Authorization', `Basic ${Base64.encode(login + ':' + password)}`);

    const requestOptions = {
        method: 'GET',
        headers
    };

    return fetch('https://helpdesk.senlainc.com', requestOptions);
};

const secureRequest = ({basic, secure}) => {
    const headers = new Headers();

    headers.append('Authorization', `Basic ${Base64.encode(basic.login + ':' + basic.password)}`);
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    let formData = new FormData();

    formData.append('os_username', secure.login);
    formData.append('os_password', secure.password);

    const requestOptions = {
        method: 'POST',
        body: formData,
        headers
    };

    return fetch('https://helpdesk.senlainc.com/login.jsp', requestOptions);
};

const logRequest = ({basic}) => {
    const headers = new Headers();

    headers.append('Authorization', `Basic ${Base64.encode(basic.login + ':' + basic.password)}`);
    headers.append('Content-Type', 'application/json');

    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({
            attributes: {
                _Billable_: {
                    name: 'Billable',
                    workAttributeId: 6,
                    value: '4'
                }
            },
            billableSeconds: '',
            comment: 'https://jira.bpcbt.com/browse/B_SVMPL-1936',
            endDate: null,
            includeNonWorkingDays: false,
            originTaskId: '13240',
            remainingEstimate: null,
            started: '2020-09-11',
            timeSpentSeconds: 14400,
            worker: 'dzianis_viarshadau',
        }),
        headers
    };

    return fetch('https://helpdesk.senlainc.com/rest/tempo-timesheets/4/worklogs/', requestOptions);
};

export { basicRequest, secureRequest, logRequest };
