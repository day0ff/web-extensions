import { BrowserApiWrapper } from '../api/browser-api-wrapper.js';
import { updateStorage } from '../storage/storage';

const browser = new BrowserApiWrapper().browser;

const loginFormSecure = document.querySelector('#login-form');

if (loginFormSecure) {
    browser.storage.local.get('gresman', ({gresman}) => {
        if (gresman && gresman.secure) {
            const messageError = document.querySelector('.aui-message.error');
            const captchaImage = document.querySelector('.captcha-image');
            const loginFormSecureUsername = loginFormSecure.querySelector('#login-form-username');
            const loginFormSecurePassword = loginFormSecure.querySelector('#login-form-password');

            loginFormSecureUsername.value = gresman.secure && gresman.secure.login || '';
            loginFormSecurePassword.value = gresman.secure && gresman.secure.password || '';

            if (gresman && gresman.status && gresman.status === 'LOGIN') {
                if (loginFormSecure && !messageError) {
                    const loginFormSecureButton = loginFormSecure.querySelector('#login-form-submit');

                    loginFormSecureUsername.value = gresman.secure && gresman.secure.login || '';
                    loginFormSecurePassword.value = gresman.secure && gresman.secure.password || '';
                    loginFormSecureButton.click();

                    updateStorage({status: 'ISSUES'});

                    setTimeout(() => {
                        updateStorage({status: 'ERROR'});
                    }, 5000);
                } else if (captchaImage) {
                    updateStorage({status: 'CAPTCHA'});
                } else {
                    updateStorage({status: 'ERROR'});
                }
            }
        }
    });
}

