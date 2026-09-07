# 🎯 Vercel Environment Variable Setup - Step by Step

## 📋 Quick Summary

**What to add:**
```
Name: RESEND_API_KEY
Value: [YOUR_RESEND_API_KEY_FROM_.ENV]
Environment: Production ✓
```

---

## 🖼️ Visual Step-by-Step Guide

### **Step 1: Go to Vercel Dashboard**
```
https://vercel.com/dashboard
```

### **Step 2: Click Your Project**
Look for: **sufiyanautos-erp** or **SufiyanAutosERP**

### **Step 3: Click "Settings" Tab**
```
[Overview] [Deployments] [Analytics] [Logs] [→ Settings ←]
```

### **Step 4: Click "Environment Variables"**
Left sidebar:
```
General
  Domains
  Git
  [→ Environment Variables ←]
  Functions
  ...
```

### **Step 5: Click "Add New" Button**
You'll see a form like this:

```
┌─────────────────────────────────────────────┐
│  Add New Environment Variable               │
├─────────────────────────────────────────────┤
│                                             │
│  Name (required)                            │
│  ┌─────────────────────────────────────┐   │
│  │ RESEND_API_KEY                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Value (required)                           │
│  ┌─────────────────────────────────────┐   │
│  │ [YOUR_RESEND_API_KEY]              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Environments (select at least one)         │
│  ☑ Production                               │
│  ☐ Preview                                  │
│  ☐ Development                              │
│                                             │
│  [Cancel]  [Save]                           │
└─────────────────────────────────────────────┘
```

### **Step 6: Fill in the Form**

**Name field:**
```
RESEND_API_KEY
```
⚠️ **IMPORTANT:** 
- NO `VITE_` prefix!
- Must be exactly `RESEND_API_KEY`
- Case-sensitive

**Value field:**
```
[YOUR_RESEND_API_KEY_FROM_.ENV]
```
⚠️ **IMPORTANT:**
- No spaces
- No quotes
- Just the key itself

**Environments:**
```
✅ Production  ← Check this!
☐ Preview
☐ Development
```

### **Step 7: Click "Save"**
The variable will be saved and you'll see it in the list.

### **Step 8: Redeploy**
⚠️ **CRITICAL:** Environment variables only apply to NEW deployments!

**Option A: Wait for Auto-Redeploy**
- If you have GitHub integration
- Vercel will auto-deploy the latest push
- Wait 1-2 minutes

**Option B: Manual Redeploy**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots menu)
4. Click **"Redeploy"**
5. Confirm the redeploy

**Option C: CLI Redeploy**
```bash
vercel --prod
```

---

## ✅ How to Verify It's Added

### **Check in Vercel Dashboard:**
Go to: Settings → Environment Variables

You should see:
```
┌──────────────────┬─────────────────────┬────────────────┐
│ Name             │ Value               │ Environments   │
├──────────────────┼─────────────────────┼────────────────┤
│ RESEND_API_KEY   │ ••••••••••••••••••  │ Production     │
└──────────────────┴─────────────────────┴────────────────┘
```

**Good signs:**
- ✅ Name shows `RESEND_API_KEY` (no VITE_)
- ✅ Value shows dots (`••••••••••`) - hidden for security
- ✅ Production is listed
- ✅ You can click the eye icon 👁️ to reveal the value

---

## 🧪 Test If It's Working

### **Test 1: Check Deployment**
1. Go to **Deployments** tab
2. Click latest deployment
3. Look for "Ready" status with ✅ green checkmark

### **Test 2: Try Password Reset**
1. Open your live site
2. Go to sign-in page
3. Click **"Forgot password?"**
4. Enter email: `sufiyanautos4@gmail.com`
5. Click **"Send Reset Code"**

**Expected result:**
```
✅ Success message: "Verification code sent to your email"
📧 You receive an email with a 4-digit code
```

**If it works:**
🎉 **Perfect! Your environment variable is set up correctly!**

**If it still shows error:**
```
❌ "api key not valid"
```
→ Check troubleshooting section below

---

## 🔍 Troubleshooting

### **Error: "api key not valid"**

**Cause 1: Variable not added yet**
- Go to Settings → Environment Variables
- Make sure `RESEND_API_KEY` is in the list

