# Secure Vercel Deployment Guide - Evee Electric Bike Inventory

## 🔐 Security Issue: Why Resend API Key on Vercel is NOT Safe

**Problem:**
- Vercel environment variables are accessible to all team members
- API keys in Vercel dashboard can be viewed by anyone with project access
- If someone hacks your Vercel account, they get your API key
- Logs may expose the key accidentally

---

## ✅ Secure Solution Options

### **Option 1: Remove Password Reset Feature (Recommended)**
Since you're the only user, password reset via email is unnecessary.

#### Benefits:
- ✅ No API keys needed
- ✅ Completely secure
- ✅ Simpler deployment
- ✅ Zero external dependencies

#### What to Do:
1. Remove password reset functionality
2. If you forget your password, reset it via Firebase Console
3. Deploy without any email service

**This is the MOST secure option for a single-user app.**

---

### **Option 2: Use Firebase Authentication Email (Built-in & Free)**
Firebase provides built-in password reset emails - **NO API KEY NEEDED**.

#### Benefits:
- ✅ No third-party API keys
- ✅ Free forever
- ✅ Firebase handles security
- ✅ Works out of the box

#### Implementation:
```typescript
// src/services/authService.ts
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + '/auth', // Redirect after reset
      handleCodeInApp: false,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

**No backend needed! Works directly from frontend.**

---

### **Option 3: Vercel KV (Key-Value Store) - Secure & Free**
Store temporary OTP codes in Vercel KV instead of sending emails.

#### How It Works:
1. User requests password reset
2. App generates OTP code
3. **Display OTP on screen** (no email needed!)
4. OTP expires in 5 minutes
5. User enters OTP to reset password

#### Benefits:
- ✅ No email service needed
- ✅ No API keys
- ✅ Free up to 256MB
- ✅ Secure serverless storage

---

## 🚀 Recommended Deployment Strategy

### **BEST APPROACH: Firebase + No Email Service**

Since you're the only user:
1. **Remove password reset email feature**
2. **Use Firebase Console** to reset password if needed
3. Deploy securely without any API keys

---

## 📦 How to Deploy on Vercel (Secure Method)

### **Step 1: Remove Sensitive Code**

1. **Delete the password reset API endpoint:**
```bash
Remove-Item api/password-reset.js
```

2. **Update `.env` file** (remove Resend key):
```env
# Firebase Config (Safe to include - these are public)
VITE_FIREBASE_API_KEY=AIzaSyBcxxx...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# ❌ REMOVE THIS - NOT NEEDED
# RESEND_API_KEY=re_xxx...
```

3. **Update `.vercelignore`:**
```
node_modules
.env
.env.local
server.js
api/password-reset.js
*.md
```

### **Step 2: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 3: Login to Vercel**

```bash
vercel login
```

### **Step 4: Deploy to Vercel**

```bash
# First time deployment
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? evee-bike-inventory
# - Directory? ./ (current directory)
# - Override settings? No

# Production deployment
vercel --prod
```

### **Step 5: Configure Vercel Project**

After deployment, the CLI will show your project URL. No environment variables needed!

---

## 🔧 Firebase Security Rules Setup

### **Firestore Security Rules:**
```javascript
// In Firebase Console > Firestore Database > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only authenticated user can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Single user restriction (optional)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **Firebase Storage Rules:**
```javascript
// In Firebase Console > Storage > Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🌐 Project Structure for Vercel

```
evee-electric-bike-inventory/
├── src/                    # React source code
├── dist/                   # Built files (auto-generated)
├── public/                 # Static assets
├── index.html              # Entry point
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── vercel.json             # Vercel config
├── .env                    # Local environment only
└── .vercelignore           # Ignore files
```

### **vercel.json Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📋 Pre-Deployment Checklist

### ✅ Code Preparation:
- [ ] Remove `api/password-reset.js` file
- [ ] Remove Resend API code from frontend
- [ ] Update `.env` to remove `RESEND_API_KEY`
- [ ] Add `.vercelignore` file
- [ ] Test build locally: `npm run build`
- [ ] Test production build: `npm run preview`

### ✅ Firebase Setup:
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Firebase config added to `.env`

### ✅ Vercel Setup:
- [ ] Vercel CLI installed
- [ ] Logged into Vercel account
- [ ] `.vercelignore` configured
- [ ] `vercel.json` present

---

## 🚀 Deployment Commands

### **Local Development:**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000
```

### **Build & Test:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run lint
```

### **Deploy to Vercel:**
```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs
```

---

## 🔐 What's Safe vs Unsafe on Vercel

### ✅ SAFE (Can be in Vercel):
- Firebase API Key (public key)
- Firebase Auth Domain
- Firebase Project ID
- Firebase App ID
- All `VITE_` prefixed variables (public)

### ❌ UNSAFE (NEVER add to Vercel):
- Resend API Key
- Firebase Admin SDK keys
- Database passwords
- Any private API keys
- Payment gateway secrets

---

## 🎯 Recommended Approach for Your App

Since you're the **only user**:

### **Remove Password Reset Completely**

1. **Update `AuthPage.tsx`** - Remove "Forgot Password" link
2. **Delete `api/password-reset.js`**
3. **Remove password reset service code**
4. **Deploy without email service**

### **If You Forget Password:**
1. Go to Firebase Console
2. Authentication > Users
3. Click your email > Reset Password
4. Firebase sends reset email automatically

**This is 100% secure and free!**

---

## 📱 Post-Deployment

After deployment, you'll get a URL like:
```
https://evee-bike-inventory.vercel.app
```

### **Update Firebase Authorized Domains:**
1. Go to Firebase Console
2. Authentication > Settings > Authorized Domains
3. Add your Vercel domain:
   - `evee-bike-inventory.vercel.app`
   - Any custom domain you use

---

## 🐛 Troubleshooting

### **Build Fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### **Firebase Connection Issues:**
Check that all `VITE_` environment variables are set correctly in `.env`

### **404 on Refresh:**
Ensure `vercel.json` has the rewrite rule to `/index.html`

---

## 💡 Summary

**Most Secure Deployment for Your Single-User App:**

1. ❌ Remove password reset email feature
2. ✅ Use Firebase Console to reset password if needed
3. ✅ Deploy to Vercel without ANY API keys
4. ✅ Keep all Firebase config in `.env` (safe - they're public)
5. ✅ Use `.vercelignore` to protect sensitive files

**Commands to Deploy:**
```bash
npm run build
vercel --prod
```

**That's it! No API keys, no security risks, completely free!**

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

---

**Need Help?**
If deployment fails, share the error message and I'll help you fix it!
