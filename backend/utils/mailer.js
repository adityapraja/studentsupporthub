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
    from: `"Student Support Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Student Support Hub - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Student Support Hub</h2>
        <p>Your OTP for login is:</p>
        <h1 style="text-align: center; color: #3498db; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const sendGrievanceNotification = async ({ grievance, attachments = [] }) => {
  const authorityEmail = process.env.AUTHORITY_EMAIL || 'studentsupporthubproject@gmail.com';
  const formattedDescription = escapeHtml(grievance.description || '').replace(/\n/g, '<br/>');

  const mailOptions = {
    from: `"Student Support Hub" <${process.env.EMAIL_USER}>`,
    to: authorityEmail,
    subject: `[New Grievance] ${grievance.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px; background: #ffffff;">
        <h2 style="margin: 0 0 16px 0; color: #111827;">New Grievance Submitted</h2>
        <p style="margin: 0 0 18px 0; color: #4b5563;">A new grievance has been submitted in Student Support Hub.</p>

        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Grievance Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; width: 180px; background: #f9fafb; border: 1px solid #e5e7eb;">Grievance ID</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(grievance.id || 'N/A')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb;">Title</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(grievance.title || 'N/A')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb;">Category</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(grievance.category || 'N/A')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb;">Priority</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(grievance.priority || 'N/A')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb;">Status</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(grievance.status || 'N/A')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb;">Submitted At</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(grievance.createdAt || 'N/A')}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb; vertical-align: top;">Description</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formattedDescription || 'N/A'}</td></tr>
        </table>

        <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
          Attachment: ${attachments.length > 0 ? 'Included with this email' : 'No file attached'}<br/>
          Please log in to Student Support Hub to review and respond.
        </p>
      </div>
    `,
    attachments
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendGrievanceNotification };
