const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: 'https://d5dvv106cbcx.kintone.com',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Updated endpoint: accept array or single object, send all in parallel
app.post("/send-email", async (req, res) => {
  const emails = Array.isArray(req.body) ? req.body : [req.body];

  // Validate all emails
  for (const email of emails) {
    if (!email.to || !email.subject || !email.text) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  }

  try {
    await Promise.all(emails.map(email =>
      transporter.sendMail({
        from: '"Kintone App" <anhnp2805@gmail.com>',
        to: email.to,
        subject: email.subject,
        text: email.text
      })
    ));
    res.json({ message: "All emails sent successfully" });
  } catch (error) {
    console.error("❌ Email send failed:", error);
    res.status(500).json({ error: "Failed to send one or more emails" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📧 Email server running on http://localhost:${PORT}`);
});