const nodemailer = require("nodemailer");

const hasEmailCredentials =
  Boolean(process.env.EMAIL_USER) && Boolean(process.env.EMAIL_PASS);

const transporter = hasEmailCredentials
  ? nodemailer.createTransport(
      process.env.EMAIL_HOST
        ? {
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 587),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          }
        : {
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          },
    )
  : null;

const isEmailConfigured = () => hasEmailCredentials;

const sendResponseEmail = async (feedback, response, sectorManagerName) => {
  if (!feedback?.visitorEmail) {
    return { sent: false, reason: "missing_visitor_email" };
  }

  if (!transporter) {
    return { sent: false, reason: "email_not_configured" };
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0B2A4A; color: white; padding: 20px; text-align: center; }
        .feedback-box { background: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .response-box { background: #ecfdf5; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>MINT Navigator</h2>
          <p>Ministry of Innovation & Technology</p>
        </div>
        <div class="feedback-box">
          <h3>Your Feedback (${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)})</h3>
          <p>"${feedback.comment || "No comment"}"</p>
        </div>
        <div class="response-box">
          <h3>Response from ${sectorManagerName}</h3>
          <p>${response}</p>
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
      subject: `Response to your feedback - MINT Navigator`,
      html: emailHtml,
    });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: "send_failed",
      error: error.message,
    };
  }
};

module.exports = { sendResponseEmail, isEmailConfigured };
