# Quick Authentication Setup Guide

## 🚀 5-Minute Setup

### Step 1: Get Resend API Key (2 minutes)

1. Visit [resend.com](https://resend.com) and create a free account
2. Click **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "Sufiyan Autos ERP")
5. Copy the key (starts with `re_`)

### Step 2: Add to Environment Variables (1 minute)

1. Open your `.env` file (or create one from `.env.example`)
2. Add this line:
   ```bash
   VITE_RESEND_API_KEY=re_your_actual_key_here
   ```
3. Save the file

### Step 3: Restart Dev Server (1 minute)

```bash
npm run dev
```

### Step 4: Test the System (1 minute)

1. Open http://localhost:3000
2. You should see the login page
3. Try creating an account (first user only!)
4. Try the "Forgot Password" flow

---

## 🔧 Configuration Options

### Email Configuration (Optional)

To use your own domain for emails:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `sufiyanautos.com`)
4. Add the DNS records provided
5. Update the email sender in `passwordResetService.ts`:
   ```typescript
   from: 'Sufiyan Autos <noreply@yourdomain.com>'
   ```

### Customization Options

Edit `passwordResetService.ts` to customize:

```typescript
const OTP_EXPIRY_MINUTES = 15;  // Change OTP expiration time
const MAX_ATTEMPTS = 5;         // Change max verification attempts
```

---

## ✅ Verification Checklist

- [ ] Resend API key added to `.env`
- [ ] Dev server restarted
- [ ] Can access login page
- [ ] Can create first account (signup works)
- [ ] Cannot create second account (shows warning)
- [ ] Can log in with email/password
- [ ] Can request password reset OTP
- [ ] Receive OTP email within seconds
- [ ] Can verify OTP and reset password
- [ ] Can log in with new password

---

## 🐛 Common Issues

### "Email service not configured"
**Solution**: Add `VITE_RESEND_API_KEY` to `.env` and restart server

### OTP email not received
**Solutions**:
1. Check spam folder
2. Verify API key is correct
3. Check Resend dashboard for errors
4. Ensure email address is valid

### "Account already exists"
**This is normal!** The system only allows ONE admin account. To reset:
1. Go to Firebase Console → Authentication → Users → Delete user
2. Go to Firestore → users collection → Delete document
3. Now you can create a new account

---

## 📚 Full Documentation

See `AUTH_SYSTEM_REDESIGN.md` for complete technical documentation including:
- Architecture details
- Security features
- API reference
- Database schema
- Email template
- Troubleshooting guide
- Migration instructions

---

## 🎯 Quick Test Script

Open browser console and run:

```javascript
// Test OTP flow (after entering email on forgot password page)
const email = 'test@example.com';

// 1. Request OTP
await requestPasswordResetOTP(email);
// Check your email

// 2. Verify OTP (replace 1234 with actual code)
const result = await verifyPasswordResetOTP(email, '1234');
console.log('Token:', result.resetToken);

// 3. Reset password
await resetPasswordWithToken(email, 'newpass123', result.resetToken);
```

---

## 🔒 Security Notes

- **Never commit `.env` file** to git
- **Keep API keys secret** - don't share them
- **Use HTTPS in production** - HTTP is insecure
- **Monitor email usage** - Resend has limits
- **Regular backups** - Export Firestore data periodically

---

## 📞 Need Help?

1. Check the console for detailed error messages
2. Review Firebase Console logs
3. Check Resend API dashboard
4. See `AUTH_SYSTEM_REDESIGN.md` for detailed troubleshooting

---

**Ready to Go!** 🎉

Your authentication system now includes:
✅ Single-user constraint (ONE admin only)
✅ OTP-based password reset (4-digit code)
✅ Professional email notifications
✅ Secure session management
✅ Enhanced security features
