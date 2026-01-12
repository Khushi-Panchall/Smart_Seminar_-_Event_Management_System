# Production Email Setup Guide (Nodemailer + Vercel)

## Option 1: Brevo (Recommended for Production)
Since you have a Brevo (Sendinblue) account, this is the best option for reliability.

**Vercel Environment Variables:**

| Key | Value |
| --- | --- |
| `EMAIL_USER` | **Your Brevo Login Email** (The email you use to log into Brevo) |
| `EMAIL_PASS` | `YOUR_BREVO_SMTP_KEY` |
| `EMAIL_HOST` | `smtp-relay.brevo.com` |
| `EMAIL_PORT` | `587` |

---

## Option 2: Gmail (Alternative)
If you prefer to use your personal Gmail account.

**Vercel Environment Variables:**

| Key | Value |
| --- | --- |
| `EMAIL_USER` | **Your Gmail Address** (e.g., `chavdajaydeep128@gmail.com`) |
| `EMAIL_PASS` | `YOUR_GMAIL_APP_PASSWORD` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `465` |

## How to Add to Vercel
1.  Go to your project dashboard on [Vercel](https://vercel.com/).
2.  Click **Settings** > **Environment Variables**.
3.  Add the 4 variables listed above for your chosen provider.
4.  **Redeploy** your project (Go to Deployments > Redeploy) for changes to take effect.
