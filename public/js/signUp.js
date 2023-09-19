import axios from 'axios';
import { showAlert } from './alerts';

export const signUp = async (name, email, password, confirmPassword) => {
    try {
        const newUser = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/user/signUp',
            data: {
                name,
                email,
                role: 'user',
                photo: 'default.jpg',
                password,
                confirmPassword,
            },
        });
        console.log('Response:', newUser);
        if (newUser.data.status === 'Success') {
            showAlert('success', 'Mail is send to ur Inbox');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
