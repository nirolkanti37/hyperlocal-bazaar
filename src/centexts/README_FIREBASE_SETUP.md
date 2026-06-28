# Hyperlocal Bazaar - Firebase Setup & reCAPTCHA Fix

## 📁 Files Included

| File | Description |
|------|-------------|
| `firebase.js` | Firebase initialization with all services |
| `authService.js` | Auth service with **fixed reCAPTCHA** |
| `LoginPage.jsx` | Login page with invisible reCAPTCHA |
| `AuthContext.jsx` | Auth state management |
| `ProtectedRoute.jsx` | Route guard |
| `ThemeContext.jsx` | Dark mode context |
| `ThemeToggle.jsx` | Dark mode toggle button |
| `main.jsx` | App entry point with providers |
| `App.jsx` | Router setup |
| `index.css` | Global styles with dark mode |
| `tailwind.config.js` | Tailwind config with custom theme |

---

## 🔧 reCAPTCHA Problem - Solved!

### Common Issues Fixed:

1. **"reCAPTCHA not initialized"** - Fixed by proper initialization timing
2. **"Invalid or expired token"** - Fixed by resetting reCAPTCHA on errors
3. **reCAPTCHA badge showing** - Hidden with CSS
4. **Resend OTP not working** - Fixed by resetting verifier

### Key Fixes in `authService.js`:

```javascript
// 1. Proper invisible reCAPTCHA setup
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  // Clean up existing verifier first
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response) => {
      console.log('reCAPTCHA verified:', response);
    },
    'expired-callback': () => {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  });

  // Must call render()
  window.recaptchaVerifier.render();
  return window.recaptchaVerifier;
};

// 2. Reset function for resend OTP
export const resetRecaptcha = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};
```

### Key Fixes in `LoginPage.jsx`:

```jsx
// Invisible container - MUST be in DOM
<div id="recaptcha-container" className="absolute opacity-0 pointer-events-none" style={{ zIndex: -1 }}></div>

// Initialize on mount with delay
useEffect(() => {
  setTimeout(() => {
    setupRecaptcha('recaptcha-container');
    setRecaptchaReady(true);
  }, 500);
}, []);

// Reset on error
const handleResendOTP = async () => {
  resetRecaptcha();
  setupRecaptcha('recaptcha-container');
  await sendOTP(phoneNumber);
};
```

---

## 🚀 Firebase Console Setup

### 1. Enable Phone Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hiperlocalbazer`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Phone** provider

### 2. Add Authorized Domains
1. In Authentication → Settings → Authorized domains
2. Add your domains:
   - `localhost` (for development)
   - `127.0.0.1` (alternative localhost)
   - Your production domain (e.g., `yourdomain.com`)

### 3. reCAPTCHA Enterprise (Optional)
If using reCAPTCHA Enterprise:
1. Go to **Authentication** → **Settings** → **App verification**
2. Enable/disable reCAPTCHA Enterprise as needed
3. For testing, you can disable app verification

### 4. Test Phone Numbers (Development)
1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Add test phone numbers:
   - Phone: `+8801700000000`
   - Code: `123456`

---

## 📦 Installation

```bash
npm install firebase react-router-dom lucide-react react-hot-toast
```

---

## 🗂️ Folder Structure

```
src/
├── firebase.js          # Firebase config
├── main.jsx             # Entry point
├── App.jsx              # Router
├── index.css            # Global styles
├── services/
│   └── authService.js   # Auth + reCAPTCHA
├── contexts/
│   ├── AuthContext.jsx  # Auth state
│   └── ThemeContext.jsx # Dark mode
├── components/
│   ├── ui/              # UI components
│   ├── ProtectedRoute.jsx
│   └── ThemeToggle.jsx
└── pages/
    ├── LoginPage.jsx
    ├── HomePage.jsx
    ├── SellPage.jsx
    └── ...
```

---

## ⚠️ Important Notes

1. **reCAPTCHA container MUST exist in DOM** - Even invisible mode needs a container div
2. **Always call `.render()`** - After creating RecaptchaVerifier
3. **Reset on errors** - Clear and recreate verifier on OTP errors
4. **Bangladesh format** - Phone numbers auto-formatted with +88
5. **Dark mode** - Toggle with `ThemeToggle` component

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `auth/captcha-check-failed` | Reset reCAPTCHA and try again |
| `auth/invalid-phone-number` | Check phone format (01XXXXXXXXX) |
| `auth/too-many-requests` | Wait a few minutes before retrying |
| reCAPTCHA badge visible | CSS hides it automatically |
| OTP not received | Check Firebase console logs |

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Phone auth enabled in console
- [ ] Authorized domains added
- [ ] `firebase.js` config matches console
- [ ] reCAPTCHA container in LoginPage
- [ ] Test phone numbers added (for dev)
- [ ] Dark mode working
- [ ] OTP resend working
