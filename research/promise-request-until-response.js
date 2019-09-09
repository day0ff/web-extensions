console.log('Tick');

const timer = setInterval(() => {
    console.log('Tick');
}, 100);

const waitFor = (ms, num) =>
    new Promise(resolve => setTimeout(() => {
        console.log('counter =', num);
        resolve(num);
    }, ms));

const tryUntilResponse = (count, max) =>
    waitFor(300, ++count)
        .then(response => {
            if (response >= max) return response;
            else return tryUntilResponse(response, max);
        });

tryUntilResponse(5, 11)
    .then(response => {
        console.log('count =', response);
        clearInterval(timer);
    });
