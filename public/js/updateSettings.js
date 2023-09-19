//Update the form Data

import axios from 'axios';
import { showAlert } from './alerts';

//type is either password or data
// data is the object
export const updateUserData = async (data) => {
    try {
        const update = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/user/updateMe',
            data,
        });
        console.log('Response:', update);

        if (update.data.status === 'success') {
            showAlert('success', `Data Updated Successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
export const updateUserPassword = async (
    passwordCurrent,
    password,
    confirmPassword
) => {
    try {
        const update = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/user/updatePassword',
            data: {
                passwordCurrent,
                password,
                confirmPassword,
            },
        });
        console.log('Response:', update);

        if (update.data.status === 200) {
            showAlert('success', `Password Updated Successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
