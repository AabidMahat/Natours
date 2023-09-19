import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51NqQY3SC1xT7FHPGmhEWH8fmPQGl8kPBMbeKEUn8Uphul2sCF3sRfBfOcZsqvpSKFzHFY1BbhRovMm34UMWoIdaP00OIvTEJFG'
);
// https://buy.stripe.com/test_3cs9EDfTzf5b86c8wy
export const bookTour = async (tourId) => {
    try {
        //1) get the session from the server
        const session = await axios({
            method: 'GET',
            url: `http://127.0.0.1:3000/api/v1/bookings/checkIn/${tourId}`,
        });
        console.log(session);

        //2) Create the checkout form + charge the credit card
        console.log(session.data.session.id);
        const newData = await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
        console.log(newData);
    } catch (err) {
        console.log(err);
        showAlert('error', err.response.data.message);
    }
};
