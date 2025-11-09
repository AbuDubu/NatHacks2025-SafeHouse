# Assets Directory

This directory should contain your app's image assets.

## Required Assets

Create the following files:

- `icon.png` - App icon (1024x1024 recommended)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon
- `notification-icon.png` - Notification icon

## Quick Setup

For development, you can use placeholder images or remove the references in `app.json`.

### Option 1: Use Expo's Default Assets

Run:
```bash
npx expo prebuild --clean
```

This will generate default assets for you.

### Option 2: Create Placeholder Images

Use any image editing tool to create simple colored squares:
- icon.png: 1024x1024px
- splash.png: 1284x2778px (iPhone 13 Pro Max resolution)
- adaptive-icon.png: 1024x1024px
- favicon.png: 48x48px
- notification-icon.png: 96x96px

### Option 3: Temporarily Remove Asset References

Edit `app.json` and comment out or remove the asset paths until you're ready to add proper images.

## Production

For production builds, replace these with your actual app branding and design assets.

