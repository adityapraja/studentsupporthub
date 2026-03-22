const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Campus Connect - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Campus Connect</h2>
        <p>Your OTP for login is:</p>
        <h1 style="text-align: center; color: #3498db; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendGrievanceNotification = async (grievance) => {
  const mailOptions = {
    from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
    to: process.env.AUTHORITY_EMAIL,
    subject: `New Grievance: ${grievance.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50;">New Grievance Submitted</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Title:</td><td style="padding: 8px;">${grievance.title}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Category:</td><td style="padding: 8px;">${grievance.category}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Description:</td><td style="padding: 8px;">${grievance.description}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Status:</td><td style="padding: 8px;">${grievance.status}</td></tr>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">Please log in to Campus Connect to review and respond.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendGrievanceNotification };
