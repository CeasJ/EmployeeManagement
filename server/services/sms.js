const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: process.env.SMS_API_KEY,
  apiSecret: process.env.SMS_API_SECRET
})

module.exports = {
  sendSMS: async (to, text) => {
    try {
      const formattedNumber = to.startsWith('+') ? to : `+${to}`;
      console.log(`Attempting to send SMS to ${formattedNumber} with message: ${text}`);

      const response = await vonage.sms.send({
        to: formattedNumber,
        from: process.env.SMS_PHONE_NUMBER,
        text,
      });

      console.log('Vonage response:', JSON.stringify(response, null, 2));
      
      if (response.messages[0].status !== '0') {
        throw new Error(`Vonage error: Status ${response.messages[0].status} - ${response.messages[0]['error-text'] || 'Unknown error'}`);
      }

      return response;
    } catch (error) {
      console.error(`Failed to send SMS to ${to}:`, error.message);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  },
};