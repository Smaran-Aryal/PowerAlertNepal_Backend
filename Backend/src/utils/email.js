const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail({ to, otp, purpose }) {
  const subject =
    purpose === "verify-email"
      ? "Verify your PowerAlert Nepal account"
      : "Reset your PowerAlert Nepal password";

  const heading =
    purpose === "verify-email"
      ? "Confirm your email address"
      : "Reset your password";

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
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