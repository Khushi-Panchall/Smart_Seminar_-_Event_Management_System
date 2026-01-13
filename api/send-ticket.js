import nodemailer from 'nodemailer';

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

    // Send Email with the updated HTML template
    await transporter.sendMail({
      from: `"🎟️ Your Seminar Registration is Confirmed | SSEMS" <${process.env.EMAIL_USER}>`,
      to: student_email,
      subject: `🎟️ Your Seminar Registration is Confirmed | SSEMS`,
      html: `
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
      `
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}
