import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

const STAGE = {
    initial: initialStage,
    drawing: drawingStage,
    'get-winner': getWinner,
    complete: completeStage
};

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
    const section = document.querySelector('#winner-generator');
    section && section.remove();
}

function drawingStage() {
    const dialog = !!document.querySelector('div[role="dialog"]');

    if (dialog) {
        document.location.reload(true);
        return;
    }

    const main = document.querySelector('main div');
    const section = document.createElement('section');

    const marginSides = window.getComputedStyle(main.firstChild).getPropertyValue('margin-left');
    section.style.margin = '30px ' + marginSides;

    const p = document.createElement('p');
    const span = document.createElement('span');

    span.textContent = 'Press \'Get Winner\' button.';

    const img = document.createElement('img');

    img.src = browser.extension.getURL('icons/icon-48.png');
    img.alt = 'GIFT';
    img.title = 'GIFT';
    img.width = 48;
    img.height = 48;

    const getWinnerButton = document.createElement('button');

    getWinnerButton.id = 'get-winner';
    getWinnerButton.textContent = 'Get Winner';
    getWinnerButton.onclick = () => {
        browser.storage.local.set({iwg: {stage: 'get-winner'}});
    };

    const cancelButton = document.createElement('button');

    cancelButton.id = 'cancel';
    cancelButton.textContent = 'Cancel Drawing';
    cancelButton.onclick = () => {
        browser.storage.local.set({iwg: {stage: 'initial'}});
    };

    p.appendChild(img);
    p.appendChild(span);
    p.appendChild(cancelButton);
    p.appendChild(getWinnerButton);
    section.id = 'winner-generator';
    section.appendChild(p);
    main.insertBefore(section, main.firstChild);
}

async function getWinner() {
    const buttonGetWinner = document.getElementById('get-winner');
    const buttonCancel = document.getElementById('cancel');

    buttonGetWinner && buttonGetWinner.remove();
    buttonCancel && buttonCancel.remove();

    await loadMoreComments(0);

    console.log('AFTER');

    const notes = Array.from(document.querySelectorAll('article div div ul ul li[role="menuitem"]'));
    const comments = notes.map(note => {
        const name = note.querySelector('h3 a');
        const img = note.querySelector('img');
        const comment = note.querySelector('span');
        return [name.href, {name, img, comment}];
    });
    const commentsMap = new Map(comments);
    const shuffleArray = shuffle(Array.from(commentsMap));

    console.log(shuffleArray);

    const container = document.querySelector('#winner-generator p');
    const winnerElement = container.querySelector('span');

    winnerElement.innerHTML = 'Winner is: ';

    const winner = getWinnerFromArray(shuffleArray);
    const span = document.createElement('span');

    winner[1].img.classList.add('picture');
    winner[1].comment.classList.add('comment');

    span.appendChild(winner[1].name);
    container.appendChild(winner[1].img);
    container.appendChild(span);
    container.appendChild(winner[1].comment);

    browser.storage.local.set({iwg: {stage: 'complete'}});
}

function completeStage() {
    console.log('Complete!');
}

async function loadMoreComments(count) {
    console.log('loadMoreComments', count);
    const moreComments = document.querySelector('span[aria-label="Load more comments"]');
    if (moreComments) {
        moreComments.click();
        await new Promise((resolve) => {
            let hasChanged = false;
            const timeout = setTimeout(() => {
                console.log('timeout', hasChanged);
                if (!hasChanged) resolve();
            }, 5000);
            const notePad = document.querySelector('article div div ul');
            const config = {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true
            };
            const observer = new MutationObserver(
                (mutationsList) => {
                    const mutationsLength = mutationsList.length;
                    console.log('Mutation length', mutationsLength);
                    hasChanged = true;
                    clearTimeout(timeout);
                    observer.disconnect();
                    resolve();
                }
            );
            observer.observe(notePad, config);
        });
        return loadMoreComments(++count);
    } else {
        console.log('loadMoreComments', 'DONE');
        return Promise.resolve(count);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getWinnerFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
