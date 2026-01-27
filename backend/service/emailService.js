const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, message) => {
  await transporter.sendMail({
    from: `"Property Market" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<p>${message}</p>`
  });
};
// service/emailService.js
const sendPaymentSuccessEmail = async (email, data) => {
  try {
    // Your email sending logic here
    console.log(`Sending success email to ${email}`);
    // ... actual email code
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

const sendPaymentFailedEmail = async (email, data) => {
  try {
    // Your email sending logic here
    console.log(`Sending failure email to ${email}`);
    // ... actual email code
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// ✅ MAKE SURE THESE ARE EXPORTED
module.exports = {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail
};

module.exports = {sendEmail, sendPaymentSuccessEmail, sendPaymentFailedEmail};
