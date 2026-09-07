import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = 3001;

// Initialize Resend
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Generate 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate secure reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/password-reset/request
 * Request password reset OTP via email
 */
app.post('/api/password-reset/request', async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    });

    console.log(`📧 Sending OTP to ${email}: ${otp}`);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Sufiyan Autos ERP <onboarding@resend.dev>',
      to: [email],
      subject: 'Password Reset Code - Sufiyan Autos',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 40px 30px; text-align: center;">
                      <div style="background-color: rgba(255,255,255,0.15); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 2px solid rgba(255,255,255,0.2);">
                        <span style="font-size: 28px; font-weight: 900; color: white;">SA</span>
                      </div>
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Password Reset Request</h1>
                      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Sufiyan Autos ERP System</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                        ${userName ? `Hi <strong>${userName}</strong>,` : 'Hello,'}
                      </p>
                      <p style="margin: 0 0 30px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                        We received a request to reset your password for your Sufiyan Autos ERP account. Use the verification code below to complete your password reset:
                      </p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 12px; padding: 24px 40px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);">
                              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Your Verification Code</p>
                              <p style="margin: 0; color: white; font-size: 42px; font-weight: 900; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                        This code will expire in <strong style="color: #fbbf24;">10 minutes</strong>. If you didn't request this password reset, please ignore this email.
                      </p>
                      
                      <!-- Security Notice -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; border-radius: 8px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0; color: #fbbf24; font-size: 13px; font-weight: 600; margin-bottom: 8px;">🔒 Security Reminder</p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.5;">
                              Never share this code with anyone. Sufiyan Autos staff will never ask for your verification code.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
                      <p style="margin: 0 0 10px; color: #94a3b8; font-size: 13px;">
                        © ${new Date().getFullYear()} Sufiyan Autos. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #64748b; font-size: 12px;">
                        Electric Bike Inventory Management System
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send email. Please check your email address and try again.' 
      });
    }

    console.log('✅ OTP email sent successfully:', data);

    res.json({ 
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An error occurred while processing your request' 
    });
  }
});

/**
 * POST /api/password-reset/verify
 * Verify OTP and generate reset token
 */
app.post('/api/password-reset/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and OTP are required' 
      });
    }

    const emailKey = email.toLowerCase();
    const stored = otpStore.get(emailKey);

    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        error: 'No verification code found. Please request a new one.' 
      });
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(emailKey);
      return res.status(400).json({ 
        success: false, 
        error: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Check attempts (max 5)
    if (stored.attempts >= 5) {
      otpStore.delete(emailKey);
      return res.status(400).json({ 
        success: false, 
        error: 'Too many incorrect attempts. Please request a new code.' 
      });
    }

    // Verify OTP
    if (stored.otp !== otp.trim()) {
      stored.attempts += 1;
      return res.status(400).json({ 
        success: false, 
        error: `Invalid verification code. ${5 - stored.attempts} attempts remaining.` 
      });
    }

    // OTP verified - generate reset token
    const resetToken = generateResetToken();
    
    // Store reset token (valid for 15 minutes)
    otpStore.set(`token:${emailKey}`, {
      token: resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000,
      verified: true
    });

    // Clean up OTP
    otpStore.delete(emailKey);

    console.log(`✅ OTP verified for ${email}`);

    res.json({ 
      success: true,
      resetToken,
      message: 'Verification successful'
    });

  } catch (error) {
    console.error('❌ Verify error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An error occurred during verification' 
    });
  }
});

/**
 * POST /api/password-reset/confirm
 * Validate reset token (password change happens in Firebase on client)
 */
app.post('/api/password-reset/confirm', async (req, res) => {
  try {
    const { email, resetToken } = req.body;

    if (!email || !resetToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and reset token are required' 
      });
    }

    const emailKey = email.toLowerCase();
    const tokenKey = `token:${emailKey}`;
    const stored = otpStore.get(tokenKey);

    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset session. Please start over.' 
      });
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(tokenKey);
      return res.status(400).json({ 
        success: false, 
        error: 'Reset session has expired. Please start over.' 
      });
    }

    // Verify token
    if (stored.token !== resetToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid reset token.' 
      });
    }

    // Clean up token after successful validation
    otpStore.delete(tokenKey);

    console.log(`✅ Reset token validated for ${email}`);

    res.json({ 
      success: true,
      message: 'Reset token validated. You can now change your password.'
    });

  } catch (error) {
    console.error('❌ Confirm error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An error occurred during validation' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    otpStoreSize: otpStore.size
  });
});

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt && now > value.expiresAt) {
      otpStore.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired OTP(s)`);
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║                                                                ║`);
  console.log(`║     🚀 Password Reset Server Running                          ║`);
  console.log(`║                                                                ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📧 Email Provider: Resend`);
  console.log(`🔑 API Key: ${process.env.VITE_RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);
});
