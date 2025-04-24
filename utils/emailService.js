const nodemailer = require('nodemailer');

// تنظیمات ایمیل (برای توسعه - در تولید از سرویس واقعی استفاده کنید)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email', // سرویس تستی
  port: 587,
  auth: {
    user: 'your-ethereal-email@example.com',
    pass: 'your-ethereal-password'
  }
});

// تابع ارسال ایمیل
exports.sendVerificationEmail = async (email, verificationCode) => {
  try {
    // در محیط توسعه، فقط کد را در کنسول نمایش می‌دهیم
    console.log(`\n=== ایمیل تستی ===`);
    console.log(`به: ${email}`);
    console.log(`کد تأیید: ${verificationCode}`);
    console.log(`================\n`);

    
    const mailOptions = {
      from: '"Auth Service" <auth@example.com>',
      to: email,
      subject: 'کد تأیید حساب کاربری',
      text: `کد تأیید شما: ${verificationCode}`,
      html: `<p>کد تأیید شما: <strong>${verificationCode}</strong></p>`
    };

    await transporter.sendMail(mailOptions);
    
    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};