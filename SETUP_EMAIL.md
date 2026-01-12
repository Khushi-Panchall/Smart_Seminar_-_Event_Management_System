# EmailJS Setup Guide

To enable email notifications, you need to set up an EmailJS account and configure the environment variables.

1.  **Create an Account**: Go to [EmailJS](https://www.emailjs.com/) and sign up for a free account.
2.  **Add Email Service**:
    *   Go to the "Email Services" tab.
    *   Click "Add New Service".
    *   Select your email provider (e.g., Gmail).
    *   Connect your account and create the service.
    *   Copy the **Service ID** (e.g., `service_xxxxx`).
3.  **Create Email Template**:
    *   Go to the "Email Templates" tab.
    *   Click "Create New Template".
    *   Design your email. Use the following variables in your template:
        *   `{{student_name}}`
        *   `{{student_email}}`
        *   `{{phone_number}}`
        *   `{{seminar_name}}`
        *   `{{seminar_date}}`
        *   `{{hall_name}}`
        *   `{{seat_number}}`
        *   `{{ticket_id}}`
        *   `{{qr_code_url}}` (Use this in an `<img>` tag: `<img src="{{qr_code_url}}" />`)
    *   Save the template.
    *   Copy the **Template ID** (e.g., `template_xxxxx`).
4.  **Get Public Key**:
    *   Go to the "Account" page (click your avatar in the top right).
    *   Copy the **Public Key** (User ID).
5.  **Configure Environment Variables**:
    *   Open the `.env` file in the project root.
    *   Replace the placeholders with your actual values:
        ```env
        VITE_EMAILJS_SERVICE_ID=your_service_id
        VITE_EMAILJS_TEMPLATE_ID=your_template_id
        VITE_EMAILJS_PUBLIC_KEY=your_public_key
        ```
6.  **Restart Server**:
    *   If the development server is running, restart it for the changes to take effect.
