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

export interface WelcomeRegistrationEmailParams {
  email: string;
  name: string;
  memberId: string;
  username?: string;
  password?: string;
  phone?: string;
  address?: string;
  nidNumber?: string;
  sponsorId?: string;
  sponsorName?: string;
  placementId?: string;
  placementName?: string;
  placementPosition?: number;
  joiningDate?: string;
}

export const sendWelcomeRegistrationEmail = async ({
  email,
  name,
  memberId,
  username,
  password,
  phone,
  address,
  nidNumber,
  sponsorId,
  sponsorName,
  placementId,
  placementName,
  placementPosition,
  joiningDate,
}: WelcomeRegistrationEmailParams) => {
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
    const safeUsername = username ? escapeHtml(username) : '';
    const safePassword = password ? escapeHtml(password) : '';
    const safePhone = phone ? escapeHtml(phone) : '';
    const safeEmail = escapeHtml(email);
    const safeAddress = address ? escapeHtml(address) : '';
    const safeNid = nidNumber ? escapeHtml(nidNumber) : '';
    const safeSponsorId = sponsorId ? escapeHtml(sponsorId) : '';
    const safeSponsorName = sponsorName ? escapeHtml(sponsorName) : '';
    const safePlacementId = placementId ? escapeHtml(placementId) : '';
    const safePlacementName = placementName ? escapeHtml(placementName) : '';
    const safePosition = placementPosition ? `Hand ${escapeHtml(String(placementPosition))}` : '';
    const safeJoiningDate = joiningDate ? escapeHtml(joiningDate) : '';

    const mailOptions = {
      from: getSenderEmail(),
      to: email,
      subject: `Welcome to ABS International - Account Details (${memberId})`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          
          <!-- Header -->
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0d9488;">
            <h1 style="color: #0d9488; margin: 0 0 6px 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">ABS International</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">Health, Beauty & Global Prosperity</p>
          </div>

          <!-- Greeting -->
          <div style="padding: 20px 0 10px 0;">
            <p style="font-size: 16px; margin: 0 0 8px 0;">Dear <strong>${safeName}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">
              Congratulations and welcome to <strong>ABS International</strong>! Your registration has been completed successfully. Here are your complete account credentials and profile details:
            </p>
          </div>

          <!-- Account & Login Credentials Box -->
          <div style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 18px; margin: 16px 0;">
            <div style="font-size: 15px; font-weight: 700; color: #0f766e; margin-bottom: 12px; border-bottom: 1px solid #ccfbf1; padding-bottom: 6px;">
              🔐 Login &amp; Account Credentials
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #475569; width: 42%;">Member ID / Ref Code:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0d9488; font-family: monospace; font-size: 16px;">${safeMemberId}</td>
              </tr>
              ${safeUsername ? `
              <tr>
                <td style="padding: 6px 0; color: #475569;">Username:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #1e293b; font-family: monospace;">${safeUsername}</td>
              </tr>
              ` : ''}
              ${safePassword ? `
              <tr>
                <td style="padding: 6px 0; color: #475569;">Password:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-family: monospace; font-size: 15px; background-color: #ffffff; padding-left: 8px; border-radius: 4px; display: inline-block;">${safePassword}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 6px 0; color: #475569;">Login Portal:</td>
                <td style="padding: 6px 0;"><a href="${loginUrl}" style="color: #0d9488; font-weight: 600; text-decoration: underline;">${loginUrl}</a></td>
              </tr>
            </table>
          </div>

          <!-- Personal Profile Details -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 16px 0;">
            <div style="font-size: 15px; font-weight: 700; color: #334155; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              👤 Personal Profile Details
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 42%;">Full Name:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${safeName}</td>
              </tr>
              ${safePhone ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Mobile Number:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${safePhone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Email Address:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${safeEmail}</td>
              </tr>
              ${safeNid ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">NID / ID Number:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b; font-family: monospace;">${safeNid}</td>
              </tr>
              ` : ''}
              ${safeAddress ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Address:</td>
                <td style="padding: 6px 0; font-weight: 500; color: #1e293b;">${safeAddress}</td>
              </tr>
              ` : ''}
              ${safeJoiningDate ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Joining Date:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${safeJoiningDate}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Sponsor & Placement Details -->
          ${(safeSponsorId || safePlacementId) ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 16px 0;">
            <div style="font-size: 15px; font-weight: 700; color: #334155; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              🤝 Referral &amp; Network Placement
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${safeSponsorId ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 42%;">Sponsor ID:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0d9488; font-family: monospace;">${safeSponsorId}</td>
              </tr>
              ` : ''}
              ${safeSponsorName ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Sponsor Name:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${safeSponsorName}</td>
              </tr>
              ` : ''}
              ${safePlacementId ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Placement ID:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #475569; font-family: monospace;">${safePlacementId}</td>
              </tr>
              ` : ''}
              ${safePlacementName ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Placement Name:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${safePlacementName}</td>
              </tr>
              ` : ''}
              ${safePosition ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Placement Hand:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0d9488;">${safePosition}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          ` : ''}

          <!-- Action Button -->
          <div style="text-align: center; margin: 28px 0 20px 0;">
            <a href="${loginUrl}" style="background-color: #0d9488; color: #ffffff; padding: 13px 32px; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);">
              Login to Your Dashboard
            </a>
          </div>

          <!-- Security & Referral Note -->
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
            <p style="font-size: 13px; color: #92400e; margin: 0; line-height: 1.5;">
              ⚠️ <strong>Security Notice:</strong> Please keep your password and account credentials private and never share them with anyone. Your <strong>Member ID (${safeMemberId})</strong> is your official sponsor code — you can share it with others to register them under your team.
            </p>
          </div>

          <!-- Footer -->
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
          <div style="text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
            <p style="margin: 0 0 4px 0;">ABS International Ltd. | Dhaka, Bangladesh</p>
            <p style="margin: 0 0 4px 0;">Need assistance? Contact us at <a href="mailto:info@absinternationalltd.com" style="color: #0d9488; text-decoration: none;">info@absinternationalltd.com</a></p>
            <p style="margin: 0;">&copy; 2026 ABS International. All rights reserved.</p>
          </div>

        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome registration email:', error);
  }
};