**Cause 2: Typo in variable name**
- Must be exactly: `RESEND_API_KEY`
- NOT: `VITE_RESEND_API_KEY`
- NOT: `resend_api_key` (wrong case)

**Cause 3: Wrong value**
- Get your key from `.env` file
- Check for extra spaces
- Check for copy-paste errors

**Cause 4: Production not selected**
- Make sure "Production" checkbox is ✅ checked
- If only Preview/Development is checked, won't work in production

**Cause 5: Haven't redeployed yet**
- Environment variables only apply to NEW deployments
- Must redeploy after adding the variable
- Wait for deployment to finish (usually 1-2 minutes)

**Cause 6: API key is invalid**
- Go to: https://resend.com/api-keys
- Check if your key is active
- Try creating a new key if needed

---

## 📝 Complete Checklist

Before testing:
- [ ] Code fix pushed to GitHub (`api/password-reset.js` updated)
- [ ] Vercel project opened in browser
- [ ] Settings → Environment Variables page open
- [ ] Variable added: `RESEND_API_KEY`
- [ ] Value pasted from `.env` file
- [ ] Production environment selected ✅
- [ ] Clicked "Save"
- [ ] Redeployed the project
- [ ] Deployment shows "Ready" status

After setup:
- [ ] Opened live site
- [ ] Tried password reset
- [ ] Email received successfully
- [ ] OTP code works

---

## 🎯 Expected Timeline

```
0:00 - Add environment variable in Vercel
0:01 - Click Save
0:02 - Trigger redeploy (or wait for auto-deploy)
0:03 - Vercel starts building
1:00 - Build completes
1:30 - Deployment ready
2:00 - Test password reset
2:30 - Email received!
```

**Total time: ~2-3 minutes**

---

## 💡 Pro Tips

### **Tip 1: Use Preview Environment for Testing**
When adding the variable, also check "Preview":
```
✅ Production
✅ Preview  ← Also check this
☐ Development
```
This lets you test in preview deployments before going live.

### **Tip 2: Check Function Logs**
If something's not working:
1. Go to Deployments → Latest deployment
2. Click "Functions" tab
3. Find `api/password-reset.js`
4. Click to see logs
5. Look for errors

### **Tip 3: Test Locally First**
Before deploying, test locally:
```bash
# Create .env.local file (not tracked by Git)
echo "RESEND_API_KEY=YOUR_KEY_HERE" > .env.local

# Run local dev server
npm run dev:all

# Test password reset at localhost:3000
```

---

## 🔐 Security Notes

**Why the value shows dots (••••):**
- Vercel hides environment variables for security
- Only you can see the actual value (by clicking eye icon 👁️)
- Not visible in logs or network requests
- Only accessible by serverless functions

**Why NO VITE_ prefix:**
- `VITE_` variables are bundled into frontend code
- Anyone can see them in browser dev tools
- `RESEND_API_KEY` (no prefix) stays on server
- Never sent to browser

**This is 100% secure! ✅**

---

## ✅ Success Confirmation

After setup, you should see:

**In Vercel Dashboard:**
```
Environment Variables (1)
RESEND_API_KEY  ••••••••••  Production
```

**In Your App:**
```
User clicks "Forgot Password"
  ↓
Enters email and clicks "Send"
  ↓
"Verification code sent to your email" ✅
  ↓
Email arrives with 4-digit OTP code
  ↓
User enters OTP
  ↓
"Verification successful" ✅
  ↓
User creates new password
  ↓
"Password reset successful" ✅
```

**Everything works! 🎉**

---

## 📞 Need Help?

**Check Vercel Logs:**
```bash
vercel logs --follow
```

**Or in browser:**
1. Vercel Dashboard → Your Project
2. Deployments → Latest
3. Functions → `api/password-reset.js`
4. Read error messages

**Common errors explained:**
- "RESEND_API_KEY is undefined" → Not added yet
- "Invalid API key" → Typo in value
- "Function timeout" → Resend API might be down

---

## 🎉 You're Done!

Once you see the environment variable in Vercel and redeploy, the password reset feature will work perfectly!

**Your app is now production-ready with secure password reset! ✅**
