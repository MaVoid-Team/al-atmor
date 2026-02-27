# PWA Testing & APK Generation Guide

## ✅ Implementation Complete

Your Next.js app has been successfully converted to a Progressive Web App (PWA). All components are in place and ready for testing.

---

## 🎯 What Was Implemented

### 1. **PWA Core Files**
- ✅ `manifest.json` - App metadata for installability
- ✅ PWA icons (192x192, 512x512, maskable variants)
- ✅ Service worker configuration via `next-pwa`
- ✅ Offline fallback pages (`/[locale]/offline`, `/[locale]/install`)

### 2. **Configuration Updates**
- ✅ `next.config.ts` - PWA plugin with cache strategies
- ✅ `app/[locale]/layout.tsx` - PWA metadata and viewport config
- ✅ `package.json` - Added `next-pwa` dependency

### 3. **Cache Strategies Configured**
- **Products & Categories**: Cache First (24 hours) - Browse offline
- **Orders**: Network First (5 min cache) - View order history offline
- **User Profile**: Stale While Revalidate - Profile data available offline
- **Images**: Cache First (30 days) - Fast image loading
- **Static Assets**: Cache First (1 year) - Optimal performance

---

## 🧪 Testing Locally

### Step 1: Build & Start Production Server

```bash
cd frontend
npm run build
npm start
```

The server will run on **http://localhost:3000**.

### Step 2: Open in Browser

1. Open **Chrome** or **Edge** (recommended for PWA testing)
2. Navigate to `http://localhost:3000/en`
3. Open **DevTools** (F12)

### Step 3: Verify PWA Components

#### **A. Check Application Tab**

1. Go to **DevTools → Application**
2. **Manifest**:
   - Verify `manifest.json` loads without errors
   - Check icons display correctly (192x192, 512x512)
   - Confirm app name: "Al-Atmor"
3. **Service Workers**:
   - Should see `sw.js` registered and activated
   - Status: ✅ Activated and running
4. **Storage**:
   - Cache Storage should show multiple caches:
     - `api-cache-products`
     - `api-cache-orders`
     - `api-cache-user`
     - `image-cache`
     - `static-cache`

#### **B. Lighthouse Audit**

1. **DevTools → Lighthouse**
2. Select:
   - Categories: **Performance, PWA**
   - Device: **Mobile**
3. Click **Analyze page load**
4. **Expected scores**:
   - PWA: **90+** (should pass all installability checks)
   - Performance: **80+** (depending on your backend API)

#### **C. Install Prompt**

1. Look for **install icon** in Chrome's address bar (⊕ or ⬇)
2. Click it to install the app
3. App should open in standalone window (no browser UI)
4. **Verify**:
   - App icon appears in taskbar/dock
   - No address bar or browser controls
   - Theme color applied

### Step 4: Test Offline Functionality

1. **Browse some pages** while online:
   - Products: `/en/products`
   - Categories: `/en/categories`
   - Your orders: `/en/orders` (if logged in)
   - Profile: `/en/profile`

2. **Go Offline**:
   - DevTools → Network tab → Toggle "Offline" checkbox
   - Or: DevTools → Application → Service Workers → Offline checkbox

3. **Test Offline Behavior**:
   - ✅ Previously loaded products should still display
   - ✅ Cached images should load
   - ✅ Order history should load from cache
   - ✅ Profile data should be accessible
   - ✅ Uncached pages redirect to `/offline` page
   - ✅ Offline page shows helpful message

4. **Go Back Online**:
   - Uncheck "Offline"
   - Navigate to a product page
   - Cache should update with fresh data

---

## 📱 Generating APK via PWA Builder

### Prerequisites
- Your PWA must be **deployed to a live HTTPS domain**
- Service worker and manifest must be publicly accessible
- Example: `https://al-atmor.com` or `https://yourdomain.com`

### Step 1: Deploy Your PWA

Deploy the built app to your hosting (Vercel, Netlify, etc.):

```bash
# If using Vercel
cd frontend
vercel --prod

# Or deploy to your server
npm run build
# Upload the `.next` folder and `public` folder to your server
```

**Important**: Ensure your deployed site is accessible via HTTPS.

### Step 2: Use PWA Builder

