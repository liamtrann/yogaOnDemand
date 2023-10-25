let sendGridClient;
try {
    sendGridClient = require('@sendgrid/mail')
    sendGridClient.setApiKey(process.env.SENDGRID_API_KEY);
} catch (err) {
    // do nothing
}

export {sendGridClient};