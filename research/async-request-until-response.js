console.log('Tick');

const timer = setInterval(() => {
    console.log('Tick');
}, 100);

const waitFor = (ms, num) =>
    new Promise(resolve => setTimeout(() => {
        console.log('counter =', num);
        resolve(num);
    }, ms));

const tryUntilResponse = async (count, max) => {
    const newCount = await waitFor(300, ++count);
    if (newCount >= max) return newCount;
    else return tryUntilResponse(newCount, max);
};

const run = async () => {
    const count = await tryUntilResponse(0, 5);
    console.log('count =', count);
    clearInterval(timer);
};

run();
