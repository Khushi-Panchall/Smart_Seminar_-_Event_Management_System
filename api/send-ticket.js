import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

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
    // 1. Generate QR Code
    const qrCodeBuffer = await QRCode.toBuffer(ticket_id);

    // 2. Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    // PDF Content
    doc.fontSize(24).font('Helvetica-Bold').text('SEMINAR TICKET', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica').text(`Ticket ID: ${ticket_id}`, { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(12).text(`Name: ${student_name}`);
    doc.text(`Seminar: ${seminar_name}`);
    doc.text(`Date: ${seminar_date}`);
    doc.text(`Hall: ${hall_name}`);
    doc.text(`Seat: ${seat_number}`);
    
    doc.moveDown(2);
    doc.image(qrCodeBuffer, { fit: [150, 150], align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(10).text('Please present this QR code at the entrance.', { align: 'center' });
    
    doc.end();

    // Wait for PDF to finish
    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });

    // 3. Configure Nodemailer (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Send Email
    await transporter.sendMail({
      from: `"SSEMS Support" <${process.env.EMAIL_USER}>`,
      to: student_email,
      subject: `🎟️ Ticket: ${seminar_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Your Registration is Confirmed!</h2>
          <p>Hi <strong>${student_name}</strong>,</p>
          <p>You have successfully booked a seat for <strong>${seminar_name}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${seminar_date}</p>
            <p style="margin: 5px 0;"><strong>Hall:</strong> ${hall_name}</p>
            <p style="margin: 5px 0;"><strong>Seat:</strong> ${seat_number}</p>
            <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticket_id}</p>
          </div>
          <p>Your official ticket with QR code is attached to this email.</p>
          <p>Please show the QR code at the entrance.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Ticket-${ticket_id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}
