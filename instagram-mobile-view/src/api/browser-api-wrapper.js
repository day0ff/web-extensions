export class BrowserApiWrapper {
    get isFirefox() {
        return window.hasOwnProperty('browser');
    }

    get isChrome() {
        return window.hasOwnProperty('chrome');
    }

    get browser() {
        if (this.isFirefox) return browser;
        if (this.isChrome) return chrome;
        console.warn(`Environment is not defined.\n Browser :: ${navigator.userAgent}`);
        return browser;
    }
}
