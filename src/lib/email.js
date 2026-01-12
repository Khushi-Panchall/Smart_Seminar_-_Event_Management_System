/**
 * Sends a registration confirmation email using the Vercel Serverless API.
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
    // In development (if not using 'vercel dev'), we can't hit /api easily without proxy.
    // However, the requirement is for PRODUCTION reliability.
    // We will attempt to fetch the API.
    
    // Note: If running locally with 'vite', /api/send-confirmation-email might 404 unless proxied or mocked.
    // If you need local testing, use 'vercel dev' or mock this function.
    
    const response = await fetch('/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_name,
        email: student_email, // Map student_email to email for API
        phone_number,
        seminar_name,
        seminar_date,
        hall_name,
        seat_number,
        ticket_id
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true };
    } else {
      console.error("Email API Error", data);
      return { success: false, error: data.error || "Failed to send email" };
    }
  } catch (error) {
    console.error("Network/API Error", error);
    // Return success: false but do NOT throw, so we don't block the UI flow
    return { success: false, error: error.message || "Network error" };
  }
};
