import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this in production if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    student_name,
    email,
    seminar_name,
    seminar_date,
    hall_name,
    seat_number,
    ticket_id
  } = req.body;

  if (!email || !student_name || !ticket_id) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = process.env.EMAIL_PORT || 465; // SSL

  if (!emailUser || !emailPass) {
    console.error('Missing email configuration');
    return res.status(500).json({ success: false, error: 'Server email configuration missing' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: true, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket_id}`;
    const logoPath = path.join(process.cwd(), 'public', 'logo-full.png');
    const logoContent = fs.readFileSync(logoPath);

    const htmlContent = `
<div style="text-align:center; margin-bottom:20px;">
  <img src="cid:ssemslogo" alt="SSEMS Logo" width="120" />
</div>

<p>Dear ${student_name},</p>

<p>
Greetings from <b>Smart Seminar & Event Management System</b> 🎓
</p>

<p>
Your registration for the seminar
"<b>${seminar_name}</b>" has been successfully confirmed.
</p>

<p>
📅 <b>Date:</b> ${seminar_date}<br>
📍 <b>Venue:</b> ${hall_name}<br>
💺 <b>Seat No:</b> ${seat_number}<br>
🆔 <b>Ticket ID:</b> ${ticket_id}
</p>

<p><b>Show this QR code at the entry gate:</b></p>

<img
  src="${qr_code_url}"
  alt="Seminar Ticket QR"
  width="200"
  height="200"
/>

<p>
Please keep this email safe and present the QR code at the venue entrance.
</p>

<p>
We wish you a great learning experience!
</p>

<p>
Best Regards,<br>
<b>Smart Seminar & Event Management System</b><br>
📧 support@ssems.qzz.io
</p>
    `;

    const info = await transporter.sendMail({
      from: `"SSEMS Support" <${emailUser}>`,
      to: email,
      subject: `🎟️ Your Seminar Registration is Confirmed | SSEMS`,
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          content: logoContent,
          cid: 'ssemslogo'
        }
      ],
    });

    console.log('Message sent: %s', info.messageId);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
  }
}
