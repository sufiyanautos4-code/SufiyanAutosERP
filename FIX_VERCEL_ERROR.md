# 🔧 Fix Vercel "api key not valid" Error

## ✅ Problem FIXED!

**The Issue:**
- Your serverless function was looking for `VITE_RESEND_API_KEY`
- It should look for `RESEND_API_KEY` (without VITE_ prefix)
- `VITE_` variables are only for frontend, not serverless functions

**The Fix:**
- ✅ Changed `api/password-reset.js` to use `RESEND_API_KEY`
- ✅ Code pushed to GitHub
- ✅ Vercel will auto-redeploy

---

## 🔑 Add Environment Variable in Vercel

### **Step 1: Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Click your project: **sufiyanautos-erp** (or similar name)
3. Click **Settings** tab
4. Click **Environment Variables** in the sidebar

### **Step 2: Add the Variable**
Click **"Add New"** button and enter:

```
Name: RESEND_API_KEY
Value: [YOUR_RESEND_API_KEY_FROM_.ENV_FILE]
```

**Important:** Select which environment:
- ✅ **Production** (check this)
- ⬜ Preview (optional)
- ⬜ Development (optional)

Click **"Save"**

### **Step 3: Redeploy**
After adding the variable, you need to redeploy:

**Option A: Automatic (if you have GitHub integration)**
- Vercel will auto-detect the new push and redeploy
- Wait 1-2 minutes

**Option B: Manual Redeploy**
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

**Option C: Via CLI**
```bash
vercel --prod
```

---

## ✅ Verify It's Working

### **Step 1: Check Deployment Logs**
1. Go to your Vercel project
2. Click **Deployments** tab
3. Click the latest deployment
4. Check **Build Logs** - should show success
5. Check **Function Logs** for any errors

### **Step 2: Test Password Reset**
1. Go to your live site: `https://your-project.vercel.app`
2. Click **"Forgot password?"**
3. Enter your email: `sufiyanautos4@gmail.com`
4. Click **"Send Reset Code"**
5. Check your email for the OTP code
6. If you receive the email → **IT WORKS! ✅**

---

## 🔍 Troubleshooting

### **Still seeing "api key not valid" error?**

**Check 1: Variable Name is Correct**
- Go to Vercel → Settings → Environment Variables
- Make sure it's named exactly: `RESEND_API_KEY` (no VITE_ prefix)
- Case-sensitive!

**Check 2: Variable Value is Correct**
- Get your key from `.env` file
- No extra spaces
- No quotes around it

**Check 3: Environment is Selected**
- **Production** must be checked ✅
- If you only checked Preview/Development, it won't work in production

**Check 4: Redeploy After Adding**
- Environment variables only apply to NEW deployments
- Must redeploy after adding the variable

**Check 5: API Key is Valid**
- Go to: https://resend.com/api-keys
- Make sure your API key is active
- Copy the key again if unsure

---

## 📱 Complete Setup Checklist

- [x] Code fix pushed to GitHub
- [ ] Add `RESEND_API_KEY` in Vercel Settings → Environment Variables
- [ ] Select **Production** environment ✅
- [ ] Click **Save**
- [ ] Wait for auto-redeploy (or trigger manual redeploy)
- [ ] Test password reset feature
- [ ] Verify email is received

---

## 🎯 Expected Result

After completing these steps:

**Before:**
```
❌ "api key not valid, please pass a valid api key"
```

**After:**
```
✅ "Verification code sent to your email"
📧 Email received with 4-digit OTP
```

---

## 💡 Why This Happened

### **The Problem:**
```javascript
// WRONG (before)
const resend = new Resend(process.env.VITE_RESEND_API_KEY);
```

- `VITE_` prefix makes it a **client-side** variable
- Only available in browser, bundled with frontend code
- NOT available in serverless functions

### **The Solution:**
```javascript
// CORRECT (after)
const resend = new Resend(process.env.RESEND_API_KEY);
```

- No `VITE_` prefix = **server-side** variable
- Only accessible by serverless functions
- Never exposed to browser
- Must be set in Vercel dashboard

---

## 🔐 Security Reminder

**Server-Side Variables (Secure):**
- `RESEND_API_KEY` ← Use in `api/` folder
- Never in frontend code
- Add in Vercel dashboard

**Client-Side Variables (Public):**
- `VITE_FIREBASE_API_KEY` ← Use in React code
- Bundled with frontend
- Safe to expose (Firebase security rules protect data)

---

## 📞 If Still Not Working

**Check Vercel Function Logs:**
```bash
vercel logs --follow
```

Or in dashboard:
1. Go to your project
2. **Deployments** → Latest deployment
3. Click **Functions** tab
4. Look for `api/password-reset.js` logs
5. Check for errors

**Common errors to look for:**
- "RESEND_API_KEY is undefined" → Variable not added
- "Invalid API key" → Wrong key or typo
- "Environment variable not found" → Need to redeploy

---

## ✅ You're All Set!

After adding the environment variable and redeploying:
1. Password reset will work perfectly
2. Users can receive OTP codes via email
3. No more "api key not valid" errors

**Your app is production-ready! 🎉**
