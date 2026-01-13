import nodemailer from 'nodemailer';

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

    const htmlContent = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f7fb; padding:16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:8px;">
        <tr>
          <td align="center" style="padding:24px 24px 16px;">
            <img src="https://ssems.vercel.app/logo-full.png" alt="SSEMS Logo" style="display:block; width:100%; max-width:240px; height:auto; margin:0 auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 24px; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color:#334155; font-size:16px; line-height:1.6;">
            <p style="margin:0 0 12px;">Dear ${student_name},</p>
            <p style="margin:0 0 12px;">Greetings from <b>Smart Seminar & Event Management System</b> 🎓</p>
            <p style="margin:0 0 12px;">Your registration for the seminar "<b>${seminar_name}</b>" has been successfully confirmed.</p>
            <p style="margin:0 0 16px;">
              📅 <b>Date:</b> ${seminar_date}<br>
              📍 <b>Venue:</b> ${hall_name}<br>
              💺 <b>Seat No:</b> ${seat_number}<br>
              🆔 <b>Ticket ID:</b> ${ticket_id}
            </p>
            <p style="margin:0 0 8px;"><b>Show this QR code at the entry gate:</b></p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding:8px 0 16px;">
                  <img src="${qr_code_url}" alt="Seminar Ticket QR" width="200" height="200" style="display:block; border:1px solid #e2e8f0; padding:4px; border-radius:4px;" />
                </td>
              </tr>
            </table>
            <p style="margin:0 0 12px;">Please keep this email safe and present the QR code at the venue entrance.</p>
            <p style="margin:0 0 12px;">We wish you a great learning experience!</p>
            <p style="margin:0;">
              Best Regards,<br>
              <b>Smart Seminar & Event Management System</b><br>
              📧 support@ssems.qzz.io
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `;

    const info = await transporter.sendMail({
      from: `"🎟️ Your Seminar Registration is Confirmed | SSEMS" <${emailUser}>`,
      to: email,
      subject: `🎟️ Your Seminar Registration is Confirmed | SSEMS`,
      html: htmlContent,
    });

    console.log('Message sent: %s', info.messageId);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
  }
}
