import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';

const browser = new BrowserApiWrapper().browser;

const loginFormSecure = document.querySelector('#login-form');

if (loginFormSecure) {
    const loginFormSecureUsername = loginFormSecure.querySelector('#login-form-username');
    const loginFormSecurePassword = loginFormSecure.querySelector('#login-form-password');
    const loginFormSecureButton = loginFormSecure.querySelector('#login-form-submit');

    browser.storage.local.get('gresman', ({gresman}) => {
        if(gresman && gresman.secure && gresman.secure.login && gresman.secure.password){
            loginFormSecureUsername.value = gresman.secure.login;
            loginFormSecurePassword.value = gresman.secure.password;
            loginFormSecureButton.click();
        }
    });
}



