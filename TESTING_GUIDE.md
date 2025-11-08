# 🚀 Quick Start - PWA Testing

## Local Development Testing

```bash
# Start dev server (PWA features limited in dev mode)
npm run dev
```

**Note:** Service workers have limited functionality in dev mode. For full PWA testing, use production build.

## Production PWA Testing

### Option 1: Quick Test Script

```bash
./test-pwa.sh
```

This script will:
1. Build the production bundle
2. Show bundle sizes
3. Start a preview server
4. Give you testing instructions

### Option 2: Manual Testing

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

Then open http://localhost:4173 in your browser.

## Testing PWA Features

### 1. Service Worker

**Chrome DevTools:**
1. Press F12 to open DevTools
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. You should see: "Status: activated and is running"

**Test offline:**
1. In Service Workers panel, check **Offline**
2. Refresh the page
3. App should still work!

### 2. Install Prompt

**Desktop (Chrome/Edge):**
1. Wait 3 seconds after page loads
2. Install prompt appears at bottom
3. Click "Install"
4. App opens in standalone window

**Or use browser button:**
1. Look for ⊕ icon in address bar
2. Click it to install

### 3. Manifest

**Check in DevTools:**
1. Application tab → Manifest
2. Verify all fields are populated
3. Check that icons load

### 4. Offline Mode

**Test fully offline:**
1. Load the app once (online)
2. DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload page
5. App should work from cache!

### 5. Update Flow

**Test auto-update:**
1. With app running, change CACHE_NAME in `public/sw.js`
2. Run `npm run build`
3. Refresh the app
4. Update notification should appear
5. Click "Update Now"
6. App reloads with new version

## Lighthouse Audit

```bash
# Build first
npm run build
npm run preview
```

Then in Chrome:
1. F12 → Lighthouse tab
2. Select "Progressive Web App"
3. Click "Generate report"
4. Aim for 100/100!

## Production Deployment

See `PWA_DEPLOYMENT_CHECKLIST.md` for complete deployment guide.

### Quick Deploy (GitHub Pages)

```bash
# Build
npm run build

# Deploy dist/ folder to gh-pages branch
```

### Quick Deploy (Netlify)

```bash
# Build command: npm run build
# Publish directory: dist
```

## Troubleshooting

### Install button doesn't appear?
- **Fix:** Must use HTTPS or localhost
- **Check:** Manifest loads correctly
- **Clear:** Browser cache and reload

### Service worker not registering?
- **Check:** Console for errors
- **Verify:** sw.js file exists in dist/
- **Clear:** Application → Storage → Clear site data

### Offline mode not working?
- **Wait:** Let service worker install fully
- **Check:** Assets are cached (Application → Cache Storage)
- **Verify:** Fetch events are handled in sw.js

### Updates not appearing?
- **Change:** CACHE_NAME version
- **Build:** Fresh build
- **Clear:** Old caches in DevTools

## Browser Testing Checklist

- [ ] Chrome (desktop)
- [ ] Edge (desktop)
- [ ] Safari (desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

## Files to Check

When debugging:
- `public/sw.js` - Service worker logic
- `public/manifest.webmanifest` - App configuration
- `src/components/PWAInstallPrompt.tsx` - Install UI
- `src/components/PWAUpdatePrompt.tsx` - Update UI
- `src/main.tsx` - Service worker registration

## Useful Console Commands

```javascript
// Check service worker status
navigator.serviceWorker.ready.then(reg => console.log(reg));

// Force update check
navigator.serviceWorker.ready.then(reg => reg.update());

// See all caches
caches.keys().then(keys => console.log(keys));

// Clear all caches (testing)
caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));

// Check if installed
window.matchMedia('(display-mode: standalone)').matches;
```

## Success Indicators

You've successfully implemented PWA when:

- ✅ Service worker shows as "activated"
- ✅ Install prompt appears (or browser shows install button)
- ✅ App works offline after first load
- ✅ Lighthouse PWA score is 100
- ✅ App can be installed on desktop
- ✅ App can be added to mobile home screen
- ✅ Updates work automatically
- ✅ No console errors

## Next Steps

1. Test locally with `./test-pwa.sh`
2. Run Lighthouse audit
3. Fix any issues
4. Deploy to production (see `PWA_DEPLOYMENT_CHECKLIST.md`)
5. Test on real devices

---

**Ready to test? Run `./test-pwa.sh` to get started!** 🚀
