import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsedition.in'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'NewsEdition'

export async function sendVerificationEmail(email: string, url: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Verify your ${siteName} email`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${siteName}</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Verify your email address</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Thanks for signing up! Click the button below to verify your email address.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="background: #dc2626; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
            This link expires in 24 hours.
          </p>
        </div>
        <div style="padding: 16px; text-align: center; background: #f8fafc; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} ${siteName}. All rights reserved.
        </div>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, url: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Reset your ${siteName} password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${siteName}</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Reset your password</h2>
          <p style="color: #64748b; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="background: #dc2626; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email.
            This link expires in 1 hour.
          </p>
        </div>
        <div style="padding: 16px; text-align: center; background: #f8fafc; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} ${siteName}. All rights reserved.
        </div>
      </div>
    `,
  })
}
