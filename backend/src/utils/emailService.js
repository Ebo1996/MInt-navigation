const nodemailer = require("nodemailer");

// Lazy transporter — created on first use so dotenv is always loaded first
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  _transporter = nodemailer.createTransport(
    process.env.EMAIL_HOST
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT || 587),
          secure: process.env.EMAIL_SECURE === "true",
          auth: { user, pass },
        }
      : {
          service: "gmail",
          auth: { user, pass },
        }
  );

  return _transporter;
};

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_USER) && Boolean(process.env.EMAIL_PASS);

const sendResponseEmail = async (feedback, response, sectorManagerName) => {
  if (!feedback?.visitorEmail) {
    return { sent: false, reason: "missing_visitor_email" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: "email_not_configured" };
  }

  const stars = "★".repeat(Math.max(0, Math.min(5, feedback.rating || 0)));
  const empty = "☆".repeat(5 - Math.max(0, Math.min(5, feedback.rating || 0)));

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin:0; padding:0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #086976; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .feedback-box { background: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
        .response-box { background: #ecfdf5; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 4px; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0">MINT Navigator</h2>
          <p style="margin:4px 0 0">Ministry of Innovation &amp; Technology</p>
        </div>
        <div class="feedback-box">
          <h3 style="margin-top:0">Your Feedback (${stars}${empty})</h3>
          <p>"${(feedback.comment || "No comment").replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</p>
        </div>
        <div class="response-box">
          <h3 style="margin-top:0">Response from ${sectorManagerName.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h3>
          <p>${response.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
        <div class="footer">
          <p>Thank you for helping us improve our services.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"MINT Navigator" <${process.env.EMAIL_USER}>`,
      to: feedback.visitorEmail,
      subject: "Response to your feedback - MINT Navigator",
      html: emailHtml,
    });
    return { sent: true };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { sent: false, reason: "send_failed", error: error.message };
  }
};

/**
 * Verify the SMTP connection — call once at startup to detect config problems early.
 */
const verifyEmailConnection = async () => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("📧 Email: not configured (EMAIL_USER / EMAIL_PASS missing)");
    return false;
  }
  try {
    await transporter.verify();
    console.log("✅ Email: SMTP connection verified");
    return true;
  } catch (err) {
    console.error("❌ Email: SMTP verify failed —", err.message);
    _transporter = null; // reset so next call retries
    return false;
  }
};

module.exports = { sendResponseEmail, isEmailConfigured, verifyEmailConnection };
