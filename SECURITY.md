# Security Guidelines

## ✅ Security Checklist

### Environment Variables
- [x] All sensitive credentials moved to `.env` file
- [x] `.env` file added to `.gitignore`
- [x] `.env.example` created as template (without real credentials)
- [x] Hardcoded API keys removed from source code
- [x] Hardcoded backend URLs removed from source code

### Files Protected
- **`.env`** - Contains actual API keys and URLs (gitignored)
- **Razorpay Key**: `REACT_APP_RAZORPAY_KEY_ID`
- **Backend URL**: `REACT_APP_API_URL`

### What's Safe to Commit
✅ `.env.example` - Template with placeholder values
✅ `src/App.tsx` - No hardcoded secrets
✅ `TECH_STACK.md` - Generic examples only
✅ `README.md` - Setup instructions

### What's NOT Safe to Commit
❌ `.env` - Contains real API keys
❌ Any file with actual Razorpay keys
❌ Any file with production URLs containing sensitive info

## 🔐 Before Pushing to GitHub

1. **Verify `.env` is gitignored:**
   ```bash
   git check-ignore -v .env
   ```
   Should output: `.gitignore:20:.env    .env`

2. **Check for accidentally committed secrets:**
   ```bash
   git status
   ```
   Ensure `.env` is NOT in the list

3. **Search for hardcoded secrets:**
   ```bash
   grep -r "rzp_test_" src/
   grep -r "rzp_live_" src/
   ```
   Should return no results

## 🚨 If You Accidentally Committed Secrets

1. **Immediately rotate/regenerate the exposed keys:**
   - Go to Razorpay Dashboard → Settings → API Keys
   - Generate new keys
   - Update your `.env` file

2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (if already pushed):**
   ```bash
   git push origin --force --all
   ```

## 📋 Environment Variables Reference

### Frontend (.env)
```env
# Backend API URL - Update with your deployed backend
REACT_APP_API_URL=https://your-backend-url.com/api

# Razorpay API Key - Get from Razorpay Dashboard
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

### Where to Get Keys

**Razorpay API Key:**
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test Mode or Live Mode keys
4. Copy the "Key ID" (starts with `rzp_test_` or `rzp_live_`)

**Backend URL:**
- Development: `http://localhost:3001/api`
- Production: Your deployed backend URL (e.g., Render, Heroku, etc.)

## 🛡️ Best Practices

1. **Never commit `.env` files**
2. **Always use `.env.example` as template**
3. **Rotate keys periodically**
4. **Use different keys for development and production**
5. **Enable 2FA on Razorpay account**
6. **Monitor Razorpay dashboard for suspicious activity**
7. **Use test keys during development**
8. **Only use live keys in production**

## 🔍 Regular Security Audits

Run these commands periodically:

```bash
# Check for exposed secrets in code
grep -r "rzp_" src/ --exclude-dir=node_modules

# Verify gitignore is working
git status --ignored

# Check what would be committed
git add -n .
```

## 📞 Security Incident Response

If you suspect a security breach:

1. **Immediately revoke compromised keys** in Razorpay Dashboard
2. **Generate new keys**
3. **Update environment variables** in all environments
4. **Review recent transactions** for suspicious activity
5. **Document the incident**
6. **Update this document** with lessons learned

---

**Last Security Review**: October 2025  
**Next Review Due**: Monthly
