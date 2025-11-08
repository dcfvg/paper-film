# 📱 Progressive Web App (PWA) Features

Paper Film is a fully-featured Progressive Web App that provides a native app-like experience on desktop and mobile devices.

## 🌟 What is a PWA?

A Progressive Web App combines the best of web and native apps. You can:

- Install it like a regular app
- Use it offline
- Get automatic updates
- Access it from your home screen or app launcher

## 💾 Installation

### Desktop Installation

**Chrome, Edge, Brave, Opera:**

1. Open Paper Film in your browser
2. Look for the install icon (⊕) in the address bar, OR
3. Wait for the install prompt to appear at the bottom of the screen
4. Click "Install" and Paper Film will be added to your apps

**Safari (macOS Sonoma+):**

1. Open Paper Film in Safari
2. Click File → Add to Dock
3. Paper Film appears in your Dock and Applications folder

### Mobile Installation

**iOS (Safari):**

1. Open Paper Film in Safari
2. Tap the Share button (□↑ icon)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. Paper Film appears on your home screen

**Android (Chrome):**

1. Open Paper Film in Chrome
2. Tap the three-dot menu (⋮)
3. Tap "Add to Home screen" or "Install app"
4. Tap "Install"
5. Paper Film appears in your app drawer

## ✨ PWA Features

### 🔌 Offline Support

Once installed, Paper Film works completely offline:

- All core functionality available without internet
- Process videos already on your device
- Export to print or design packages
- Settings saved locally

**Note:** Initial installation requires internet connection.

### 🔄 Auto-Updates

Paper Film updates automatically in the background:

- No manual downloads or installations
- Updates check hourly
- Notification appears when new version is ready
- Click "Update Now" to get the latest features
- Or dismiss and update later

### 💾 Local Storage

Your preferences persist across sessions:

- Print layout settings
- Column count and formatting
- Subtitle alignment preferences
- All settings saved to your device

### 🚀 Performance Benefits

- **Faster loading:** Cached assets load instantly
- **Native feel:** Runs in standalone window without browser UI
- **App switching:** Appears in your taskbar/app switcher
- **Better integration:** Desktop notifications, file handling

## 🛠️ Technical Details

### Service Worker

Paper Film uses a sophisticated caching strategy:

- **Core assets:** Cached on install for offline access
- **Runtime caching:** Images and scripts cached as used
- **Network-first strategy:** Always tries to fetch latest content
- **Cache fallback:** Serves cached content when offline

### Manifest Configuration

The app manifest defines:

- App name and description
- Icons for all platforms
- Theme colors
- Display mode (standalone)
- Orientation support
- Shortcuts for quick actions

## 🔧 Development

### Testing PWA Features

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Then open in Chrome and use DevTools:

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Service Workers" and "Manifest"
4. Test offline mode in "Service Workers" section

### Updating Service Worker

When you make changes:

1. Update the version in `public/sw.js`
2. Build and deploy
3. Users get update notification automatically

### Cache Management

Clear all caches programmatically:

```javascript
caches.keys().then((keys) => {
  keys.forEach((key) => caches.delete(key));
});
```

## 📊 Browser Support

| Browser | Desktop | Mobile | Offline | Install |
| ------- | ------- | ------ | ------- | ------- |
| Chrome  | ✅      | ✅     | ✅      | ✅      |
| Edge    | ✅      | ✅     | ✅      | ✅      |
| Safari  | ✅      | ✅     | ✅      | ✅      |
| Firefox | ✅      | ✅     | ✅      | ⚠️\*    |
| Opera   | ✅      | ✅     | ✅      | ✅      |

\*Firefox supports PWAs but install experience varies by version.

## 🔍 Troubleshooting

### Install button not appearing?

- Make sure you're using HTTPS (or localhost)
- Check that manifest.webmanifest is loading
- Clear browser cache and reload
- Try a different browser

### Offline mode not working?

- Ensure service worker is registered (check DevTools)
- Check console for service worker errors
- Clear site data and reinstall
- Verify network tab shows cached resources

### Updates not installing?

- Check browser console for update errors
- Manually refresh the service worker in DevTools
- Clear cache and reinstall the app
- Check that you're online during update

### Uninstalling the PWA

**Desktop:**

- Right-click the app icon → Uninstall
- Or: Browser settings → Apps → Manage apps → Uninstall

**Mobile:**

- Long-press the app icon → Uninstall/Remove
- Or: Device settings → Apps → Paper Film → Uninstall

## 📚 Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox (Service Worker toolkit)](https://developers.google.com/web/tools/workbox)

## 🎯 Best Practices

1. **Always version your cache names** when updating service worker
2. **Test offline functionality** before deploying
3. **Keep service worker simple** - complex logic can cause issues
4. **Monitor update notifications** - don't overwhelm users
5. **Provide clear install prompts** - explain the benefits
6. **Handle errors gracefully** - offline state should be obvious

---

**Enjoy Paper Film as a native-like experience on any device! 📱✨**
