const sgMail = require('@sendgrid/mail');

// Use environment variable only
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPtoMail = async (email, otp) => {
    try {
        const msg = {
            to: email,
            from: 'gandhambalaraju18@gmail.com',
            subject: 'OTP for myapp.com',
            text: `Your OTP is ${otp}`,
            html: `<p>Your OTP is ${otp}</p>`
        };
        await sgMail.send(msg);
        console.log(`OTP sent to ${email}`,otp);
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

const sendWelcomeMail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: 'gandhambalaraju18@gmail.com',
            subject: 'Thanks for joining in!',
            text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}

const sendCancelationMail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: 'gandhambalaraju18@gmail.com',
            subject: 'Sorry to see you go!',
            text: `Goodbye, ${name}. I hope to see you back sometime soon.`
        });
        console.log(`Cancellation email sent to ${email}`);
    } catch (error) {
        console.error('Error sending cancellation email:', error);
    }
}

module.exports = {
    sendOTPtoMail,
    sendWelcomeMail,
    sendCancelationMail
};
