const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail({ to, otp, purpose }) {
  const subject =
    purpose === "verify-email"
      ? "Verify your PowerAlert Nepal account"
      : "Reset your PowerAlert Nepal password";

  const heading =
    purpose === "verify-email"
      ? "Confirm your email address"
      : "Reset your password";

  await transporter.sendMail({
    from: `"PowerAlert Nepal" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>${heading}</h2>
        <p>Your one-time code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };