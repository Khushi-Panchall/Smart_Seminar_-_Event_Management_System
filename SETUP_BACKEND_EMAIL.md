# Production Email Setup Guide (Nodemailer + Vercel)

This project now uses a serverless backend to send emails reliably, replacing EmailJS.

## 1. Get Gmail App Password
1.  Go to your **Google Account** settings.
2.  Navigate to **Security**.
3.  Enable **2-Step Verification** if not already enabled.
4.  Search for **App Passwords**.
5.  Create a new app password (name it "SSEMS").
6.  Copy the 16-character password (e.g., `abcd efgh ijkl mnop`).

## 2. Configure Vercel Environment Variables
Since the email logic runs on the server, you must set these variables in your Vercel Project Settings.

1.  Go to your project dashboard on [Vercel](https://vercel.com/).
2.  Click **Settings** > **Environment Variables**.
3.  Add the following variables:

    | Key | Value |
    | --- | --- |
    | `EMAIL_USER` | Your Gmail address (e.g., `admin@college.edu`) |
    | `EMAIL_PASS` | The 16-character App Password you generated |
    | `EMAIL_HOST` | `smtp.gmail.com` |
    | `EMAIL_PORT` | `465` |

4.  **Redeploy** your project for changes to take effect.

## 3. Local Development
To test emails locally, you need to run the Vercel development server:
```bash
npm i -g vercel
vercel dev
```
(You will need to link your project and pull the environment variables).

If you just run `npm run dev` (Vite), the email API will not work locally, but the registration flow will still complete (showing a "Network error" toast for the email part).
