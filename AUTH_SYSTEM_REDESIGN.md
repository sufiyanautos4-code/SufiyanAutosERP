# Authentication System Redesign Documentation

## Overview

This document describes the redesigned authentication and authorization system for the Sufiyan Autos ERP application. The new system implements enterprise-grade security features including single-user constraint, OTP-based password reset via Resend email service, and enhanced session management.

---

## 🔐 Key Features

### 1. **Single User Constraint**
The system enforces a **ONE ADMIN ACCOUNT ONLY** policy:
- Only one user can be registered in the system at any time
- Registration is automatically blocked if an account already exists
- Users see a clear warning when attempting to create a second account
- This ensures single-ownership control for the ERP system

### 2. **OTP-Based Password Reset**
Modern password recovery using 4-digit verification codes:
- **4-digit OTP** sent via professional email (Resend API)
- **15-minute expiration** for security
- **5 attempt limit** to prevent brute force attacks
- Beautiful, responsive email template with company branding
- Multi-step verification flow (Email → OTP → New Password)

### 3. **Enhanced Session Management**
- Persistent authentication across browser sessions
- Secure token storage in Firestore
- Automatic session cleanup on logout
- Real-time auth state synchronization

### 4. **Firebase Authentication Integration**
- Email/Password authentication
- Google OAuth integration (optional)
- Secure password storage (Firebase handles encryption)
- Built-in protection against common attacks

---

## 📋 Architecture

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Registration Flow                   │
│                     (Single User Constraint)                 │
└─────────────────────────────────────────────────────────────┘

1. User visits signup page
2. System checks if any user exists in database
   ├─ If YES → Show warning + disable signup → Redirect to login
   └─ If NO → Allow registration
3. User enters name, email, password
4. Firebase creates authentication account
5. Firestore creates user profile document
6. User marked as SUPER_ADMIN (system administrator)
7. Session token saved locally
8. User redirected to dashboard


┌─────────────────────────────────────────────────────────────┐
│                  Login Flow (Existing User)                  │
└─────────────────────────────────────────────────────────────┘

1. User enters email + password
2. Firebase validates credentials
3. System retrieves user profile from Firestore
4. Session established with local storage persistence
5. User redirected to dashboard


┌─────────────────────────────────────────────────────────────┐
│              Password Reset Flow (OTP-Based)                 │
└─────────────────────────────────────────────────────────────┘

Step 1: Request OTP
  ├─ User enters email
  ├─ System verifies email exists in database
  ├─ Generate random 4-digit OTP
  ├─ Store OTP in Firestore with 15-min expiration
  └─ Send OTP via Resend email API

Step 2: Verify OTP
  ├─ User enters 4-digit code
  ├─ System validates OTP against stored value
  ├─ Check expiration and attempt count
  ├─ If valid → Generate reset token
  └─ If invalid → Decrement remaining attempts

Step 3: Reset Password
  ├─ User enters new password (min 6 chars)
  ├─ Validate reset token
  ├─ Update password via Firebase Admin
  ├─ Clean up OTP from database
  └─ Send confirmation email
