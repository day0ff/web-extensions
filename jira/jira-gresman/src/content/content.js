const observer = new MutationObserver((mutationsList)=> {
    for (let mutation of mutationsList) {
       mutation.type === 'childList' && mutation.target.id === 'worklogForm' && initForm(mutation.target);
    }
});

observer.observe(document.body, {
    attributes: false,
    childList: true,
    subtree: true
});

function initForm(form) {
    const event = document.createEvent("HTMLEvents");
    const _Billable_ = form.querySelector('#_Billable_');
    const _Overtime_ = form.querySelector('#_Overtime_');

    event.initEvent("change", false, true);

    form.addEventListener('change', ({target})=> setTimeout(() => {
        if(target.id === 'timeSpentSeconds') {
            _Billable_.value = getBillableWorkTime(target.value);
            _Overtime_.value = getOvertime(target.value);
        }
    }, 0));
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

function getOvertime(workTime){
    const overtime = getBillableWorkTime(workTime) - 8;

    return overtime > 0 ? overtime : '';
}
