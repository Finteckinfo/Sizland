import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, address, privateKey, mnemonic } = req.body;

    if (!email || !address || !privateKey || !mnemonic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Sizland Wallet Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Your Sizland Wallet Has Been Created!</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Wallet Address:</h3>
            <p style="background-color: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all;">
              ${address}
            </p>
          </div>

          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0;">⚠️ IMPORTANT: Keep These Secure!</h3>
            
            <h4 style="color: #dc2626;">Private Key (Base64):</h4>
            <p style="background-color: #fee2e2; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 12px;">
              ${privateKey}
            </p>

            <h4 style="color: #dc2626;">25-Word Recovery Phrase:</h4>
            <p style="background-color: #fee2e2; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 14px;">
              ${mnemonic}
            </p>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">🔐 Security Instructions:</h3>
            <ul style="color: #0c4a6e;">
              <li>Store these credentials in a secure location</li>
              <li>Never share your private key or recovery phrase with anyone</li>
              <li>Consider using a hardware wallet for additional security</li>
              <li>Backup your recovery phrase in multiple secure locations</li>
            </ul>
          </div>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">🚀 Next Steps:</h3>
            <ul style="color: #14532d;">
              <li>Visit <a href="https://sizland.xyz" style="color: #059669;">Sizland</a> to start using your wallet</li>
              <li>Fund your wallet with ALGO to start transacting</li>
              <li>Explore the Sizland ecosystem</li>
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
            This email was sent from Sizland. If you didn't request this wallet, please ignore this email.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Wallet credentials sent to email' });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
