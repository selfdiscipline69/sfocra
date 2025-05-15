# iOS Code Signing Setup for GitHub Actions

This document explains how to set up the required secrets and variables for the iOS TestFlight deployment workflow.

## Required GitHub Secrets & Variables

You've already set up the necessary secrets and variables:

### Secrets
- `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password for your Apple ID
- `APPLE_PRIVATE_KEY`: Base64-encoded App Store Connect API private key (p8 file)

### Variables
- `APPLE_TEAM_ID`: Your Apple Developer Team ID (from Apple Developer Portal)
- `BUNDLE_IDENTIFIER`: Your app's bundle identifier (e.g., org.name.Sfocra)
- `APPSTORE_ISSUER_ID`: App Store Connect API Issuer ID
- `APPSTORE_KEY_ID`: App Store Connect API Key ID

## What is a CI Machine?

A CI (Continuous Integration) machine is simply a computer in the cloud that runs your build processes automatically. 

In simple terms:
1. When you push code to GitHub, it triggers your workflow
2. GitHub spins up a fresh macOS computer (the CI machine)
3. Your workflow runs on this computer - installing dependencies, building your app, etc.
4. The computer handles compiling your app and uploading it to TestFlight
5. When the job is done, the CI machine is discarded

It's like having a virtual assistant who takes your code, builds it on a Mac, and submits it to Apple - all automatically.

## How This Works

This workflow uses App Store Connect API keys instead of certificates and provisioning profiles:

1. The API key authenticates with Apple to handle the TestFlight upload
2. The Team ID configures your project for building
3. The workflow modifies the Xcode project to include the proper team and bundle ID
4. Fastlane builds and uploads the app

## How to Generate the Required Keys

### App Store Connect API Key

1. Go to App Store Connect > Users and Access > Keys
2. Create a new key with App Manager permissions
3. Download the p8 file
4. Note the Key ID and Issuer ID
5. Convert to base64: `base64 -i AuthKey_KEYID.p8 | pbcopy`

### App-Specific Password

1. Go to https://appleid.apple.com/
2. Sign in with your Apple ID
3. Go to Security > App-Specific Passwords
4. Generate a new password for "GitHub Actions"

## Troubleshooting

If you encounter code signing issues:

1. Verify your Team ID matches your Apple Developer Team ID
2. Make sure the App Store Connect API key has proper permissions
3. Check that the bundle identifier in the workflow matches your app's bundle ID