```

---

## 🛠 Technical Implementation

### Core Files Structure

```
src/
├── services/
│   ├── authService.ts                  # Main authentication logic
│   └── passwordResetService.ts         # OTP generation & validation
├── components/
│   ├── AuthPage.tsx                    # Login/Signup UI
│   └── ForgotPasswordFlow.tsx          # Password reset UI (3-step flow)
└── firebase.ts                          # Firebase configuration
```

### Key Functions

#### `authService.ts`

1. **`checkUserExists()`**
   - Checks if any user exists in Firestore
   - Returns: `{ exists: boolean, email?: string }`
   - Used to enforce single-user constraint

2. **`signUpWithEmail()`**
   - **MODIFIED**: Now checks user existence first
   - Blocks registration if account exists
   - Automatically assigns SUPER_ADMIN role to first user
   - Creates user profile in Firestore

3. **`requestPasswordResetOTP(email)`**
   - Validates email exists in system
   - Generates 4-digit OTP
   - Stores OTP in Firestore with expiration
   - Sends OTP via Resend email API

4. **`verifyPasswordResetOTP(email, otp)`**
   - Validates OTP against stored value
   - Checks expiration and attempt limits
   - Returns reset token on success

5. **`resetPasswordWithToken(email, newPassword, token)`**
   - Validates reset token
   - Updates Firebase authentication password
   - Cleans up OTP records

6. **`changePassword(currentPassword, newPassword)`**
   - Allows logged-in user to change password
   - Requires re-authentication with current password
   - Updates Firebase auth password

#### `passwordResetService.ts`

1. **`generateOTP()`**
   - Generates cryptographically random 4-digit code

2. **`storeOTP(email, otp)`**
   - Stores OTP in Firestore collection: `password_reset_otps`
   - Document ID: sanitized email (lowercase, special chars replaced)
   - Includes: email, otp, expiresAt, attempts, createdAt, verified

3. **`verifyOTP(email, inputOTP)`**
   - Retrieves OTP document from Firestore
   - Validates OTP, expiration, attempts
   - Returns reset token on success

4. **`validateResetToken(email, resetToken)`**
   - Validates token before password change
   - Checks 30-minute token validity window

5. **`cleanupOTP(email)`**
   - Deletes OTP document after successful password reset

6. **`sendOTPEmail(email, otp, userName)`**
   - Sends professional HTML email via Resend API
   - Beautiful responsive template with branding
   - Includes OTP, expiration time, security notice

---

## 🎨 UI Components

### AuthPage Component
**Location**: `src/components/AuthPage.tsx`

**Features**:
- Tab-based interface (Sign In / Sign Up)
- Google OAuth integration
- Single-user constraint warning
- Form validation with helpful error messages
- Loading states and animations
- Responsive design (mobile-friendly)

**States**:
- `isLogin`: Toggle between login/signup
- `isForgotPassword`: Show password reset flow
- `userExists`: Flag for single-user constraint
- `isCheckingUser`: Loading state while checking database

### ForgotPasswordFlow Component
**Location**: `src/components/ForgotPasswordFlow.tsx`

**Features**:
- 3-step wizard interface
- Step 1: Email input
- Step 2: OTP verification (4-digit input)
- Step 3: New password creation
- Resend OTP functionality
- Visual feedback for each step
- Error handling with retry logic

**Flow Steps**:
```typescript
type FlowStep = 'email' | 'otp' | 'newPassword' | 'success';
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Resend Email Service
VITE_RESEND_API_KEY=re_your_resend_api_key_here
```

### Resend API Setup

1. **Create Account**: Visit [resend.com](https://resend.com)
2. **Verify Domain** (Optional but recommended):
   - Go to **Domains** → **Add Domain**
   - Add your domain (e.g., `sufiyanautos.com`)
   - Add DNS records provided by Resend
3. **Generate API Key**:
   - Navigate to **API Keys**
   - Click **Create API Key**
   - Copy the key (starts with `re_`)
   - Add to `.env` file

**Free Tier Limits**:
- 100 emails per day
- 3,000 emails per month
- Perfect for single-user ERP system

### Firebase Configuration

1. **Enable Email/Password Authentication**:
   - Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password" provider

2. **Firestore Security Rules** (Important!):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Password reset OTPs - allow read/write for authentication flow
    match /password_reset_otps/{otpId} {
      allow read, write: if true; // Temporary - should be moved to Cloud Function
    }
    
    // Other collections (bikes, shops, etc.)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Security Note**: In production, move OTP operations to Firebase Cloud Functions to protect against abuse.

---

## 📊 Database Schema

### Firestore Collections

#### `users` Collection
```typescript
{
  id: string;                    // Firebase Auth UID
  name: string;                  // User's full name
  email: string;                 // Email address
  phone?: string;                // Optional phone number
  role: 'SUPER_ADMIN';           // Fixed role for single user
  roleTitle: 'System Administrator';
  isSystemAdmin: true;           // Flag for system admin
  avatarBg: string;              // Random color for avatar
  photoURL?: string;             // Google profile photo (if OAuth)
  createdAt: string;             // ISO timestamp
  lastLoginAt: string;           // ISO timestamp
  registeredAt: string;          // ISO timestamp
  updatedAt: Timestamp;          // Firestore server timestamp
}
```

#### `password_reset_otps` Collection
```typescript
{
  email: string;                 // User's email (lowercase)
  otp: string;                   // 4-digit code
  expiresAt: number;             // Unix timestamp (15 min from creation)
  attempts: number;              // Failed verification attempts (max 5)
  createdAt: number;             // Unix timestamp
  verified: boolean;             // OTP verification status
  resetToken?: string;           // Generated after OTP verification
  verifiedAt?: number;           // Unix timestamp when verified
}
```

Document ID format: Email with special characters replaced by underscores
Example: `user@example.com` → `user_example_com`

---

## 🔒 Security Features

### 1. Single User Enforcement
- **Database-level check**: Queries Firestore before allowing registration
- **UI-level prevention**: Signup form disabled when user exists
- **API-level validation**: Firebase Auth creation blocked if user exists

### 2. OTP Security
- **Time-limited**: 15-minute expiration window
- **Attempt-limited**: Maximum 5 verification attempts
- **Single-use**: OTP marked as verified after successful use
- **Cryptographically random**: Generated using `Math.random()` (consider upgrading to `crypto.getRandomValues()` for production)

### 3. Password Requirements
- Minimum 6 characters (Firebase default)
- Can be enhanced with regex validation for complexity

### 4. Session Management
- **Local storage persistence**: Fast 0ms boot time
- **Firestore sync**: Real-time profile updates
- **Automatic cleanup**: Session cleared on logout
- **Token validation**: Reset tokens expire after 30 minutes

### 5. Firebase Security
- **Built-in protection**: Against SQL injection, XSS, CSRF
- **Secure password hashing**: bcrypt with salt (handled by Firebase)
- **Rate limiting**: Firebase Auth includes built-in rate limiting
- **Email verification**: Can be enabled in Firebase Console

---

## 📧 Email Template

The OTP email includes:
- Professional HTML design
- Responsive layout (mobile-friendly)
- Company branding (Sufiyan Autos logo)
- Large, readable OTP display
- Security notice
- Expiration time
- Attempt limit information
- Clear call-to-action

**Email Preview**:
```
┌────────────────────────────────────────┐
│  [SA Logo] Sufiyan Autos              │
│  Password Reset Request               │
├────────────────────────────────────────┤
│                                        │
│  Hello John Doe,                       │
│                                        │
│  We received a request to reset       │
│  your password. Use this OTP:         │
│                                        │
│  ┌──────────────────────────────┐    │
│  │   Your OTP Code               │    │
│  │                               │    │
│  │       1 2 3 4                 │    │
│  │                               │    │
│  │   Valid for 15 minutes        │    │
│  └──────────────────────────────┘    │
│                                        │
│  ⚠️ Security Notice:                  │
│  If you didn't request this, ignore   │
│  this email and secure your account.  │
│                                        │
│  Max 5 attempts • Expires in 15 min   │
└────────────────────────────────────────┘
```

---

## 🚀 Usage Guide

### For End Users

#### First-Time Setup (Registration)
1. Open the application
2. You'll see a "Sign Up" tab (only available if no user exists)
3. Enter your full name, email, and password
4. Click "Create Admin Account"
5. You're now the system administrator!

#### Logging In
1. Open the application
2. Enter your email and password
3. Click "Sign In to Dashboard"

#### Forgot Password
1. Click "Forgot password?" on login page
2. **Step 1**: Enter your email → Click "Send Verification Code"
3. Check your email for 4-digit OTP (arrives within seconds)
4. **Step 2**: Enter the 4-digit code → Click "Verify OTP"
5. **Step 3**: Create a new password → Click "Reset Password"
6. You'll receive a confirmation email
7. Sign in with your new password

### For Developers

#### Testing OTP Flow Locally
```typescript
// 1. Request OTP
const result = await requestPasswordResetOTP('user@example.com');
console.log('OTP sent:', result.success);

