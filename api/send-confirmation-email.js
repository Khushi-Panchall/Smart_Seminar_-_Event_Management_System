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
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: #0f172a; color: #ffffff; padding: 20px; text-align: center; }
          .content { padding: 30px; color: #334155; line-height: 1.6; }
          .ticket-info { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0f172a; }
          .qr-code { text-align: center; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .label { font-weight: bold; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">Registration Confirmed</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${student_name}</strong>,</p>
            <p>We are excited to confirm your registration for <strong>${seminar_name}</strong>. Your seat has been successfully reserved.</p>
            
            <div class="ticket-info">
              <p><span class="label">Date:</span> ${seminar_date}</p>
              <p><span class="label">Venue:</span> ${hall_name}</p>
              <p><span class="label">Seat Number:</span> <strong>${seat_number}</strong></p>
              <p><span class="label">Ticket ID:</span> ${ticket_id}</p>
            </div>

            <div class="qr-code">
              <p style="margin-bottom: 10px; font-size: 14px; color: #64748b;">Please show this QR code at the entrance:</p>
              <img src="${qr_code_url}" alt="Ticket QR Code" width="200" height="200" style="border: 1px solid #e2e8f0; padding: 5px; border-radius: 4px;" />
            </div>
            
            <p>We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smart Seminar & Event Management System (SSEMS)</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"SSEMS Support" <${emailUser}>`,
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
