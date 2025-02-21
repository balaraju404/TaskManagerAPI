import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
    console.error('Missing SENDGRID_API_KEY environment variable');
} else {
    sgMail.setApiKey(apiKey);
}

const sendOTPtoMail = (email, otp) => {
    console.log('Using SendGrid API Key:', apiKey ? 'Present' : 'Not Set');
    const msg = {
        to: email,
        from: 'gandhambalaraju18@gmail.com',
        subject: 'OTP for myapp.com',
        text: `Your OTP is ${otp}`,
        html: `<p>Your OTP is <strong>${otp}</strong></p>`
    };
    return sgMail.send(msg).catch(error => console.error('Error sending OTP email:', error));
}

const sendWelcomeMail = (email, name) => {
    return sgMail.send({
        to: email,
        from: 'gandhambalaraju18@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    }).catch(error => console.error('Error sending welcome email:', error));
}

const sendCancelationMail = (email, name) => {
    return sgMail.send({
        to: email,
        from: 'gandhambalaraju18@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    }).catch(error => console.error('Error sending cancellation email:', error));
}

export {
    sendOTPtoMail,
    sendWelcomeMail,
    sendCancelationMail
};