1. Go to **[PWA Builder](https://www.pwabuilder.com/)**

2. **Enter your URL**:
   ```
   https://yourdomain.com
   ```
   (Replace with your actual domain)

3. Click **Start** and wait for analysis

4. **Review the report**:
   - Manifest: ✅ Should pass
   - Service Worker: ✅ Should pass
   - Security: ✅ HTTPS required
   - Icons: ✅ Should recognize all sizes

5. **Package Options**:
   - Click **Package for Stores**
   - Select **Android**
   - Choose **Signed APK** or **AAB (Android App Bundle)**

6. **Configure Android Package**:
   - **Package ID**: `com.al-atmor.app` (or your preference)
   - **App Name**: `Al-Atmor`
   - **Version**: `1.0.0`
   - **Icon**: Will use manifest icons automatically
   - **Launch Mode**: `standalone`
   - **Fallback behavior**: `Offline page`

7. **Download APK**:
   - Click **Generate**
   - Download the APK file
   - Extract the ZIP file

### Step 3: Share with Testers

#### Option A: Direct APK Installation

1. **Enable Unknown Sources** on Android device:
   - Settings → Security → Install unknown apps
   - Enable for your file manager/browser

2. **Transfer APK**:
   - Email the APK file
   - Upload to Google Drive/Dropbox and share link
   - Transfer via USB

3. **Install**:
   - Tap the APK file on device
   - Click "Install"
   - Open the app

#### Option B: Internal Testing via Google Play Console

1. Upload the AAB (Android App Bundle) to **Google Play Console**
2. Create an **Internal Testing** track
3. Add testers by email
4. Testers receive invite link to install via Play Store

---

## 🔍 Troubleshooting

### Service Worker Not Registering

**Problem**: Service worker doesn't appear in DevTools.

**Solutions**:
- Ensure you're running `npm start` (production mode)
- Service worker is disabled in development by default
- Check browser console for errors
- Verify `public/sw.js` was generated during build

### Install Prompt Not Showing

**Problem**: Chrome doesn't show install button.

**Solutions**:
- Clear browser cache and cookies
- Must be on HTTPS (even localhost is OK in Chrome)
- Check Lighthouse PWA audit for failing criteria
- Manifest must be valid JSON
- Icons must be accessible (no 404 errors)

### Offline Page Not Working

**Problem**: Getting "No internet" error instead of offline page.

**Solutions**:
- Service worker needs time to cache assets (browse pages first)
- Check that `/[locale]/offline` route exists
- Verify runtime caching config in `next.config.ts`

### APK Builder Fails

**Problem**: PWA Builder shows errors.

**Solutions**:
- **Manifest not found**: Verify `https://yourdomain.com/manifest.json` is accessible
- **Service worker not found**: Check `https://yourdomain.com/sw.js` exists
- **HTTPS required**: Deploy to HTTPS domain (localhost won't work)
- **Icons missing**: Verify all icon URLs return 200 status

---

## 📊 Testing Checklist

Before sharing with testers, verify:

### Desktop Testing
- [ ] App installs successfully (Chrome/Edge)
- [ ] Service worker registers and activates
- [ ] Manifest loads without errors
- [ ] Offline mode works (cached content accessible)
- [ ] App opens in standalone window
- [ ] Theme color applies correctly
- [ ] Both English and Arabic locales work

### Mobile Testing (Browser)
- [ ] Visit site on mobile browser (Chrome/Safari)
- [ ] Install prompt appears (Chrome Android)
- [ ] "Add to Home Screen" works (Safari iOS)
- [ ] Installed app opens in fullscreen
- [ ] Offline functionality works on mobile
- [ ] Icons and splash screen display correctly

### APK Testing
- [ ] APK installs on Android device
- [ ] App icon appears in launcher
- [ ] App opens and loads homepage
- [ ] Navigation works correctly
- [ ] Offline mode functions properly
- [ ] Authentication persists across app restarts
- [ ] Shopping cart persists

---

## 🚀 Next Steps

### 1. Deploy to Production
```bash
# Example: Vercel deployment
cd frontend
vercel --prod
```

### 2. Generate APK
- Use PWA Builder with your live domain
- Download and test APK
- Share with testers

### 3. Monitor Analytics
- Track install events via Vercel Analytics (already integrated)
- Monitor service worker cache hit rates
- Measure offline usage patterns

### 4. Optional Enhancements (Future)
- **Push Notifications** - Notify users of order updates
- **Background Sync** - Sync cart when connection restored
- **App Shortcuts** - Quick actions from home screen icon
- **Screenshots** - Add app screenshots to manifest for better install prompt

---

## 📝 Files Modified Summary

| File | Changes |
|------|---------|
| `frontend/package.json` | Added `next-pwa` dependency |
| `frontend/next.config.ts` | PWA plugin configuration + cache strategies |
| `frontend/app/[locale]/layout.tsx` | PWA metadata + viewport config |
| `frontend/public/manifest.json` | **(NEW)** PWA manifest with app metadata |
| `frontend/public/icon-*.png` | **(NEW)** 4 icon files for PWA |
| `frontend/app/[locale]/offline/page.tsx` | **(NEW)** Offline fallback page |
| `frontend/app/[locale]/install/page.tsx` | **(NEW)** PWA installation guide |
| `frontend/next-pwa.d.ts` | **(NEW)** TypeScript declarations |

---

## ✨ Success Criteria

Your PWA is ready when:

✅ Lighthouse PWA score is **90+**  
✅ Service worker is registered and caching works  
✅ App can be installed on desktop and mobile  
✅ Offline pages load successfully  
✅ APK installs and runs on Android  
✅ Both English and Arabic locales work offline  
✅ Cart and auth persist across sessions  

---

**Congratulations! Your Al-Atmor app is now a fully functional PWA ready for APK distribution! 🎉**
