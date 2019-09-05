import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

browser.storage.local.get('isMobile', (data) => {
    if (data && data.isMobile) {
        const script = document.createElement('script');

        script.textContent = `(function(){
navigator.__defineGetter__("userAgent", function () {return "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1"});
})()`;

        document.documentElement.appendChild(script);
        document.onload = () => script.remove();
    }
});
