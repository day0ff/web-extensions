import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const DIALOG_MODAL_WINDOW_SELECTOR = 'div[role="dialog"]';
const MAIN_SELECTOR = 'main div';
const COMMENTS_CONTAINER_SELECTOR = 'article div div ul';
const COMMENTS_SELECTOR = 'article div div ul ul li[role="menuitem"]';
const LOAD_MORE_COMMENTS_SELECTOR = 'span[aria-label="Load more comments"]';

const WINNER_GENERATOR_SECTION_SELECTOR = '#winner-generator';
const WINNER_GENERATOR_CONTAINER_SELECTOR = '#winner-generator p';

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
    const section = document.querySelector(WINNER_GENERATOR_SECTION_SELECTOR);
    section && section.remove();
}

function drawingStage() {
    initialStage();

    const dialog = !!document.querySelector(DIALOG_MODAL_WINDOW_SELECTOR);

    if (dialog) {
        document.location.reload(true);
        return;
    }

    const main = document.querySelector(MAIN_SELECTOR);
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

    const buttonWrapper = document.createElement('div');

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
    buttonWrapper.appendChild(cancelButton);
    buttonWrapper.appendChild(getWinnerButton);
    p.appendChild(buttonWrapper);
    section.id = 'winner-generator';
    section.appendChild(p);
    main.insertBefore(section, main.firstChild);
}

async function getWinner() {
    const buttonGetWinner = document.getElementById('get-winner');
    const buttonCancel = document.getElementById('cancel');

    buttonGetWinner && buttonGetWinner.remove();
    buttonCancel && buttonCancel.remove();

    const container = document.querySelector(WINNER_GENERATOR_CONTAINER_SELECTOR);
    const winnerElement = container.querySelector('span');

    winnerElement.innerHTML = 'Pending...';

    await loadMoreComments(0);

    const notes = Array.from(document.querySelectorAll(COMMENTS_SELECTOR));
    const comments = notes.map(note => {
        const name = note.querySelector('h3 a');
        const img = note.querySelector('img');
        const comment = note.querySelector('span');
        return [name && name.href, {name, img, comment}];
    });
    const commentsMap = new Map(comments);
    const shuffleArray = shuffle(Array.from(commentsMap));

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

}

async function loadMoreComments(count) {
    const moreComments = document.querySelector(LOAD_MORE_COMMENTS_SELECTOR);
    if (moreComments) {
        const notePad = document.querySelector(COMMENTS_CONTAINER_SELECTOR);
        const config = {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true
        };
        moreComments.click();
        await new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(), 1000);
            const observer = new MutationObserver(
                () => {
                    clearTimeout(timeout);
                    observer.disconnect();
                    resolve();
                }
            );
            observer.observe(notePad, config);
        });
        return loadMoreComments(++count);
    } else {
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
