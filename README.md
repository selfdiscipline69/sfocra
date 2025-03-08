```markdown
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Testing on Physical iOS Device from Windows

If you're developing on a Windows PC and want to test your app on a physical iOS device, follow these steps:

### Prerequisites

- iPhone or iPad running iOS 13 or newer
- Expo Go App installed from the App Store
- Both your Windows PC and iOS device on the same Wi-Fi network
- Expo CLI installed on your Windows PC

### Steps

1. Start your Expo project with tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

2. Connect your iOS device:
   - Open the **Expo Go** app on your iOS device
   - Tap on "Scan QR Code"
   - Scan the QR code displayed in your terminal/browser
   - Your app should load on the iOS device

### Benefits

- Test on actual iOS hardware with real-world performance
- Access to native features (camera, notifications, sensors)
- Experience iOS-specific UI elements and behaviors
- No Mac required for iOS testing

### Troubleshooting

- **Connection issues**: Try restarting the Expo server with `--tunnel` flag
- **QR code not scanning**: Check your camera permissions
- **App fails to load**: Verify your network connection or restart Expo Go
- **"Could not connect to server"**: Check your Windows firewall settings

Note: While this method allows iOS testing, you cannot create an iOS build file (IPA) without a Mac.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
```