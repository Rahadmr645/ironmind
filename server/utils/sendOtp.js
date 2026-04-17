import nodemailer from 'nodemailer';

export const sendOtp = async (email, otp) => {
  const user = process.env.GMAIL || process.env.GMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : rawPass;

  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Gmail credentials are not configured (use GMAIL/GMAIL_APP_PASSWORD or GMAIL_USER/GMAIL_PASS)'
      );
    }

    // Development fallback: do not block signup if SMTP is not configured.
    console.warn('GMAIL credentials missing, OTP email skipped in development mode.');
    console.log(`OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: user,
    to: email,
    subject: 'Your verification OTP',
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};