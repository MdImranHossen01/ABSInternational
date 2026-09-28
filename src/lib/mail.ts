import nodemailer from 'nodemailer';

const isCustomSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = isCustomSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const getSenderEmail = () => {
  return process.env.EMAIL_FROM || `"ABS International" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`;
};

const escapeHtml = (text?: string | null): string => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const sendResetEmail = async (email: string, token: string) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const encodedToken = encodeURIComponent(token);
  const resetUrl = `${baseUrl}/reset-password?token=${encodedToken}`;

  const mailOptions = {
    from: getSenderEmail(),
    to: email,
    subject: 'Password Reset Request - ABS International',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0d9488; text-align: center;">ABS International</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">ABS International - Your Trusted Online Store</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeRegistrationEmail = async ({
  email,
  name,
  memberId,
  password,
  sponsorId,
}: {
  email: string;
  name: string;
  memberId: string;
  password?: string;
  sponsorId?: string;
}) => {
  try {
    const hasAuth = (process.env.SMTP_USER && process.env.SMTP_PASS) || (process.env.EMAIL_USER && process.env.EMAIL_PASS);
    if (!hasAuth) {
      console.warn('Neither custom SMTP nor Gmail credentials configured. Skipping registration email.');
      return;
    }
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const loginUrl = `${baseUrl}/login`;

    const safeName = escapeHtml(name);
    const safeMemberId = escapeHtml(memberId);
    const safePassword = password ? escapeHtml(password) : '';
    const safeSponsorId = sponsorId ? escapeHtml(sponsorId) : '';

    const mailOptions = {
      from: getSenderEmail(),
      to: email,
      subject: `Welcome to ABS International - Your Account Credentials (${memberId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0d9488; margin: 0; font-size: 24px;">ABS International</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Health, Beauty & Global Prosperity</p>
          </div>
          <p style="font-size: 15px; color: #1e293b;">Dear <strong>${safeName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Congratulations! Your ABS International membership account has been successfully created. Below are your official account credentials and referral details:
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Member ID / Reference Code:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0d9488; font-family: monospace; font-size: 16px;">${safeMemberId}</td>
              </tr>
              ${password ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Password:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1e293b; font-family: monospace;">${safePassword}</td>
              </tr>
              ` : ''}
              ${sponsorId ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Sponsor ID:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #475569; font-family: monospace;">${safeSponsorId}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Login Portal:</td>
                <td style="padding: 6px 0;"><a href="${loginUrl}" style="color: #0d9488; text-decoration: underline;">${loginUrl}</a></td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${loginUrl}" style="background-color: #0d9488; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
              Login to Your Dashboard
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
            * Please keep your login credentials secure. You can share your Member ID (${safeMemberId}) with others as your sponsor reference code to build your own team.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            ABS International &copy; 2026. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome registration email:', error);
  }
};

