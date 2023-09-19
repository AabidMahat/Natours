/* eslint-disable */
import '@babel/polyfill';

import { login } from './logIn';
import { logout } from './logIn';
import { signUp } from './signUp';
import { updateUserData } from './updateSettings';
import { updateUserPassword } from './updateSettings';

import { bookTour } from './stripe';
//reading values

//DOM element

const loginForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form--signUp');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateData = document.querySelector('.form-user-data');
const newPassword = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}
if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;
        signUp(name, email, password, confirmPassword);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
}
if (updateData) {
    updateData.addEventListener('submit', (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateUserData(form);
    });
}
if (newPassword) {
    newPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent =
            'Updating....';
        const passwordCurrent =
            document.getElementById('password-current').value;

        const password = document.getElementById('password').value;

        const confirmPassword =
            document.getElementById('password-confirm').value;

        await updateUserPassword(passwordCurrent, password, confirmPassword);

        //Clearing the fields
        document.querySelector('.btn--save-password').textContent =
            'Save Password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookBtn)
    bookBtn.addEventListener('click', (e) => {
        e.target.textContent = 'Processing....';
        const { tourId } = e.target.dataset;
        console.log(tourId);
        bookTour(tourId);
    });
