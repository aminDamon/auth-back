const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <p>Please click the following link to verify your email address:</p>
        <a href="${process.env.BASE_URL}/api/auth/verify/${token}">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
};

module.exports = sendVerificationEmail;