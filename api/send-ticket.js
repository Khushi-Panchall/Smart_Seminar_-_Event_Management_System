import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
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
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { 
        studentName, 
        email, 
        phone,
        seminarName, 
        date, 
        time, 
        venue, 
        hallName, 
        seatNumber, 
        ticketId,
        collegeName
    } = req.body;

    if (!email || !studentName || !ticketId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Generate QR Code (Buffer)
        const qrBuffer = await QRCode.toBuffer(ticketId, { width: 200, margin: 1 });

        // 2. Generate PDF in memory
        const doc = new PDFDocument({ size: 'A4', margin: 0 });
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        
        // --- PDF Content ---
        const primaryColor = '#1e3a8a'; // Blue-900

        // Header Background
        doc.rect(0, 0, 595, 113).fill(primaryColor);
        
        // Logo / Title
        doc.fillColor('white').fontSize(30).font('Helvetica-Bold').text('SSEMS', 50, 45);
        doc.fontSize(16).text('Event Ticket', 0, 45, { align: 'right', width: 545 });

        // Seminar Title
        doc.fillColor('black').fontSize(22).font('Helvetica-Bold')
           .text(seminarName, 0, 160, { align: 'center' });

        // Divider
        doc.moveTo(50, 190).lineTo(545, 190).strokeColor('#e5e7eb').stroke();

        // Details Grid
        const startY = 220;
        const col1X = 60;
        const col2X = 320;
        const lineHeight = 30;

        const addField = (label, value, x, y) => {
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#64748b').text(label, x, y);
            doc.fontSize(12).font('Helvetica').fillColor('black').text(String(value), x, y + 15);
        };

        addField("Attendee Name", studentName, col1X, startY);
        addField("Seat Number", seatNumber, col2X, startY);

        addField("Email", email, col1X, startY + 60);
        addField("Phone", phone || "N/A", col2X, startY + 60);

        addField("Date", date, col1X, startY + 120);
        addField("Time", time, col2X, startY + 120);

        addField("Venue", venue || hallName, col1X, startY + 180);
        if (collegeName) {
            addField("Institution", collegeName, col2X, startY + 180);
        }

        addField("Ticket ID", ticketId, col1X, startY + 240);

        // QR Code Box
        const qrY = startY + 290;
        const qrBoxX = (595 - 200) / 2; // Center
        
        // QR Image
        doc.image(qrBuffer, qrBoxX + 25, qrY, { width: 150 });
        
        doc.fontSize(10).fillColor('#64748b')
           .text("Scan this QR code at the entrance", 0, qrY + 160, { align: 'center' });

        // Footer
        const footerY = 780;
        doc.fontSize(8).fillColor('#94a3b8')
           .text(`Generated on ${new Date().toLocaleString()}`, 0, footerY, { align: 'center' });
        doc.text("Smart Seminar & Event Management System", 0, footerY + 12, { align: 'center' });

        doc.end();

        const pdfBuffer = await new Promise(resolve => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        // 3. Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'smartseminar123@gmail.com',
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"SSEMS" <${process.env.EMAIL_USER || 'smartseminar123@gmail.com'}>`,
            to: email,
            subject: '🎟️ Your Seminar Registration is Confirmed | SSEMS',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Dear ${studentName},</h2>
                    <p>Greetings from Smart Seminar & Event Management System 🎓</p>
                    <p>Your registration for the seminar "<strong>${seminarName}</strong>" has been successfully confirmed.</p>
                    <p>
                        📅 <strong>Date:</strong> ${date}<br>
                        📍 <strong>Venue:</strong> ${venue || hallName}<br>
                        💺 <strong>Seat No:</strong> ${seatNumber}<br>
                        🆔 <strong>Ticket ID:</strong> ${ticketId}
                    </p>
                    <p>Please find your official seminar ticket attached with this email.<br>
                    Kindly show the QR code at the entry gate.</p>
                    <p>We wish you a great learning experience!</p>
                    <br>
                    <p>Best Regards,<br>
                    <strong>Smart Seminar & Event Management System</strong><br>
                    📧 smartseminar123@gmail.com</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Ticket-${studentName.replace(/\s+/g, '_')}-${ticketId}.pdf`,
                    content: pdfBuffer
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Email sent successfully' });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
