import emailjs from "@emailjs/browser";

/**
 * Sends a registration confirmation email using EmailJS.
 * 
 * @param {Object} params - The email parameters.
 * @param {string} params.student_name - Name of the student.
 * @param {string} params.student_email - Email of the student.
 * @param {string} params.phone_number - Phone number of the student.
 * @param {string} params.seminar_name - Name of the seminar.
 * @param {string} params.seminar_date - Date of the seminar.
 * @param {string} params.hall_name - Name of the hall.
 * @param {string} params.seat_number - Seat number (e.g., "A-1").
 * @param {string} params.ticket_id - Unique ticket ID.
 * 
 * @returns {Promise<{success: boolean, error?: string}>} - Returns result object
 */
export const sendRegistrationEmail = async ({
  student_name,
  student_email,
  phone_number,
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
      console.warn("EmailJS Environment Variables Missing. Simulating success for development.");
      return { success: true, simulated: true };
    }

    if (serviceId.includes("YOUR_") || templateId.includes("YOUR_") || publicKey.includes("YOUR_")) {
        console.warn("EmailJS using placeholder credentials. Simulating success for development.");
        return { success: true, simulated: true };
    }

    // Generate QR Code URL using api.qrserver.com
    const qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket_id}`;

    const templateParams = {
      student_name,
      student_email,
      phone_number,
      seminar_name,
      seminar_date,
      hall_name,
      seat_number,
      ticket_id,
      qr_code_url
    };

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    if (response.status === 200) {
      return { success: true };
    } else {
      console.error("EmailJS Non-200 Response", response);
      return { success: false, error: "Email provider rejected request" };
    }
  } catch (error) {
    console.error("EmailJS Error", error);
    return { success: false, error: error.text || error.message || "Unknown error" };
  }
};
