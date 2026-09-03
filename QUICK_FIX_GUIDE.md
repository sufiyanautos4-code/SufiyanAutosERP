# 🚀 Quick Fix Guide - Google Sign-In Error

## ❌ Error: "The requested action is invalid"

This means **Google Sign-In is not enabled** in your Firebase project.

---

## ✅ Quick 5-Minute Fix

### 1️⃣ Open Firebase Console
```
https://console.firebase.google.com/project/sufiyanautos-4975a/authentication/providers
```

### 2️⃣ Enable Google Provider
- Click on **Google** in the list
- Toggle **Enable** to ON
- Enter your email in "Project support email"
- Click **Save**

### 3️⃣ Verify Authorized Domains
```
https://console.firebase.google.com/project/sufiyanautos-4975a/authentication/settings
```
- Check that `localhost` is in the list (should be there)
- Add `sufiyanautos-4975a.firebaseapp.com` if missing

### 4️⃣ Test It
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh your app
- Try Google Sign-In again

---

## 🔍 Still Not Working?

### Check Browser Console
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for the automatic debug output (shows with 🔥 emoji)
4. It will tell you exactly what's missing

### Common Issues

| Error Message | Solution |
|--------------|----------|
| "unauthorized-domain" | Add current domain in Firebase Console → Authentication → Settings |
| "operation-not-allowed" | Enable Google provider in Firebase Console |
| "popup-blocked" | Allow popups for localhost in browser settings |

---

## 🎯 Alternative: Use Email/Password (While Fixing Google)

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** provider
3. Use "Sign Up" tab in your app
4. Create account with email and password

This works immediately without OAuth configuration!

---

## 📞 Need More Help?

- See **GOOGLE_AUTH_SETUP.md** for detailed setup steps
- See **FIXES_APPLIED.md** for technical details
- Check browser console - it shows helpful debug information

---

## ✨ After Fixing

Once Google Sign-In is configured:
- Sign in with any Google account
- Your profile is automatically created in Firestore
- All inventory data is synced to cloud
- Multi-user support works automatically
