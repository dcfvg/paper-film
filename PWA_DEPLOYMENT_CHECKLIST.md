# 🚀 PWA Deployment Checklist

Use this checklist when deploying Paper Film to ensure all PWA features work correctly.

## ✅ Pre-Deployment Checks

### 1. Build Verification
- [ ] Run `npm run build` successfully
- [ ] Check `dist/` folder contains:
  - [ ] `sw.js` (service worker)
  - [ ] `manifest.webmanifest` (app manifest)
  - [ ] `offline.html` (offline fallback)
  - [ ] `paper-film-mark.svg` (app icon)
  - [ ] `index.html` (main app)

### 2. Service Worker
- [ ] Service worker version updated in `public/sw.js` (CACHE_NAME)
- [ ] Core assets list is up to date
- [ ] No console errors when registering service worker
- [ ] Service worker activates correctly in DevTools

### 3. Manifest File
- [ ] App name and description are correct
- [ ] Icons are properly defined
- [ ] Theme color matches app design
- [ ] Start URL is correct for your deployment
- [ ] Display mode is set to "standalone"

### 4. HTTPS Requirement
- [ ] Site is served over HTTPS (required for PWA)
- [ ] SSL certificate is valid
- [ ] No mixed content warnings

### 5. Icons & Images
- [ ] App icon loads correctly
- [ ] Icon appears sharp on all devices
- [ ] Apple touch icon defined for iOS
- [ ] Favicon is set

## 🔧 Testing Checklist

### Desktop Testing
- [ ] Open app in Chrome/Edge
- [ ] Install prompt appears
- [ ] Click install - app opens in standalone window
- [ ] App icon appears in system apps
- [ ] Reload app - service worker serves cached content
- [ ] Disconnect internet - app still works offline
- [ ] Reconnect - update notification appears (if version changed)

### Mobile Testing (iOS)
- [ ] Open in Safari
- [ ] Add to Home Screen works
- [ ] App opens fullscreen (no Safari UI)
- [ ] App icon shows on home screen
- [ ] Offline functionality works
- [ ] Splash screen appears on launch

### Mobile Testing (Android)
- [ ] Open in Chrome
- [ ] Install banner appears
- [ ] Install completes successfully
- [ ] App appears in app drawer
- [ ] Offline mode works
- [ ] Notifications work (if applicable)

### Service Worker Testing
- [ ] Open Chrome DevTools → Application → Service Workers
- [ ] Service worker shows as "activated and running"
- [ ] Update on reload works
- [ ] Skip waiting functions correctly
- [ ] Cache storage shows correct assets

### Offline Testing
- [ ] Open app online first (to cache assets)
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Refresh page - app loads from cache
- [ ] Navigation works offline
- [ ] Local features work offline
- [ ] Appropriate message if network-only feature accessed

### Update Testing
- [ ] Change CACHE_NAME version
- [ ] Build and deploy
- [ ] Open app (should show update notification)
- [ ] Click "Update Now"
- [ ] App reloads with new version
- [ ] Old cache cleared

## 🌐 Deployment Steps

### 1. GitHub Pages
```bash
npm run build
# Upload dist/ folder to gh-pages branch
```

Verify:
- [ ] Base URL in `vite.config.ts` matches repo name
- [ ] Service worker paths are correct
- [ ] Manifest start_url is correct

### 2. Netlify/Vercel
```bash
# Build command
npm run build

# Publish directory
dist
```

Configure:
- [ ] Add `_redirects` or `netlify.toml` for SPA routing
- [ ] Set correct Content-Type headers for service worker
- [ ] Enable HTTPS

### 3. Custom Server

Headers to set:
```
Service-Worker-Allowed: /
Content-Type: application/javascript (for sw.js)
Content-Type: application/manifest+json (for manifest.webmanifest)
Cache-Control: no-cache (for sw.js - ensures updates)
```

- [ ] Headers configured correctly
- [ ] Gzip/Brotli compression enabled
- [ ] HTTPS with valid certificate
- [ ] CORS headers if needed

## 📊 Post-Deployment Verification

### Lighthouse Audit
- [ ] Run Lighthouse in Chrome DevTools
- [ ] PWA score should be 100 (or close)
- [ ] Check these categories:
  - [ ] "Registers a service worker"
  - [ ] "Current page responds with 200 when offline"
  - [ ] "Has a web app manifest"
  - [ ] "Configured for a custom splash screen"
  - [ ] "Sets an address-bar theme color"
  - [ ] "Content is sized correctly for the viewport"
  - [ ] "Provides a valid apple-touch-icon"

### PWA Builder Check
- [ ] Go to https://www.pwabuilder.com/
- [ ] Enter your site URL
- [ ] Check PWA score and recommendations
- [ ] Fix any issues reported

### Browser Compatibility
Test on:
- [ ] Chrome (Desktop & Mobile)
- [ ] Safari (Desktop & Mobile)
- [ ] Edge (Desktop)
- [ ] Firefox (Desktop & Mobile)
- [ ] Opera (Desktop & Mobile)

### Performance Metrics
Check in DevTools → Lighthouse:
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] Speed Index < 4s
- [ ] Total Bundle Size < 300KB (gzipped)

## 🐛 Common Issues & Fixes

### Install button not showing
- **Check:** HTTPS enabled
- **Check:** Manifest is valid JSON
- **Check:** Icons are accessible
- **Fix:** Clear cache and hard reload

### Service worker not updating
- **Check:** Cache version changed
- **Check:** Service worker cache-control headers
- **Fix:** Unregister old SW, clear cache

### Offline mode not working
- **Check:** Service worker registered
- **Check:** Assets in cache
- **Fix:** Check fetch event handler logic

### App icon not displaying
- **Check:** Icon paths in manifest
- **Check:** Icon files exist and load
- **Fix:** Use absolute paths for icons

## 📝 Version Bump Process

When releasing a new version:

1. **Update service worker version:**
   ```javascript
   // public/sw.js
   const CACHE_NAME = 'paper-film-v1.0.1'; // Increment this
   ```

2. **Update package.json version:**
   ```json
   "version": "1.0.1"
   ```

3. **Build and test locally:**
   ```bash
   npm run build
   npm run preview
   ```

4. **Deploy to production**

5. **Verify update mechanism:**
   - Open deployed app
   - Wait for update notification
   - Test update flow

## 🎯 Success Criteria

Your PWA deployment is successful when:

- ✅ App can be installed on desktop and mobile
- ✅ Works offline after first load
- ✅ Auto-updates appear when new version deployed
- ✅ Lighthouse PWA score ≥ 90
- ✅ No console errors
- ✅ Fast load times (<3s on 3G)
- ✅ Responsive on all screen sizes
- ✅ App icon displays correctly everywhere

---

**Last updated:** November 2025
**Deployment target:** Production PWA
