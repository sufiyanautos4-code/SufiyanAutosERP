# 📧 Resend Password Reset - Complete Setup Guide

## ✅ What Was Implemented

You now have a **custom password reset system** using Resend API instead of Firebase's built-in emails.

### Features:
- ✅ 4-digit OTP sent via beautiful HTML email
- ✅ Professional email design with Sufiyan Autos branding
- ✅ 10-minute OTP expiration
- ✅ Rate limiting (max 5 attempts)
- ✅ Secure reset token validation
- ✅ Backend server to avoid CORS issues
- ✅ Automatic cleanup of expired OTPs
- ✅ Firebase password reset link sent after OTP verification

---

## 🚀 How to Run

### Option 1: Run Both Services Together (Recommended)

```bash
npm run dev:all
```

This runs:
- Frontend (Vite): `http://localhost:3000`
- Backend (Express): `http://localhost:3001`

### Option 2: Run Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

---

## 📧 How It Works

### User Flow:

1. **User clicks "Forgot Password"**
   - Enters email address
   - Clicks "Send Verification Code"

2. **Backend sends beautiful OTP email via Resend**
   - 4-digit code generated
   - HTML email with Sufiyan Autos branding
   - Code expires in 10 minutes

3. **User enters OTP**
   - Frontend validates with backend
   - Max 5 attempts allowed
   - Backend returns reset token

4. **Backend validates reset token**
   - Checks expiration (15 minutes)
   - Confirms authenticity

5. **Firebase sends password reset email**
   - After OTP verification
   - User clicks link to reset password

6. **Success!**
   - User can set new password
   - Redirected to login screen

---

## 🎨 Email Design

The OTP email includes:
- ✅ Sufiyan Autos logo and branding
- ✅ Large, bold 4-digit OTP code
- ✅ 10-minute expiration warning
- ✅ Security reminder (never share code)
- ✅ Responsive mobile design
- ✅ Professional dark theme matching your app

---

## 🔒 Security Features

### 1. OTP Expiration
- OTPs expire after **10 minutes**
- Automatic cleanup every 5 minutes

### 2. Rate Limiting
- Maximum **5 attempts** per OTP
- Resets when requesting new code

### 3. Reset Token
- Secure 32-byte hex token
- Expires after **15 minutes**
- One-time use only

### 4. No Sensitive Data in Frontend
- All verification happens on backend
- Frontend never sees stored OTPs

---

## 📂 Files Created/Modified

### New Files:
1. **`server.js`** - Express backend server
   - `/api/password-reset/request` - Send OTP
   - `/api/password-reset/verify` - Verify OTP
   - `/api/password-reset/confirm` - Validate token

2. **`src/services/passwordResetService.ts`** - Frontend API client
   - `requestPasswordResetOTP()`
   - `verifyPasswordResetOTP()`
   - `validateResetToken()`

### Modified Files:
1. **`src/components/ForgotPasswordFlow.tsx`** - Updated UI for OTP flow
2. **`package.json`** - Added `server` and `dev:all` scripts
3. **`src/services/authService.ts`** - Added reset password helpers

---

## 🔧 Configuration

### Environment Variables (.env)

```env
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Make sure your Resend API key is configured!

### Backend Server Config

- **Port:** 3001
- **CORS:** Allows localhost:3000, localhost:5173
- **In-memory storage:** OTPs stored temporarily (use Redis in production)

---

## 🧪 Testing

### Test the Full Flow:

1. **Start both services:**
   ```bash
   npm run dev:all
   ```

2. **Open app:**
   ```
   http://localhost:3000
   ```

3. **Click "Forgot Password"**

4. **Enter your email**
   - Click "Send Verification Code"
   - Check backend terminal for OTP log
   - Check your email inbox

5. **Enter OTP from email**
   - Should verify successfully
   - Should receive Firebase password reset email

6. **Click link in Firebase email**
   - Set new password
   - Sign in with new credentials

---

## 📊 Backend API Endpoints

### 1. Request OTP
```http
POST http://localhost:3001/api/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com",
  "userName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### 2. Verify OTP
```http
POST http://localhost:3001/api/password-reset/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "resetToken": "abc123...",
  "message": "Verification successful"
}
```

### 3. Validate Token
```http
POST http://localhost:3001/api/password-reset/confirm
Content-Type: application/json

{
  "email": "user@example.com",
  "resetToken": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reset token validated"
}
```

### 4. Health Check
```http
GET http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-06T...",
  "otpStoreSize": 2
}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to connect to server"

**Solution:** Make sure backend server is running:
```bash
npm run server
```

Check terminal for:
```
🚀 Password Reset Server Running
📡 Server: http://localhost:3001
```

### Issue: "Failed to send email"

**Possible Causes:**
1. ❌ Resend API key missing or invalid
2. ❌ Email address not verified in Resend
3. ❌ Resend rate limit exceeded

**Solutions:**
1. Check `.env` file has `VITE_RESEND_API_KEY`
2. Verify email in Resend dashboard
3. Wait a few minutes if rate limited

### Issue: "Invalid verification code"

**Possible Causes:**
1. ❌ Wrong OTP entered
2. ❌ OTP expired (10 minutes)
3. ❌ Too many attempts (max 5)

**Solutions:**
1. Check email for correct 4-digit code
2. Request new code if expired
3. Request new code if attempts exceeded

### Issue: OTP email not received

**Check:**
1. ✅ Spam/Junk folder
2. ✅ Backend terminal shows OTP (for testing)
3. ✅ Resend dashboard for delivery logs
4. ✅ Email address is correct

---

## 🎯 Production Deployment

### Backend (Express Server)

**Option 1: Vercel Serverless Functions**
- Create `api/password-reset.js`
- Deploy with Vercel CLI

**Option 2: Railway/Render**
- Push code to GitHub
- Connect to Railway/Render
- Set environment variables
- Deploy

**Option 3: AWS Lambda**
- Use Serverless Framework
- Deploy as Lambda functions

### Environment Variables

Make sure to set in production:
```
VITE_RESEND_API_KEY=your_production_key
NODE_ENV=production
```

### Storage

For production, replace in-memory `otpStore` with:
- **Redis** (recommended)
- **Firebase Realtime Database**
- **PostgreSQL/MySQL**

---

## 📈 Future Improvements

### Optional Enhancements:

1. **SMS OTP** (in addition to email)
   - Use Twilio or AWS SNS
   - Add phone verification

2. **Remember Me token**
   - Skip OTP for trusted devices
   - Use secure cookies

3. **Biometric Authentication**
   - Touch ID / Face ID
   - WebAuthn integration

4. **Audit Logs**
   - Track password reset attempts
   - Alert on suspicious activity

5. **Custom Email Templates**
   - Upload your logo to Resend
   - Customize branding colors

---

## 💡 Quick Commands Reference

```bash
# Run everything (recommended)
npm run dev:all

# Run frontend only
npm run dev

# Run backend only
npm run server

# Check TypeScript compilation
npm run lint

# Build for production
npm run build
```

---

## ✅ Summary

You now have a **professional password reset system** with:
- ✅ Custom OTP emails via Resend
- ✅ Beautiful HTML email design
- ✅ Secure backend validation
- ✅ No CORS issues
- ✅ Single user constraint maintained
- ✅ Firebase integration for final password change

**Everything is ready to use!** 🎉

---

**Last Updated:** 2026-09-06  
**Status:** ✅ Ready for Testing  
**Test Command:** `npm run dev:all`
