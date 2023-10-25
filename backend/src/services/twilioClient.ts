import twilio from "twilio";
import TwilioClient from 'twilio/lib/rest/Twilio';

let twilioClient: TwilioClient;
try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
} catch (err) {
    // do nothing
}

export {twilioClient};
