import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const {
    student_name,
    student_email,
    seminar_name,
    seminar_date,
    hall_name,
    seat_number,
    ticket_id
  } = req.body;

  if (!student_email || !ticket_id) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Construct QR Code URL (Using external API as requested)
    const qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket_id}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const logoPath = path.join(process.cwd(), 'public', 'logo-full.png');
    const logoContent = fs.readFileSync(logoPath);

    // Send Email with the updated HTML template
    await transporter.sendMail({
      from: `"SSEMS Support" <${process.env.EMAIL_USER}>`,
      to: student_email,
      subject: `🎟️ Your Seminar Registration is Confirmed | SSEMS`,
      html: `
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
      `,
      attachments: [
        {
          filename: 'logo.png',
          content: logoContent,
          cid: 'ssemslogo'
        }
      ]
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}
