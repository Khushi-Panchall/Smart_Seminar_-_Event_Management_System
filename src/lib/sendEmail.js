import emailjs from '@emailjs/browser';

/**
 * Sends a registration confirmation email using EmailJS.
 * This function is designed to be non-blocking and fail-safe.
 * 
 * @param {Object} params
 * @param {string} params.student_name
 * @param {string} params.student_email
 * @param {string} params.seminar_name
 * @param {string} params.seminar_date
 * @param {string} params.hall_name
 * @param {string} params.seat_number
 * @param {string} params.ticket_id
 * @returns {Promise<boolean>} - Returns true if email sent (or simulated), false otherwise.
 */
export const sendEmailNotification = async ({
  student_name,
  student_email,
  seminar_name,
  seminar_date,
  hall_name,
  seat_number,
  ticket_id
}) => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS credentials missing. Email skipped.");
      // We return false here because we didn't send it, but the caller handles it gracefully.
      return false;
    }

    const qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket_id}`;

    const templateParams = {
      student_name,
      to_email: student_email,
      seminar_name,
      seminar_date,
      hall_name,
      seat_number,
      ticket_id,
      qr_code_url
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log(`Email sent to ${student_email}`);
    return true;

  } catch (error) {
    console.error("EmailJS Error:", error);
    return false;
  }
};
