# Google Authentication Setup Guide

## Error: "The requested action is invalid"

This error typically occurs when Google Sign-In is not properly configured in Firebase Console. Follow these steps to fix it:

## Step 1: Enable Google Sign-In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **sufiyanautos-4975a**
3. Click on **Authentication** in the left sidebar
4. Go to the **Sign-in method** tab
5. Find **Google** in the list of providers
6. Click on **Google** to expand it
7. Click **Enable** toggle switch
8. Enter a **Project support email** (use your email)
9. Click **Save**

## Step 2: Add Authorized Domains

1. In the Firebase Console, still in **Authentication** → **Settings** tab
2. Scroll down to **Authorized domains**
3. Make sure these domains are added:
   - `localhost` (should be there by default)
   - `sufiyanautos-4975a.firebaseapp.com`
   - If deploying to production, add your production domain

## Step 3: Configure OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **sufiyanautos-4975a**
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. If not configured, click **Configure Consent Screen**
5. Choose **External** (or Internal if you have a Google Workspace)
6. Fill in required fields:
   - **App name**: Sufiyan Autos ERP
   - **User support email**: Your email
   - **Developer contact information**: Your email
7. Add scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
8. Click **Save and Continue**

## Step 4: Verify OAuth Client Configuration

1. Still in Google Cloud Console
2. Go to **APIs & Services** → **Credentials**
3. Find the OAuth 2.0 Client ID for **Web application**
4. Click on it to edit
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `https://sufiyanautos-4975a.firebaseapp.com`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/__/auth/handler`
   - `http://localhost:5173/__/auth/handler`
   - `https://sufiyanautos-4975a.firebaseapp.com/__/auth/handler`
7. Click **Save**

## Step 5: Clear Browser Cache

1. Clear your browser cache and cookies
2. Try signing in with Google again

## Step 6: Test in Incognito/Private Mode

Sometimes browser extensions or cached data can interfere. Try:
1. Open an incognito/private browser window
2. Navigate to your app
3. Try Google sign-in again

## Step 7: Check Browser Console for Detailed Errors

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Try signing in with Google
4. Look for any red error messages
5. Share these errors if the problem persists

## Common Issues & Solutions

### Issue: "This app isn't verified"
- **Solution**: Click on "Advanced" → "Go to [App Name] (unsafe)"
- This is normal for apps in development

### Issue: Popup is blocked
- **Solution**: Allow popups for localhost in your browser settings

### Issue: "redirect_uri_mismatch"
- **Solution**: Make sure the redirect URI in Step 4 matches exactly (including http/https)

## Testing Email/Password Authentication

If Google sign-in still doesn't work, you can test with email/password:
1. In Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** provider
3. Use the "Sign Up" tab in the app to create an account with email/password

## Need More Help?

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Verify all steps above are completed
3. Wait a few minutes after making changes (changes can take time to propagate)
4. Try signing out and clearing all site data, then try again
