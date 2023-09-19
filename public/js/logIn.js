/* eslint-disable */
// const axios = require('axios');

// console.log(axios);
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    // console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/user/logIn',
            data: {
                email,
                password,
            },
        });
        console.log('Response:', res);
        if (res.data.status === 200) {
            showAlert('success', 'Logged In successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
        // console.log(res);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/user/logOut',
        });
        console.log(res.data);
        if (res.data.status === 'Success') {
            location.reload(true);
        }
    } catch (err) {
        console.log(err.response);
        showAlert('error', 'Error While Logging Out');
    }
};
