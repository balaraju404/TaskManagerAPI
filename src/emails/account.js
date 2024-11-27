import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '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');

const sendOTPtoMail = (email, otp) => {
    const msg = {
        to: email,
        from: 'gandhambalaraju18@gmail.com',
        subject: 'OTP for myapp.com',
        text: `Your OTP is ${otp}`,
        html: `<p>Your OTP is ${otp}</p>`
    };
    sgMail.send(msg);
}

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gandhambalaraju18@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gandhambalaraju18@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    })
}

export {
    sendOTPtoMail,
    sendWelcomeMail,
    sendCancelationMail
}