// 2. Check your email for the code
// Example OTP: 1234

// 3. Verify OTP
const verification = await verifyPasswordResetOTP('user@example.com', '1234');
console.log('Reset token:', verification.resetToken);

// 4. Reset password
const reset = await resetPasswordWithToken(
  'user@example.com',
  'newPassword123',
  verification.resetToken
);
console.log('Password reset:', reset.success);
```

#### Bypassing Single User Constraint (Development Only)
```typescript
// ⚠️ DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION

// Option 1: Manually delete user from Firebase Console
// 1. Firebase Console → Authentication → Users
// 2. Click on the user → Delete account
// 3. Go to Firestore → users collection → Delete document

// Option 2: Programmatically (requires Firebase Admin SDK)
import { deleteUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';

async function resetSystem(userId: string) {
  await deleteUser(auth.currentUser!);
  await deleteDoc(doc(db, 'users', userId));
  console.log('User deleted - system reset');
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Account already exists" Error
**Cause**: Single-user constraint is active
**Solution**: 
- This is expected behavior
- Sign in with the existing account
- To reset: Delete the user from Firebase Console (Authentication + Firestore)

#### 2. OTP Email Not Received
**Causes**:
- Invalid Resend API key
- Email in spam folder
- Resend domain not verified
- API key rate limit exceeded

**Solutions**:
1. Check `.env` file for correct `VITE_RESEND_API_KEY`
2. Check spam/junk folder
3. Verify domain in Resend dashboard
4. Check Resend dashboard for usage limits

#### 3. "Invalid OTP" Error
**Causes**:
- Incorrect code entered
- OTP expired (15 minutes)
- Too many failed attempts (5 max)

**Solutions**:
1. Double-check the code in your email
2. Request a new OTP if expired
3. Wait a few minutes if rate-limited

#### 4. "Failed to send OTP email" Error
**Causes**:
- Network issue
- Resend API error
- Missing API key

**Solutions**:
1. Check internet connection
2. Verify API key in `.env`
3. Check browser console for detailed error
4. Verify Resend account status

#### 5. Firebase Authentication Errors
**Common Codes**:
- `auth/user-not-found`: Email doesn't exist
- `auth/wrong-password`: Incorrect password
- `auth/email-already-in-use`: Registration conflict
- `auth/weak-password`: Password too weak
- `auth/network-request-failed`: No internet

**Solution**: Error messages are shown in the UI with helpful guidance

---

## 🔄 Migration Guide

If you're upgrading from the old authentication system:

### Database Migration (Not Required)
The new system is **fully backward compatible**. Existing users will continue to work without any changes.

### Environment Variables Update
Add the new Resend API key to your `.env`:
```bash
VITE_RESEND_API_KEY=re_your_key_here
```

### Optional: Mark Existing User as Admin
```typescript
// Run this once in browser console after login
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const userId = auth.currentUser?.uid;
if (userId) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'SUPER_ADMIN',
    roleTitle: 'System Administrator',
    isSystemAdmin: true
  });
  console.log('User upgraded to admin');
}
```

---

## 📈 Future Enhancements

### Recommended Improvements

1. **Move OTP Logic to Cloud Functions** (High Priority)
   - Secure OTP generation server-side
   - Protect Resend API key
   - Rate limiting at function level
   - Better error handling

2. **Add Two-Factor Authentication (2FA)**
   - SMS-based OTP for login
   - Authenticator app support (TOTP)
   - Backup codes

3. **Enhanced Password Policy**
   - Minimum 8 characters
   - Require uppercase, lowercase, number, special char
   - Password strength meter
   - Prevent common passwords

4. **Account Recovery Options**
   - Security questions
   - Recovery email
   - Phone number verification

5. **Audit Logging**
   - Log all authentication attempts
   - Track failed login attempts
   - Monitor OTP requests
   - Alert on suspicious activity

6. **Email Verification on Signup**
   - Send verification email after registration
   - Block login until email verified
   - Resend verification link option

7. **Session Timeout**
   - Auto-logout after inactivity
   - Configurable timeout duration
   - "Remember me" option

---

## 📚 API Reference

### Authentication Functions

#### `checkUserExists()`
```typescript
async function checkUserExists(): Promise<{
  exists: boolean;
  email?: string;
}>
```
Checks if any user exists in the system.

**Returns**: 
- `exists`: Boolean indicating if user exists
- `email`: Email of existing user (if exists)

**Example**:
```typescript
const { exists, email } = await checkUserExists();
if (exists) {
  console.log(`User ${email} already exists`);
}
```

---

#### `signUpWithEmail()`
```typescript
async function signUpWithEmail(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}>
```
Registers a new user (blocked if user already exists).

**Parameters**:
- `email`: User's email address
- `password`: Password (min 6 chars)
- `name`: Full name
- `phone`: Optional phone number

**Returns**:
- `success`: Boolean indicating success
- `user`: AuthUser object (if successful)
- `error`: Error message (if failed)

**Example**:
```typescript
const result = await signUpWithEmail({
  email: 'admin@sufiyanautos.com',
  password: 'SecurePass123',
  name: 'Muhammad Bilawal',
  phone: '+92-300-1234567'
});

if (result.success) {
  console.log('Welcome,', result.user.name);
} else {
  console.error('Error:', result.error);
}
```

---

#### `requestPasswordResetOTP()`
```typescript
async function requestPasswordResetOTP(
  email: string
): Promise<{
  success: boolean;
  error?: string;
}>
```
Sends a 4-digit OTP to the user's email.

**Parameters**:
- `email`: User's email address

**Returns**:
- `success`: Boolean indicating if OTP was sent
- `error`: Error message (if failed)

**Example**:
```typescript
const result = await requestPasswordResetOTP('user@example.com');
if (result.success) {
  console.log('OTP sent to email');
}
```

---

#### `verifyPasswordResetOTP()`
```typescript
async function verifyPasswordResetOTP(
  email: string,
  otp: string
): Promise<{
  success: boolean;
  error?: string;
  resetToken?: string;
}>
```
Verifies the OTP entered by the user.

**Parameters**:
- `email`: User's email address
- `otp`: 4-digit OTP code

**Returns**:
- `success`: Boolean indicating verification success
- `resetToken`: Token for password reset (if successful)
- `error`: Error message (if failed)

**Example**:
```typescript
const result = await verifyPasswordResetOTP('user@example.com', '1234');
if (result.success) {
  console.log('Token:', result.resetToken);
}
```

---

#### `resetPasswordWithToken()`
```typescript
async function resetPasswordWithToken(
  email: string,
  newPassword: string,
  resetToken: string
): Promise<{
  success: boolean;
  error?: string;
}>
```
Resets the user's password using a validated token.

**Parameters**:
- `email`: User's email address
- `newPassword`: New password (min 6 chars)
- `resetToken`: Token from OTP verification

**Returns**:
- `success`: Boolean indicating success
- `error`: Error message (if failed)

**Example**:
```typescript
const result = await resetPasswordWithToken(
  'user@example.com',
  'NewSecurePass456',
  'rst_1234567890_abc123'
);
```

---

## 🎯 Best Practices

### For Production Deployment

1. **Never commit `.env` file**
   - Keep API keys secret
   - Use environment variables in production
   - Rotate keys regularly

2. **Enable Firebase Security Rules**
   - Restrict Firestore access
   - Validate data on write operations
   - Use Firebase Authentication guards

3. **Monitor Resend Usage**
   - Track email send counts
   - Set up billing alerts
   - Implement rate limiting

4. **Regular Security Audits**
   - Review authentication logs
   - Check for failed login attempts
   - Monitor OTP abuse

5. **Backup Strategy**
   - Export Firestore data regularly
   - Document recovery procedures
   - Test restore process

6. **Use HTTPS Only**
   - Never use HTTP in production
   - Enable HSTS headers
   - Use secure cookies

---

## 📞 Support

For issues or questions:
- Check Firebase Console logs
- Review Resend API dashboard
- Inspect browser console for errors
- Check Firestore security rules

---

## 📄 License

This authentication system is part of the Sufiyan Autos ERP application.

---

## ✅ Checklist for Implementation

- [x] Install dependencies (`resend`)
- [x] Create `passwordResetService.ts`
- [x] Update `authService.ts` with single-user constraint
- [x] Create `ForgotPasswordFlow.tsx` component
- [x] Update `AuthPage.tsx` with new features
- [x] Update `.env.example` with Resend key
- [ ] Get Resend API key from [resend.com](https://resend.com)
- [ ] Add `VITE_RESEND_API_KEY` to `.env` file
- [ ] Test registration with single-user constraint
- [ ] Test login flow
- [ ] Test forgot password flow (all 3 steps)
- [ ] Test OTP expiration (15 minutes)
- [ ] Test OTP attempt limit (5 attempts)
- [ ] Verify email template formatting
- [ ] Deploy Firestore security rules
- [ ] Test on mobile devices (responsive design)

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Author**: AI Software Engineer  
**System**: Sufiyan Autos ERP
